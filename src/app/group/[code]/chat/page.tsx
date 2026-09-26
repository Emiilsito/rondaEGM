"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import { NavPills } from "@/components/leaderboard";
import { useRonda } from "@/components/ronda-provider";
import {
  fetchGroupMessages,
  sendMessage,
  subscribeToMessages,
  type ChatMessage,
} from "@/lib/chat";

export default function ChatPage() {
  const params = useParams<{ code: string }>();
  const { player, groups, resolveName } = useRonda();
  const code = String(params.code || "").toUpperCase();
  const group = groups.find((g) => g.code === code);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!group) return;

    let unsubscribe: (() => void) | undefined;

    async function load() {
      const msgs = await fetchGroupMessages(group!.id);
      setMessages(msgs);
      unsubscribe = subscribeToMessages(group!.id, (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    }

    load();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [group]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!player || !group || !input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(group.id, player.id, player.name, input);
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const displayCode = group?.code || code;

  if (!group) {
    return (
      <AppShell>
        <BrandMark />
        <NavPills groupCode={displayCode} active="chat" />
        <p className="mt-8 text-sm font-semibold text-[color:var(--muted)]">
          Grupo no encontrado.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <BrandMark />
      <NavPills groupCode={group.code} active="chat" />

      <div className="mt-4 flex h-[60vh] flex-col rounded-[24px] bg-[color:var(--surface)] p-4 shadow-[var(--soft-shadow)]">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm font-semibold text-[color:var(--muted)]">
              No hay mensajes aún. ¡Escribe el primero!
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.playerId === player?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-[color:var(--brand)] text-[color:var(--brand-ink)]"
                      : "bg-[color:var(--surface-muted)] text-[#1a1a1f]"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-extrabold opacity-60">
                      {msg.playerName}
                    </p>
                  )}
                  <p className="text-sm font-semibold">{msg.text}</p>
                  <p className="text-[10px] opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString("es", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Escribe un mensaje..."
            maxLength={200}
            className="h-11 flex-1 rounded-full border-0 bg-[color:var(--surface-muted)] px-4 text-sm font-semibold text-[#1a1a1f] placeholder:text-black/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="grid size-11 place-items-center rounded-full bg-[color:var(--brand)] text-[color:var(--brand-ink)] disabled:opacity-40"
          >
            {sending ? "..." : "→"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
