"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Clock3, Disc3, Send, Sparkles, User } from "lucide-react";

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
  { icon: Sparkles, label: "Summarize my last 30 days in a funny way." },
  { icon: Disc3, label: "Which artist did I overplay then stop listening to?" },
  { icon: Clock3, label: "What genres do I listen to late at night?" },
  { icon: Sparkles, label: "Recommend tracks from my own history that I forgot about." },
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Exclude the initial greeting (index 0) and any placeholder/empty/loading
  // bubbles — these are UI-only state and are never valid to send upstream,
  // since the API rejects empty message content.
  const requestMessages = useMemo(
    () =>
      messages
        .filter((message, index) => !(index === 0 && message.role === "assistant"))
        .filter((message) => !message.isLoadingCommand && message.content.trim().length > 0),
    [messages]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
    <div className="relative flex flex-col gap-8 overflow-hidden">
      {/* Ambient blobs — consistent with dashboard page */}
      <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
      <div className="absolute top-[30%] -left-40 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
      <div className="absolute bottom-0 -right-40 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-spotify/30 bg-spotify/10 px-3 py-1 text-xs font-semibold text-spotify">
          <Sparkles size={14} /> AI music analyst
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Chat with your listening history</h1>
        <p className="max-w-2xl text-sm text-white/50">
          Ask natural-language questions about your imported Spotify history. Answers are grounded in your Echo Stats summary — not your Spotify tokens or live account controls.
        </p>
      </div>

      {/* Starters */}
      {messages.length <= 1 && (
        <div className="grid gap-3 md:grid-cols-2">
          {STARTERS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => void submitQuestion(label)}
              disabled={isLoading}
              className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left text-sm text-white/70 transition hover:border-spotify/40 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-spotify/10 text-spotify transition group-hover:bg-spotify/20">
                <Icon size={14} />
              </span>
              <span className="leading-relaxed">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat panel */}
      <section className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30">
        <div ref={scrollRef} className="max-h-[54vh] min-h-[380px] flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-6">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spotify/15 text-spotify">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "bg-spotify text-white shadow-spotify/10"
                    : "border border-white/10 bg-white/[0.04] text-white/80"
                }`}
              >
                {message.isLoadingCommand ? (
                  <span className="flex items-center gap-2 text-white/60">
                    {message.content}
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-spotify [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-spotify [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-spotify" />
                    </span>
                  </span>
                ) : (
                  message.content
                )}
              </div>

              {message.role === "user" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 pl-11 text-xs text-white/40">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
              </span>
              Analyzing your listening patterns…
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 md:mx-6">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex items-center gap-3 border-t border-white/10 bg-black/20 p-4 md:p-5">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={1500}
            placeholder="Ask about eras, artists, nostalgia, night listening…"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-spotify/50"
          />
          <button
            disabled={isLoading || !input.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-spotify px-5 py-3 text-sm font-bold text-white transition hover:bg-spotify/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} /> Send
          </button>
        </form>
      </section>
    </div>
  );
}