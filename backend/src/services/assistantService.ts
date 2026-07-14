import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { AuthenticatedUser } from "../middleware/auth";

const SYSTEM_PROMPT = `
You are an assistant embedded in a project & task management platform, helping an admin or
project manager understand what's happening across their projects and tasks. You will be given
a plain-text export of projects and tasks (title, status, priority, progress, assignee, due date)
followed by a question or instruction.

Rules:
- Only use the data provided. Do not invent tasks, people, or projects that are not present.
- If the data doesn't answer the question, say so plainly rather than guessing.
- Be concise and skimmable - use short paragraphs or bullet points.
- When asked about a specific person or project, filter to only the relevant lines.
`.trim();

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function buildContext(requester: AuthenticatedUser): Promise<string> {
  const projectWhere =
    requester.role === "ADMIN"
      ? {}
      : requester.role === "PROJECT_MANAGER"
        ? { managerId: requester.id }
        : { members: { some: { userId: requester.id } } };

  const projects = await prisma.project.findMany({
    where: projectWhere,
    include: {
      manager: { select: { name: true } },
      tasks: {
        include: { assignee: { select: { name: true } } },
      },
    },
  });

  if (projects.length === 0) {
    return "No projects or tasks are available for this user yet.";
  }

  let text = "Projects and their tasks:\n";
  for (const p of projects) {
    text += `\nProject: ${p.name} | Status: ${p.status} | Manager: ${p.manager.name}\n`;
    if (p.tasks.length === 0) {
      text += "  (no tasks yet)\n";
      continue;
    }
    for (const t of p.tasks) {
      text += `  - ${t.title} | Status: ${t.status} | Priority: ${t.priority} | Progress: ${t.progress}% | Assignee: ${t.assignee?.name ?? "unassigned"} | Due: ${t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "n/a"}\n`;
    }
  }
  return text;
}

async function callGemini(userPrompt: string): Promise<string> {
  if (!env.geminiApiKey) {
    throw ApiError.badRequest(
      "The AI assistant is not configured. Set GEMINI_API_KEY on the server to enable it."
    );
  }

  const url = `${env.geminiBaseUrl}/models/${env.geminiModel}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw ApiError.badRequest(`AI assistant request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw ApiError.badRequest("The AI assistant returned an empty response. Please try again.");
  }
  return text;
}

export const assistantService = {
  async chat(question: string, requester: AuthenticatedUser) {
    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("The AI assistant is available to managers and admins only");
    }
    const context = await buildContext(requester);
    return callGemini(`${context}\n\nQuestion: ${question}`);
  },

  async summary(requester: AuthenticatedUser) {
    if (requester.role === "TEAM_MEMBER") {
      throw ApiError.forbidden("The AI assistant is available to managers and admins only");
    }
    const context = await buildContext(requester);
    const instruction = `
Based on the data above, write a short status summary with three sections:
1. Overall progress highlights
2. At-risk or blocked items
3. Workload distribution across assignees
Keep the whole thing under 200 words.
`.trim();
    return callGemini(`${context}\n\n${instruction}`);
  },
};
