"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Disc3, Clock3, Quote } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isLoadingCommand?: boolean;
  isIntro?: boolean;
};

type ChatStreamEvent =
  | { type: "assistant_delta"; text: string }
  | { type: "assistant_done" }
  | { type: "command_loading"; loading: boolean; label?: string }
  | { type: "error"; error: string };

// Styled as a record's side/track index (A1, A2, B1, B2) rather than generic
// numbering — the one bit of "numbering" here actually means something for
// a music app, instead of decorative 01/02/03 markers.
const STARTERS = [
  { tag: "A1", icon: Quote, label: "Summarize my last 30 days in a funny way." },
  { tag: "A2", icon: Disc3, label: "Which artist did I overplay then stop listening to?" },
  { tag: "B1", icon: Clock3, label: "What genres do I listen to late at night?" },
  { tag: "B2", icon: Disc3, label: "Recommend tracks from my own history that I forgot about." },
];

const INTRO_MESSAGE: ChatMessage = {
  role: "assistant",
  isIntro: true,
  content:
    "Ask me about your Echo Stats listening history. I stream answers from Google AI using a compact private summary of your streams — not your Spotify tokens or live account controls.",
};

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Flips true the moment the user sends anything, live or via a starter.
  // Guards against a slow-resolving hydration fetch overwriting a
  // conversation that already started while it was in flight.
  const hasStartedRef = useRef(false);

  // Resume the single running history on load. Falls back to the canned
  // intro (already the initial state) if there's nothing saved yet, or if
  // the fetch fails — history is a nice-to-have, not a blocker.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/chat");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        if (
          !cancelled &&
          !hasStartedRef.current &&
          Array.isArray(data.messages) &&
          data.messages.length > 0
        ) {
          setMessages(data.messages as ChatMessage[]);
        }
      } catch {
        // Silent — nothing to recover, the intro message already covers it.
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Exclude the canned intro and any placeholder/empty/loading bubbles —
  // these are UI-only state and are never valid to send upstream, since the
  // API rejects empty message content.
  const requestMessages = useMemo(
    () =>
      messages
        .filter((message) => !message.isIntro)
        .filter((message) => !message.isLoadingCommand && message.content.trim().length > 0),
    [messages]
  );

  const hasRealMessages = messages.some((message) => !message.isIntro);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    hasStartedRef.current = true;

    const clientRequestId = `c_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[ai-chat][${clientRequestId}] submit ->`, { question: trimmed });

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Client-Request-Id": clientRequestId },
        body: JSON.stringify({ messages: [...requestMessages, { role: "user", content: trimmed }].slice(-8) }),
      });

      console.log(`[ai-chat][${clientRequestId}] fetch responded`, {
        ok: res.ok,
        status: res.status,
        serverRequestId: res.headers.get("x-chat-request-id"),
        contentType: res.headers.get("content-type"),
        hasBody: !!res.body,
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
      let chunkCount = 0;
      let eventCount = 0;

      function applyEvent(event: ChatStreamEvent) {
        eventCount += 1;
        console.log(`[ai-chat][${clientRequestId}] event`, { type: event.type, assistantIndex });

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

      // Parses whatever complete lines are available and returns any
      // leftover partial line so the caller can hold onto it.
      function processBuffer(raw: string, isFinal: boolean) {
        const lines = raw.split("\n");
        const remainder = isFinal ? "" : lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            applyEvent(JSON.parse(line) as ChatStreamEvent);
          } catch (parseErr) {
            // Previously this threw uncaught inside the read loop and
            // silently aborted rendering with no visible error — logging
            // the raw line here is the key diagnostic if a chunk gets
            // split mid-JSON by a proxy.
            console.error(`[ai-chat][${clientRequestId}] failed to parse NDJSON line`, {
              line,
              message: parseErr instanceof Error ? parseErr.message : String(parseErr),
            });
          }
        }
        return remainder;
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log(`[ai-chat][${clientRequestId}] reader done`, {
            chunkCount,
            eventCount,
            leftoverBufferLen: buffer.length,
          });
          // Flush whatever's left — previously any trailing partial line
          // that never got a newline was silently dropped here.
          if (buffer.trim()) {
            console.warn(`[ai-chat][${clientRequestId}] flushing unterminated trailing buffer`, { buffer });
            processBuffer(buffer, true);
          }
          break;
        }

        chunkCount += 1;
        const decoded = decoder.decode(value, { stream: true });
        console.log(`[ai-chat][${clientRequestId}] chunk received`, { chunkCount, bytes: value.length, decodedLen: decoded.length });
        buffer += decoded;
        buffer = processBuffer(buffer, false);
      }
    } catch (err) {
      console.error(`[ai-chat][${clientRequestId}] submitQuestion FAILED`, {
        name: err instanceof Error ? err.name : undefined,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : "AI chat failed");
      setMessages((current) => {
        const last = current[current.length - 1];
        return last?.role === "assistant" && !last.isLoadingCommand && last.content === ""
          ? current.slice(0, -1)
          : current;
      });
    } finally {
      setIsLoading(false);
      console.log(`[ai-chat][${clientRequestId}] finished`);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---------------------------------------------------------------- */}
      {/* Header — set like a page slug: catalog-style eyebrow + a serif   */}
      {/* headline, no glow/blob decoration.                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-white/40">
          <Disc3 size={13} strokeWidth={1.75} />
          <span className="[font-family:'IBM_Plex_Mono',ui-monospace,monospace] text-[11px] font-medium uppercase tracking-[0.2em]">
            Echo Stats — Transcript
          </span>
        </div>
        <h1 className="[font-family:'Newsreader',Georgia,serif] text-3xl font-medium italic tracking-tight text-white md:text-4xl">
          Ask your listening history a question.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-white/45">
          Answers are grounded in a private summary of your imported streams — not your Spotify tokens or
          live account controls.
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Starters — a track listing (side/number), not a card grid.       */}
      {/* ---------------------------------------------------------------- */}
      {!hasRealMessages && !isHydrating && (
        <div className="flex flex-col border border-white/10">
          {STARTERS.map(({ tag, icon: Icon, label }, index) => (
            <button
              key={tag}
              onClick={() => void submitQuestion(label)}
              disabled={isLoading}
              className={`group flex items-center gap-4 px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/[0.04] ${
                index !== STARTERS.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <span className="[font-family:'IBM_Plex_Mono',ui-monospace,monospace] w-7 shrink-0 text-xs text-white/30">
                {tag}
              </span>
              <Icon size={14} strokeWidth={1.75} className="shrink-0 text-white/30 group-hover:text-white/60" />
              <span className="flex-1 text-sm leading-relaxed text-white/70 group-hover:text-white">
                {label}
              </span>
              <ArrowUp
                size={13}
                className="shrink-0 rotate-45 text-white/0 transition group-hover:text-white/50"
              />
            </button>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Transcript — speaker tags down a spine, no chat bubbles.         */}
      {/* User turns get a solid inverted stamp; the assistant sits        */}
      {/* directly on the page. That contrast carries the whole read.      */}
      {/* ---------------------------------------------------------------- */}
      <section className="flex flex-col border border-white/10">
        <div ref={scrollRef} className="max-h-[54vh] min-h-[380px] flex-1 space-y-6 overflow-y-auto px-5 py-6 md:px-7">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className="flex gap-4">
              <span
                className={`[font-family:'IBM_Plex_Mono',ui-monospace,monospace] w-14 shrink-0 pt-1 text-[10px] uppercase tracking-[0.18em] ${
                  message.role === "user" ? "text-white/70" : "text-white/30"
                }`}
              >
                {message.role === "user" ? "You" : "Analyst"}
              </span>

              <div className="min-w-0 flex-1">
                {message.isLoadingCommand ? (
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{message.content}</span>
                    <EqBars />
                  </div>
                ) : message.role === "user" ? (
                  <span className="inline-block whitespace-pre-wrap bg-white px-3 py-1.5 text-sm leading-relaxed text-black">
                    {message.content}
                  </span>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                    {message.content}
                    {isLoading && index === messages.length - 1 && message.content && <Caret />}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Only shown before anything real has happened — a live send
              flips hasRealMessages immediately, so this never sits on top
              of (or hides) an actual conversation. */}
          {isHydrating && !hasRealMessages && (
            <div className="flex items-center gap-3 text-xs text-white/30">
              <EqBars />
              <span>Resuming your last conversation…</span>
            </div>
          )}

          {isLoading &&
            !messages.some((message) => message.isLoadingCommand) &&
            (messages[messages.length - 1]?.role !== "assistant" ||
              messages[messages.length - 1]?.content === "") && (
              <div className="flex items-center gap-4 text-xs text-white/35">
                <span className="[font-family:'IBM_Plex_Mono',ui-monospace,monospace] w-14 shrink-0 uppercase tracking-[0.18em]">
                  Analyst
                </span>
                <div className="flex items-center gap-2">
                  <EqBars />
                  <span>Reading the log…</span>
                </div>
              </div>
            )}
        </div>

        {error && (
          <div className="mx-5 mb-4 border border-white/20 px-4 py-3 text-xs leading-relaxed text-white/70 md:mx-7">
            <span className="[font-family:'IBM_Plex_Mono',ui-monospace,monospace] mr-2 text-white/40">
              Error —
            </span>
            {error}
          </div>
        )}

        {/* Input — an underline, not a pill. */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-3 border-t border-white/10 px-5 py-4 md:px-7"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={1500}
            placeholder="Ask about eras, artists, nostalgia, night listening…"
            className="min-w-0 flex-1 border-b border-transparent bg-transparent py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40"
          />
          <button
            disabled={isLoading || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40"
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </form>
      </section>

      <style jsx global>{`
        @keyframes eq-bar {
          0%,
          100% {
            transform: scaleY(0.35);
          }
          50% {
            transform: scaleY(1);
          }
        }
        @keyframes caret-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .eq-bar,
          .caret {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Four-bar level meter standing in for a spinner — quieter than bouncing
// dots, and it reads as "listening to the data" rather than generic loading.
function EqBars() {
  const delays = ["0ms", "120ms", "60ms", "180ms"];
  return (
    <span className="flex h-3 items-end gap-[3px]">
      {delays.map((delay, index) => (
        <span
          key={index}
          className="eq-bar w-[2.5px] origin-bottom bg-white/50"
          style={{
            height: "100%",
            animation: "eq-bar 0.9s ease-in-out infinite",
            animationDelay: delay,
          }}
        />
      ))}
    </span>
  );
}

function Caret() {
  return (
    <span
      className="caret ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-white/70"
      style={{ animation: "caret-blink 1s step-start infinite" }}
    />
  );
}