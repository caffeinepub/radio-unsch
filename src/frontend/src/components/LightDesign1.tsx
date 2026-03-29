import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useRadioPlayer } from "../hooks/useRadioPlayer";

// EQ canvas — coral/peach palette
function EQCoral({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(Array.from({ length: 20 }, () => 0.08));
  const peaksRef = useRef<number[]>(Array.from({ length: 20 }, () => 0.08));
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const barW = Math.floor(W / 20) - 2;

    for (let i = 0; i < 20; i++) {
      if (isPlaying) {
        const freqFactor = i < 5 ? 0.5 : i < 10 ? 0.9 : i < 16 ? 0.7 : 0.4;
        const speed = i < 5 ? 0.04 : i < 14 ? 0.08 : 0.14;
        const target = Math.random() * freqFactor;
        barsRef.current[i] += (target - barsRef.current[i]) * speed;
        barsRef.current[i] = Math.max(0.05, barsRef.current[i]);
        if (barsRef.current[i] > peaksRef.current[i]) {
          peaksRef.current[i] = barsRef.current[i];
        } else {
          peaksRef.current[i] = Math.max(
            barsRef.current[i],
            peaksRef.current[i] - 0.012,
          );
        }
      } else {
        barsRef.current[i] += (0.06 - barsRef.current[i]) * 0.1;
        peaksRef.current[i] = barsRef.current[i];
      }

      const x = i * (barW + 2);
      const barH = Math.max(4, barsRef.current[i] * H);
      const y = H - barH;

      const grad = ctx.createLinearGradient(0, y, 0, H);
      grad.addColorStop(0, "rgba(224, 112, 85, 0.9)");
      grad.addColorStop(0.5, "rgba(240, 150, 100, 0.85)");
      grad.addColorStop(1, "rgba(255, 200, 160, 0.7)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();

      // Peak
      const peakY = H - peaksRef.current[i] * H - 3;
      ctx.fillStyle = "rgba(180, 80, 55, 0.7)";
      ctx.fillRect(x, peakY, barW, 2);
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [isPlaying]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={48}
      style={{ width: "100%", maxWidth: 220, height: 48 }}
    />
  );
}

export function LightDesign1() {
  const {
    isPlaying,
    status,
    albumArt,
    songTitle,
    artistName,
    nextTitle,
    nextArtist,
    volume,
    isMuted,
    handleTogglePlay,
    handleVolumeChange,
    toggleMute,
    scheduleReconnect,
    attemptResume,
    audioRef,
    silentAudioRef,
    SILENT_AUDIO_SRC,
    LOGO_URL,
  } = useRadioPlayer();

  const currentVolume = isMuted ? 0 : volume;

  return (
    <div
      style={{
        background:
          "linear-gradient(160deg, #faf7f4 0%, #fde8e2 55%, #fef3ee 100%)",
        fontFamily: "'Figtree', sans-serif",
      }}
      className="h-full w-full flex flex-col items-center justify-between py-6 px-5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-1">
        <span
          style={{
            color: "#b85c42",
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          RADIO UNSCH
        </span>
        {/* EN VIVO badge */}
        <div className="flex items-center gap-1.5">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isPlaying ? "#c0392b" : "#bbb",
              display: "inline-block",
            }}
            className={isPlaying ? "live-dot-red-blink" : ""}
          />
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              fontWeight: 700,
              color: isPlaying ? "#27ae60" : "#aaa",
            }}
          >
            EN VIVO
          </span>
        </div>
      </div>

      {/* Album art — large circular */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          overflow: "hidden",
          border: "5px solid #f0cfc0",
          boxShadow: isPlaying
            ? "0 8px 40px rgba(224, 112, 85, 0.35), 0 2px 12px rgba(0,0,0,0.1)"
            : "0 4px 20px rgba(0,0,0,0.12)",
          transition: "box-shadow 0.5s",
          flexShrink: 0,
        }}
        className={isPlaying ? "vinyl-spinning" : ""}
      >
        <img
          src={albumArt || LOGO_URL}
          alt="Album art"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = LOGO_URL;
          }}
        />
      </div>

      {/* Song info */}
      <div
        className="flex flex-col items-center gap-0.5 text-center px-4"
        style={{ maxWidth: 280 }}
      >
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#3a2218",
            lineHeight: 1.3,
          }}
          className="line-clamp-2"
        >
          {songTitle}
        </p>
        <p style={{ fontSize: "0.8rem", color: "#7a5548", fontWeight: 500 }}>
          {artistName}
        </p>
        {nextTitle && (
          <div
            style={{
              marginTop: 6,
              background: "rgba(224, 112, 85, 0.1)",
              border: "1px solid rgba(224, 112, 85, 0.25)",
              borderRadius: 20,
              padding: "3px 10px",
            }}
          >
            <span style={{ fontSize: "0.68rem", color: "#a85040" }}>
              Siguiente: {nextTitle}
              {nextArtist ? ` — ${nextArtist}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* EQ bars */}
      <div style={{ width: "100%", maxWidth: 220 }}>
        <EQCoral isPlaying={isPlaying} />
      </div>

      {/* Volume */}
      <div
        className="flex items-center gap-2"
        style={{ width: "100%", maxWidth: 260 }}
      >
        <button
          type="button"
          onClick={toggleMute}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#b85c42",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
          data-ocid="coral.toggle"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={currentVolume}
          onChange={(e) => handleVolumeChange([Number(e.target.value)])}
          style={{
            flex: 1,
            accentColor: "#e07055",
            height: 4,
            cursor: "pointer",
          }}
          data-ocid="coral.input"
        />
      </div>

      {/* Play button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={status === "loading"}
        data-ocid="coral.primary_button"
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: isPlaying
            ? "linear-gradient(135deg, #c0392b, #e07055)"
            : "linear-gradient(135deg, #e07055, #f0a080)",
          border: "none",
          cursor: status === "loading" ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: isPlaying
            ? "0 6px 24px rgba(192, 57, 43, 0.4)"
            : "0 6px 24px rgba(224, 112, 85, 0.35)",
          transition: "all 0.2s",
          transform: status === "loading" ? "scale(0.95)" : "scale(1)",
          flexShrink: 0,
        }}
      >
        {status === "loading" ? (
          <Music size={28} style={{ opacity: 0.8 }} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={28} />
        ) : (
          <Play size={28} style={{ marginLeft: 3 }} />
        )}
      </button>

      {/* Footer */}
      <p style={{ fontSize: "0.6rem", color: "#c4a090", textAlign: "center" }}>
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          style={{ color: "#b85c42", textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </p>

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
      />
      {/* biome-ignore lint/a11y/useMediaCaption: silent keep-alive */}
      <audio
        ref={silentAudioRef}
        src={SILENT_AUDIO_SRC}
        preload="auto"
        playsInline
        loop
      />
    </div>
  );
}
