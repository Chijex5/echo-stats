"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isLoadingCommand?: boolean;
};

type ChatStreamEvent =
  | { type: "assistant_delta"; text: string }
  | { type: "assistant_done" }
  | { type: "command_loading"; loading: boolean; label?: string }
  | { type: "error"; error: string };

const STARTERS = [
  "Summarize my last 30 days in a funny way.",
  "Which artist did I overplay then stop listening to?",
  "What genres do I listen to late at night?",
  "Recommend tracks from my own history that I forgot about.",
];

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about your Echo Stats listening history. I stream answers from Google AI using a compact private summary of your streams — not your Spotify tokens or live account controls.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMessages = useMemo(() => messages.filter((message) => message.role !== "assistant" || message.content !== messages[0]?.content), [messages]);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...requestMessages, { role: "user", content: trimmed }].slice(-8) }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "AI chat failed");
      }

      let assistantIndex = nextMessages.length;
      setMessages((current) => [...current, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function applyEvent(event: ChatStreamEvent) {
        if (event.type === "assistant_delta") {
          setMessages((current) =>
            current.map((message, index) =>
              index === assistantIndex
                ? { ...message, content: `${message.content}${event.text}` }
                : message
            )
          );
          return;
        }

        if (event.type === "assistant_done") {
          assistantIndex += 1;
          return;
        }

        if (event.type === "command_loading") {
          if (event.loading) {
            setMessages((current) => [
              ...current,
              {
                role: "assistant",
                content: event.label ?? "Working on that…",
                isLoadingCommand: true,
              },
              { role: "assistant", content: "" },
            ]);
            assistantIndex += 1;
          } else {
            setMessages((current) => current.filter((message) => !message.isLoadingCommand));
            assistantIndex -= 1;
          }
          return;
        }

        if (event.type === "error") {
          throw new Error(event.error);
        }
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          applyEvent(JSON.parse(line) as ChatStreamEvent);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI chat failed");
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-spotify/30 bg-spotify/10 px-3 py-1 text-xs font-semibold text-spotify">
            <Sparkles size={14} /> AI music analyst
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Chat with your listening history</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50">Ask natural-language questions about your imported Spotify history. Answers are grounded in your Echo Stats summary.</p>
        </div>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-2">
        {STARTERS.map((starter) => (
          <button key={starter} onClick={() => void submitQuestion(starter)} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/70 transition hover:border-spotify/40 hover:text-white">
            {starter}
          </button>
        ))}
      </div>

      <div className="max-h-[52vh] min-h-[360px] space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spotify/15 text-spotify"><Bot size={16} /></div>}
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-spotify text-black" : "bg-white/10 text-white/80"}`}>
              {message.content}
              {message.isLoadingCommand && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-spotify" />}
            </div>
            {message.role === "user" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"><User size={16} /></div>}
          </div>
        ))}
        {isLoading && <p className="text-sm text-white/40">Analyzing your listening patterns…</p>}
      </div>

      {error && <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <form onSubmit={onSubmit} className="mt-4 flex gap-3">
        <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={1500} placeholder="Ask about eras, artists, nostalgia, night listening…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-spotify/50" />
        <button disabled={isLoading || !input.trim()} className="inline-flex items-center gap-2 rounded-full bg-spotify px-5 py-3 text-sm font-bold text-black transition hover:bg-spotify/90 disabled:cursor-not-allowed disabled:opacity-50">
          <Send size={16} /> Send
        </button>
      </form>
    </section>
  );
}
