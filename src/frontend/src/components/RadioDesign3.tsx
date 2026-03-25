/**
 * Diseño 3 — NEBULOSA VIOLETA
 * Fondo negro con nebulosa violeta/índigo suave, acentos violeta elegantes,
 * glassmorphism profundo, tipografía moderna, EQ en tonos violeta-lila.
 */
import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime, useRadioPlayer } from "../hooks/useRadioPlayer";

function EQViolet({ isPlaying }: { isPlaying: boolean }) {
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
          ctx.fillStyle = "rgba(100,60,180,0.2)";
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
        grad.addColorStop(0, "#c4b5fd");
        grad.addColorStop(0.5, "#7c3aed");
        grad.addColorStop(1, "#3b0764");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, H - barHeight, barW, barHeight, [2, 2, 0, 0]);
        ctx.fill();
        if (bar.peak > 0.06) {
          ctx.fillStyle = "rgba(196,181,253,0.7)";
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
      style={{ background: "#030108" }}
    >
      {/* Nebula background */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 45%, rgba(90,40,160,0.2) 0%, rgba(60,20,120,0.07) 55%, transparent 80%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 35% 25% at 30% 20%, rgba(120,60,200,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 25% 20% at 75% 80%, rgba(80,40,180,0.07) 0%, transparent 70%)",
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
          if ((audioRef.current as any)?.__playing) attemptResume();
        }}
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
        className={`w-full max-w-sm transition-all duration-700 ${cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div
          className="relative rounded-3xl p-7 flex flex-col items-center gap-5"
          style={{
            background: "rgba(8,2,18,0.65)",
            backdropFilter: "blur(40px) saturate(180%)",
            boxShadow:
              "0 0 80px rgba(100,40,200,0.12), 0 2px 0 rgba(160,100,255,0.05) inset",
            border: "1px solid rgba(120,60,220,0.12)",
          }}
        >
          {/* EN VIVO */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full${isPlaying ? " live-dot-red-blink" : ""}`}
              style={{ background: isPlaying ? "#c0392b" : "#4b5563" }}
            />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: isPlaying ? "#86efac" : "#6b7280" }}
            >
              EN VIVO
            </span>
          </div>

          {/* Vinyl */}
          <div className="relative mt-4">
            {isPlaying && (
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{
                  border: "1.5px solid rgba(140,80,240,0.4)",
                  margin: "-10px",
                }}
              />
            )}
            <div
              className={`w-40 h-40 rounded-full overflow-hidden ${isPlaying ? "vinyl-spinning" : ""}`}
              style={{
                boxShadow: isPlaying
                  ? "0 0 0 3px rgba(100,40,200,0.55), 0 0 50px rgba(90,30,180,0.3)"
                  : "0 0 0 2px rgba(80,30,150,0.2)",
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

          {/* Station */}
          <p
            className="text-base font-semibold tracking-[0.25em] uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#c4b5fd",
            }}
          >
            Radio UNSCH
          </p>

          {/* EQ */}
          <div
            style={{
              opacity: isPlaying && status === "playing" ? 1 : 0.35,
              transition: "opacity 0.4s",
            }}
          >
            <EQViolet isPlaying={isPlaying && status === "playing"} />
          </div>

          {/* Metadata */}
          <div
            className="w-full rounded-2xl px-4 py-3"
            style={{
              background: "rgba(4,1,12,0.75)",
              border: "1px solid rgba(100,50,200,0.18)",
            }}
          >
            {status === "loading" ? (
              <div
                className="flex items-center gap-2 justify-center py-1"
                style={{ color: "#7c3aed" }}
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{errorMsg || "Conectando..."}</span>
              </div>
            ) : status === "error" ? (
              <p className="text-sm text-center" style={{ color: "#b05050" }}>
                {errorMsg}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{ color: "#c4b5fd" }}
                >
                  {metaLoading && !isPlaying
                    ? "En vivo - Radio UNSCH"
                    : songTitle}
                </p>
                <div className="flex items-center gap-1.5">
                  <Music className="w-3 h-3" style={{ color: "#8b5cf6" }} />
                  <p className="text-xs" style={{ color: "#a78bfa" }}>
                    {artistName}
                  </p>
                </div>
                {albumName && (
                  <p className="text-[10px]" style={{ color: "#7c6ca0" }}>
                    {albumName}
                  </p>
                )}
              </div>
            )}
            {duration > 0 && (
              <div className="mt-2">
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: "2px", background: "rgba(100,40,180,0.18)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                      background: "linear-gradient(90deg,#5b21b6,#a78bfa)",
                      borderRadius: "9999px",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span
                    className="text-[9px]"
                    style={{ color: "rgba(140,100,220,0.5)" }}
                  >
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: "rgba(140,100,220,0.5)" }}
                  >
                    -{formatTime(remaining)}
                  </span>
                </div>
              </div>
            )}
            {nextTitle && (
              <p
                className="text-[9px] mt-1.5"
                style={{ color: "rgba(120,70,200,0.6)" }}
              >
                A continuación:{" "}
                <span style={{ color: "rgba(160,120,240,0.65)" }}>
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
              style={{ color: "#8b5cf6" }}
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
                  "--val": `${currentVolume}%`,
                  WebkitAppearance: "none",
                  appearance: "none",
                  height: "4px",
                  borderRadius: "9999px",
                  outline: "none",
                  cursor: "pointer",
                  flex: 1,
                  background: `linear-gradient(to right, #5b21b6, #a78bfa ${currentVolume}%, rgba(80,30,150,0.15) ${currentVolume}%, rgba(80,30,150,0.15) 100%)`,
                } as React.CSSProperties
              }
              aria-label="Volumen"
            />
            <span
              className="text-[10px] w-7 text-right"
              style={{ color: "rgba(120,80,200,0.55)" }}
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
                ? "rgba(100,40,200,0.18)"
                : "rgba(70,20,160,0.1)",
              border: "2px solid rgba(140,80,240,0.4)",
              boxShadow: isPlaying
                ? "0 0 30px rgba(120,50,220,0.25), 0 0 0 6px rgba(100,40,200,0.07)"
                : "0 0 16px rgba(100,40,200,0.12)",
              color: "#c4b5fd",
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
