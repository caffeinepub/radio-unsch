/**
 * Diseño 3 — CIRUELA
 * Fondo berenjena/ciruela profundo, acentos malva/rosa viejo apagado.
 * Estilo: lounge sofisticado, íntimo y elegante. Sin neón.
 */
import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime, useRadioPlayer } from "../hooks/useRadioPlayer";

function EQPlum({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const barsRef = useRef(
    Array.from({ length: 20 }, (_, i) => {
      const isBass = i < 5;
      const isTreble = i >= 14;
      return {
        current: Math.random() * 0.3 + 0.1,
        target: Math.random() * 0.6 + 0.15,
        peak: 0,
        peakTimer: 0,
        speed: isBass ? 0.04 : isTreble ? 0.13 : 0.08,
        maxH: isBass ? 1.0 : isTreble ? 0.6 : 0.85,
        changeTimer: 0,
        changeInterval: isBass ? 24 : isTreble ? 7 : 14,
      };
    }),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const bars = barsRef.current;
    const N = bars.length;
    const barW = Math.floor((W - (N - 1) * 2) / N);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!isPlaying) {
        for (let i = 0; i < N; i++) {
          ctx.fillStyle = "rgba(80,30,60,0.25)";
          ctx.beginPath();
          ctx.roundRect(i * (barW + 2), H - 3, barW, 3, 2);
          ctx.fill();
        }
        return;
      }
      for (let i = 0; i < N; i++) {
        const bar = bars[i];
        bar.changeTimer++;
        if (bar.changeTimer >= bar.changeInterval) {
          bar.changeTimer = 0;
          const isBass = i < 5;
          const isTreble = i >= 14;
          const minH = isBass ? 0.25 : isTreble ? 0.05 : 0.1;
          bar.target = minH + Math.random() * (bar.maxH - minH);
          if (Math.random() < 0.15) bar.target *= 0.2;
        }
        bar.current += (bar.target - bar.current) * bar.speed;
        if (bar.current > bar.peak) {
          bar.peak = bar.current;
          bar.peakTimer = 22;
        } else {
          bar.peakTimer--;
          if (bar.peakTimer <= 0) {
            bar.peak -= 0.012;
            if (bar.peak < bar.current) bar.peak = bar.current;
          }
        }
        const x = i * (barW + 2);
        const barHeight = Math.max(3, Math.round(bar.current * (H - 4)));
        const peakY = Math.max(0, H - Math.round(bar.peak * (H - 4)) - 3);
        const grad = ctx.createLinearGradient(0, H - barHeight, 0, H);
        grad.addColorStop(0, "#d4a0b8");
        grad.addColorStop(0.5, "#9040708");
        grad.addColorStop(1, "#4a1030");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, H - barHeight, barW, barHeight, [2, 2, 0, 0]);
        ctx.fill();
        if (bar.peak > 0.06) {
          ctx.fillStyle = "rgba(212,160,184,0.7)";
          ctx.beginPath();
          ctx.roundRect(x, peakY, barW, 2, 1);
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={48}
      style={{ display: "block" }}
    />
  );
}

export function RadioDesign3() {
  const player = useRadioPlayer();
  const [cardVisible, setCardVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const {
    isPlaying,
    status,
    errorMsg,
    albumArt,
    songTitle,
    artistName,
    albumName,
    elapsed,
    duration,
    remaining,
    nextTitle,
    nextArtist,
    metaLoading,
    currentVolume,
    isMuted,
    volume,
    handleTogglePlay,
    handleVolumeChange,
    toggleMute,
    scheduleReconnect,
    attemptResume,
    audioRef,
    silentAudioRef,
    SILENT_AUDIO_SRC,
    LOGO_URL,
  } = player;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "#0c0410" }}
    >
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(80,20,60,0.28) 0%, rgba(50,10,40,0.1) 55%, transparent 80%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 75% 15%, rgba(140,60,100,0.07) 0%, transparent 70%)",
        }}
      />

      {/* biome-ignore lint/a11y/useMediaCaption: streaming radio */}
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        x-webkit-airplay="allow"
        onError={() => scheduleReconnect()}
        onStalled={() => scheduleReconnect()}
        onEnded={() => scheduleReconnect()}
        onPause={() => {
          if ((audioRef.current as any)?.__isPlaying) attemptResume();
        }}
        onPlay={() => {}}
        onWaiting={() => {}}
        onCanPlay={() => {}}
      />
      {/* biome-ignore lint/a11y/useMediaCaption: silent keep-alive */}
      <audio
        ref={silentAudioRef}
        src={SILENT_AUDIO_SRC}
        preload="auto"
        playsInline
        loop
      />

      <div
        className={`w-full max-w-sm transition-all duration-700 ${
          cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          className="relative rounded-3xl p-7 flex flex-col items-center gap-5"
          style={{
            background: "rgba(18,5,22,0.72)",
            backdropFilter: "blur(40px) saturate(160%)",
            boxShadow:
              "0 0 80px rgba(100,30,80,0.16), 0 2px 0 rgba(160,80,120,0.06) inset",
            border: "1px solid rgba(120,40,90,0.18)",
          }}
        >
          {/* EN VIVO */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-all${isPlaying ? " live-dot-red-blink" : ""}`}
              style={{ background: isPlaying ? "#c0392b" : "#4b5563" }}
            />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: isPlaying ? "#4ade80" : "#6b7280" }}
            >
              EN VIVO
            </span>
          </div>

          {/* Vinyl — octagonal (clip-path) */}
          <div className="relative mt-4" style={{ width: 160, height: 160 }}>
            {isPlaying && (
              <div
                className="pulse-ring absolute inset-0"
                style={{
                  border: "1.5px solid rgba(160,70,120,0.4)",
                  margin: "-10px",
                  borderRadius: "50%",
                }}
              />
            )}
            <div
              className={`w-40 h-40 overflow-hidden ${isPlaying ? "vinyl-spinning" : ""}`}
              style={{
                borderRadius: "32% 68% 55% 45% / 48% 40% 60% 52%",
                boxShadow: isPlaying
                  ? "0 0 0 3px rgba(140,50,100,0.45), 0 0 50px rgba(80,20,60,0.3)"
                  : "0 0 0 2px rgba(60,15,45,0.25)",
              }}
            >
              <img
                src={albumArt || LOGO_URL}
                alt="Radio UNSCH"
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = LOGO_URL;
                }}
              />
            </div>
          </div>

          <p
            className="text-base font-semibold tracking-[0.25em] uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#c090a8",
            }}
          >
            Radio UNSCH
          </p>

          <div
            style={{
              opacity: isPlaying && status === "playing" ? 1 : 0.35,
              transition: "opacity 0.4s",
            }}
          >
            <EQPlum isPlaying={isPlaying && status === "playing"} />
          </div>

          {/* Metadata panel */}
          <div
            className="w-full rounded-2xl px-4 py-3"
            style={{
              background: "rgba(12,3,16,0.8)",
              border: "1px solid rgba(110,40,80,0.18)",
            }}
          >
            {status === "loading" ? (
              <div
                className="flex items-center gap-2 justify-center py-1"
                style={{ color: "#70305a" }}
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{errorMsg || "Conectando..."}</span>
              </div>
            ) : status === "error" ? (
              <p className="text-sm text-center" style={{ color: "#f87171" }}>
                {errorMsg}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{ color: "#deb8cc" }}
                >
                  {metaLoading && !isPlaying
                    ? "En vivo - Radio UNSCH"
                    : songTitle}
                </p>
                <div className="flex items-center gap-1.5">
                  <Music className="w-3 h-3" style={{ color: "#a06080" }} />
                  <p className="text-xs" style={{ color: "#b87898" }}>
                    {artistName}
                  </p>
                </div>
                {albumName && (
                  <p className="text-[10px]" style={{ color: "#7a3858" }}>
                    {albumName}
                  </p>
                )}
              </div>
            )}
            {duration > 0 && (
              <div className="mt-2">
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: "2px", background: "rgba(80,20,55,0.2)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                      background: "linear-gradient(90deg,#4a1030,#c090a8)",
                      borderRadius: "9999px",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span
                    className="text-[9px]"
                    style={{ color: "rgba(160,80,120,0.5)" }}
                  >
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: "rgba(160,80,120,0.5)" }}
                  >
                    -{formatTime(remaining)}
                  </span>
                </div>
              </div>
            )}
            {nextTitle && (
              <p
                className="text-[9px] mt-1.5"
                style={{ color: "rgba(90,30,65,0.65)" }}
              >
                A continuación:{" "}
                <span style={{ color: "rgba(192,144,168,0.65)" }}>
                  {nextArtist && `${nextArtist} — `}
                  {nextTitle}
                </span>
              </p>
            )}
          </div>

          {/* Volume */}
          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              style={{ color: "#a06080" }}
              aria-label={isMuted ? "Activar" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={currentVolume}
              onChange={(e) => handleVolumeChange([Number(e.target.value)])}
              style={
                {
                  WebkitAppearance: "none",
                  appearance: "none",
                  height: "4px",
                  borderRadius: "9999px",
                  outline: "none",
                  cursor: "pointer",
                  flex: 1,
                  background: `linear-gradient(to right, #4a1030, #c090a8 ${currentVolume}%, rgba(80,20,55,0.15) ${currentVolume}%, rgba(80,20,55,0.15) 100%)`,
                } as React.CSSProperties
              }
              className="flex-1"
              aria-label="Volumen"
            />
            <span
              className="text-[10px] w-7 text-right"
              style={{ color: "rgba(160,80,120,0.6)" }}
            >
              {currentVolume}%
            </span>
          </div>

          {/* Play button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="play-btn w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50"
            style={{
              background: isPlaying
                ? "rgba(100,30,70,0.22)"
                : "rgba(60,15,45,0.12)",
              border: "2px solid rgba(160,80,120,0.4)",
              boxShadow: isPlaying
                ? "0 0 30px rgba(160,80,120,0.2), 0 0 0 6px rgba(100,30,70,0.08)"
                : "0 0 16px rgba(100,30,70,0.15)",
              color: "#deb8cc",
            }}
          >
            {status === "loading" ? (
              <Radio className="w-7 h-7 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
