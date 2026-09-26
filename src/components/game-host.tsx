"use client";

import { useEffect, useRef, useState } from "react";
import {
  isGameToHostMessage,
  type GameToHostMessage,
  type HostToGameMessage,
} from "@/lib/game-bridge";
import type { GameDefinition } from "@/lib/types";
import { cn } from "@/lib/utils";

type GameHostProps = {
  game: GameDefinition;
  seed: number;
  className?: string;
  onFinished: (score: number) => void;
};

type Phase = "loading" | "ready" | "playing" | "finished" | "error";

export function GameHost({ game, seed, className, onFinished }: GameHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    setPhase("loading");
    setLiveScore(null);
    setError(null);
  }, [game.id, seed]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isGameToHostMessage(event.data)) return;
      const msg = event.data as GameToHostMessage;
      if (msg.gameId !== game.id) return;

      if (msg.type === "ready") {
        setPhase("ready");
        const payload: HostToGameMessage = {
          type: "hostReady",
          seed,
          lang: "es",
          muted: false,
        };
        iframeRef.current?.contentWindow?.postMessage(payload, "*");
      }
      if (msg.type === "started") setPhase("playing");
      if (msg.type === "score") setLiveScore(msg.score);
      if (msg.type === "finished") {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setLiveScore(msg.score);
        setPhase("finished");
        onFinished(msg.score);
      }
      if (msg.type === "error") {
        setPhase("error");
        setError(msg.message);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [game.id, seed, onFinished]);

  const src = `${game.path}#lang=es&seed=${seed}&gameId=${game.id}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[32px] border-[6px] border-white shadow-[var(--pop-shadow)]",
        className,
      )}
      style={{ background: "var(--brand)" }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3">
        <div className="pill">
          <span>{game.name}</span>
        </div>
        {liveScore !== null && (
          <div className="pill bg-[#1a1a1f] text-white">
            {game.direction === "lower"
              ? `${Math.abs(liveScore).toFixed(2)}s`
              : game.unit === "level"
                ? `Nv. ${Math.round(liveScore)}`
                : `${Math.round(liveScore)}`}
          </div>
        )}
      </div>

      <iframe
        ref={iframeRef}
        title={game.name}
        src={src}
        className="aspect-[9/14] w-full border-0 bg-[#0d1524]"
        allow="autoplay"
      />

      {phase === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/20 text-sm font-bold text-white">
          Cargando…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 p-6 text-center text-sm font-semibold text-white">
          {error}
        </div>
      )}
    </div>
  );
}
