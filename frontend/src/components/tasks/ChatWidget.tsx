"use client";

import { useEffect, useRef, useState } from "react";
import { assistantApi, extractErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const reply = await assistantApi.chat(question);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Open assistant"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col rounded-xl border border-line bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <div className="font-display text-sm font-semibold text-ink">TaskFlow assistant</div>
          <div className="text-xs text-slate">Ask about projects, tasks, workload</div>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate hover:text-ink" aria-label="Close">✕</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="mt-4 text-center text-sm text-slate">
            Try asking:
            <div className="mt-2 flex flex-col gap-1.5">
              {["What's overdue right now?", "Who has the most tasks assigned?", "Summarize the blocked tasks"].map((q) => (
                <button key={q} onClick={() => setInput(q)} className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink hover:bg-paper">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "ml-8 rounded-lg bg-ink px-3 py-2 text-sm text-white" : "mr-8 rounded-lg bg-paper px-3 py-2 text-sm text-ink"}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
          {loading && <div className="mr-8 rounded-lg bg-paper px-3 py-2 text-sm text-slate">Thinking…</div>}
        </div>
      </div>

      {error && <div className="border-t border-red/30 bg-red/10 px-4 py-2 text-xs text-red">{error}</div>}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-line p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the assistant…" className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-accent" />
        <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
      </form>
    </div>
  );
}
