import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useRadioPlayer } from "../hooks/useRadioPlayer";

// EQ canvas — blue/cyan palette
function EQCielo({ isPlaying }: { isPlaying: boolean }) {
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
        const freqFactor = i < 5 ? 0.55 : i < 10 ? 0.95 : i < 16 ? 0.72 : 0.42;
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
      grad.addColorStop(0, "rgba(37, 99, 168, 0.85)");
      grad.addColorStop(0.5, "rgba(56, 145, 220, 0.8)");
      grad.addColorStop(1, "rgba(125, 200, 240, 0.65)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();

      // Peak
      const peakY = H - peaksRef.current[i] * H - 3;
      ctx.fillStyle = "rgba(20, 70, 140, 0.7)";
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
      width={260}
      height={44}
      style={{ width: "100%", maxWidth: 260, height: 44 }}
    />
  );
}

export function LightDesign2() {
  const {
    isPlaying,
    status,
    albumArt,
    songTitle,
    artistName,
    albumName,
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
          "linear-gradient(145deg, #e8f4fd 0%, #f0f8ff 50%, #e0eef8 100%)",
        fontFamily: "'Figtree', sans-serif",
      }}
      className="h-full w-full flex flex-col overflow-hidden"
    >
      {/* Top section — metadata left, album art right */}
      <div className="flex flex-row items-start gap-4 px-5 pt-5 pb-3">
        {/* Left: title, artist, badge */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Radio size={14} color="#2563a8" />
            <span
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                fontWeight: 800,
                color: "#2563a8",
                textTransform: "uppercase",
              }}
            >
              Radio UNSCH
            </span>
          </div>

          {/* EN VIVO */}
          <div className="flex items-center gap-1.5">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isPlaying ? "#c0392b" : "#bbb",
                display: "inline-block",
                flexShrink: 0,
              }}
              className={isPlaying ? "live-dot-red-blink" : ""}
            />
            <span
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                fontWeight: 700,
                color: isPlaying ? "#27ae60" : "#aaa",
              }}
            >
              EN VIVO
            </span>
          </div>

          {/* Song info */}
          <div className="flex flex-col gap-0.5" style={{ marginTop: 4 }}>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#0f2a4e",
                lineHeight: 1.3,
              }}
              className="line-clamp-2"
            >
              {songTitle}
            </p>
            <p
              style={{ fontSize: "0.78rem", color: "#2563a8", fontWeight: 600 }}
            >
              {artistName}
            </p>
            {albumName ? (
              <p style={{ fontSize: "0.7rem", color: "#4a7aaa" }}>
                {albumName}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: album art square */}
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 16,
            overflow: "hidden",
            border: "3px solid rgba(37, 99, 168, 0.2)",
            boxShadow: isPlaying
              ? "0 6px 28px rgba(37, 99, 168, 0.3)"
              : "0 3px 14px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.5s",
            flexShrink: 0,
          }}
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
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(37, 99, 168, 0.12)",
          margin: "0 20px",
        }}
      />

      {/* EQ section */}
      <div className="flex flex-col items-center gap-1 px-5 py-3">
        <EQCielo isPlaying={isPlaying} />
        {status === "loading" && (
          <p style={{ fontSize: "0.65rem", color: "#2563a8", opacity: 0.7 }}>
            Conectando...
          </p>
        )}
      </div>

      {/* Next song */}
      {nextTitle && (
        <div
          style={{
            margin: "0 20px 8px",
            background: "rgba(37, 99, 168, 0.08)",
            border: "1px solid rgba(37, 99, 168, 0.18)",
            borderRadius: 10,
            padding: "6px 12px",
          }}
        >
          <span
            style={{ fontSize: "0.68rem", color: "#1e4a88", fontWeight: 500 }}
          >
            Siguiente: {nextTitle}
            {nextArtist ? ` — ${nextArtist}` : ""}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Controls bottom */}
      <div
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(37, 99, 168, 0.15)",
          padding: "14px 24px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* Volume row */}
        <div
          className="flex items-center gap-3 w-full"
          style={{ maxWidth: 280 }}
        >
          <button
            type="button"
            onClick={toggleMute}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#2563a8",
              padding: 4,
              display: "flex",
            }}
            data-ocid="cielo.toggle"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={currentVolume}
            onChange={(e) => handleVolumeChange([Number(e.target.value)])}
            style={{ flex: 1, accentColor: "#2563a8", cursor: "pointer" }}
            data-ocid="cielo.input"
          />
        </div>

        {/* Play button — big centered */}
        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={status === "loading"}
          data-ocid="cielo.primary_button"
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: isPlaying
              ? "linear-gradient(135deg, #1e4a88, #2563a8)"
              : "linear-gradient(135deg, #2563a8, #4a90d9)",
            border: "none",
            cursor: status === "loading" ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: isPlaying
              ? "0 6px 24px rgba(30, 74, 136, 0.45)"
              : "0 6px 24px rgba(37, 99, 168, 0.35)",
            transition: "all 0.2s",
          }}
        >
          {status === "loading" ? (
            <Music size={26} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={26} />
          ) : (
            <Play size={26} style={{ marginLeft: 3 }} />
          )}
        </button>

        <p
          style={{ fontSize: "0.6rem", color: "#7aaad0", textAlign: "center" }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            style={{ color: "#2563a8" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>

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
