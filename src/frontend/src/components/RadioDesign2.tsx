/**
 * Diseño 2 — PLATA
 * Fondo antracita/gris profundo, acentos plata/platino. Sin color saturado.
 * Estilo: equipo de audio hi-fi de lujo. Minimalista y frío.
 */
import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime, useRadioPlayer } from "../hooks/useRadioPlayer";

function EQSilver({ isPlaying }: { isPlaying: boolean }) {
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
          ctx.fillStyle = "rgba(100,100,110,0.2)";
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
        grad.addColorStop(0, "#e8e8f0");
        grad.addColorStop(0.5, "#9090a0");
        grad.addColorStop(1, "#404050");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, H - barHeight, barW, barHeight, [2, 2, 0, 0]);
        ctx.fill();
        if (bar.peak > 0.06) {
          ctx.fillStyle = "rgba(220,220,235,0.7)";
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
      style={{ display: "block", width: "100%" }}
    />
  );
}

export function RadioDesign2() {
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
      className="h-screen w-screen flex flex-col relative overflow-hidden"
      style={{ background: "#080810" }}
    >
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(70,70,90,0.22) 0%, rgba(40,40,55,0.08) 55%, transparent 80%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 80% 20%, rgba(140,140,160,0.06) 0%, transparent 70%)",
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
        className={`flex-1 flex flex-col transition-all duration-700 ${
          cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Card que llena toda la pantalla */}
        <div
          className="flex-1 flex flex-col gap-5 p-6 relative"
          style={{
            background: "rgba(10,10,18,0.85)",
            backdropFilter: "blur(40px) saturate(140%)",
          }}
        >
          {/* EN VIVO */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-all${isPlaying ? " live-dot-red-blink" : ""}`}
              style={{ background: isPlaying ? "#c0392b" : "#4b5563" }}
            />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: isPlaying ? "#e8e8ff" : "#6b7280" }}
            >
              EN VIVO
            </span>
          </div>

          {/* Top row: album art + metadata desplazada a la derecha */}
          <div className="flex items-center gap-5 mt-8 pl-4">
            <div
              className={`w-28 h-28 rounded-xl overflow-hidden shrink-0 ${isPlaying ? "vinyl-spinning" : ""}`}
              style={{
                boxShadow: isPlaying
                  ? "0 0 0 2px rgba(160,160,185,0.4), 0 0 30px rgba(80,80,110,0.25)"
                  : "0 0 0 1px rgba(80,80,100,0.2)",
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
            <div className="flex flex-col gap-1.5 min-w-0 pl-3">
              <p
                className="text-xs font-bold tracking-[0.3em] uppercase"
                style={{ color: "#707088" }}
              >
                Radio UNSCH
              </p>
              <p
                className="text-base font-semibold leading-snug truncate"
                style={{ color: "#d8d8e8" }}
              >
                {metaLoading && !isPlaying ? "En vivo" : songTitle}
              </p>
              <div className="flex items-center gap-1">
                <Music
                  className="w-3 h-3 shrink-0"
                  style={{ color: "#8080a0" }}
                />
                <p className="text-xs truncate" style={{ color: "#9090b0" }}>
                  {artistName}
                </p>
              </div>
              {albumName && (
                <p className="text-[10px]" style={{ color: "#505068" }}>
                  {albumName}
                </p>
              )}
            </div>
          </div>

          {/* EQ */}
          <div
            style={{
              opacity: isPlaying && status === "playing" ? 1 : 0.3,
              transition: "opacity 0.4s",
            }}
          >
            <EQSilver isPlaying={isPlaying && status === "playing"} />
          </div>

          {/* Progress bar */}
          {duration > 0 && (
            <div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: "2px", background: "rgba(80,80,100,0.2)" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                    background: "linear-gradient(90deg,#404055,#b0b0c8)",
                    borderRadius: "9999px",
                    transition: "width 1s linear",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span
                  className="text-[9px]"
                  style={{ color: "rgba(140,140,160,0.5)" }}
                >
                  {formatTime(elapsed)}
                </span>
                <span
                  className="text-[9px]"
                  style={{ color: "rgba(140,140,160,0.5)" }}
                >
                  -{formatTime(remaining)}
                </span>
              </div>
            </div>
          )}

          {nextTitle && (
            <p
              className="text-[9px]"
              style={{ color: "rgba(100,100,120,0.6)" }}
            >
              A continuación:{" "}
              <span style={{ color: "rgba(180,180,200,0.6)" }}>
                {nextArtist && `${nextArtist} — `}
                {nextTitle}
              </span>
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-center" style={{ color: "#f87171" }}>
              {errorMsg}
            </p>
          )}

          {/* Volume + Play — horizontal, al fondo */}
          <div className="flex items-center gap-3 pb-4 mt-auto">
            <button
              type="button"
              onClick={toggleMute}
              style={{ color: "#7070a0" }}
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
                  height: "3px",
                  borderRadius: "9999px",
                  outline: "none",
                  cursor: "pointer",
                  flex: 1,
                  background: `linear-gradient(to right, #404055, #b0b0c8 ${currentVolume}%, rgba(60,60,80,0.15) ${currentVolume}%, rgba(60,60,80,0.15) 100%)`,
                } as React.CSSProperties
              }
              aria-label="Volumen"
            />
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={status === "loading"}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              className="play-btn w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 shrink-0"
              style={{
                background: isPlaying
                  ? "rgba(80,80,110,0.25)"
                  : "rgba(60,60,90,0.15)",
                border: "1.5px solid rgba(160,160,190,0.35)",
                boxShadow: isPlaying
                  ? "0 0 20px rgba(160,160,200,0.15)"
                  : "none",
                color: "#c8c8e0",
              }}
            >
              {status === "loading" ? (
                <Radio className="w-5 h-5 animate-pulse" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
