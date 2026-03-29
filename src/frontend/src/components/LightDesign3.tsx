import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useRadioPlayer } from "../hooks/useRadioPlayer";

// EQ canvas — green/teal palette
function EQJardin({ isPlaying }: { isPlaying: boolean }) {
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
      grad.addColorStop(0, "rgba(45, 106, 79, 0.9)");
      grad.addColorStop(0.5, "rgba(60, 150, 100, 0.85)");
      grad.addColorStop(1, "rgba(100, 200, 140, 0.65)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();

      // Peak
      const peakY = H - peaksRef.current[i] * H - 3;
      ctx.fillStyle = "rgba(20, 80, 50, 0.7)";
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
      width={300}
      height={40}
      style={{ width: "100%", maxWidth: 300, height: 40 }}
    />
  );
}

export function LightDesign3() {
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
          "linear-gradient(170deg, #f0f5f0 0%, #e8f2ea 60%, #f5faf5 100%)",
        fontFamily: "'Figtree', sans-serif",
      }}
      className="h-full w-full flex flex-col overflow-hidden"
    >
      {/* Wide banner album art */}
      <div
        style={{
          width: "100%",
          height: 160,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Blurred bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${albumArt || LOGO_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(18px) brightness(1.1) saturate(0.8)",
            transform: "scale(1.1)",
            opacity: 0.5,
          }}
        />
        {/* Foreground img centered */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={albumArt || LOGO_URL}
            alt="Album"
            style={{
              height: 120,
              width: 120,
              borderRadius: 16,
              objectFit: "cover",
              boxShadow: "0 4px 20px rgba(45, 106, 79, 0.3)",
              border: "3px solid rgba(255,255,255,0.7)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = LOGO_URL;
            }}
          />
        </div>
        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 50,
            background: "linear-gradient(transparent, #f0f5f0)",
          }}
        />
        {/* EN VIVO top-right */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(6px)",
            borderRadius: 20,
            padding: "3px 10px",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isPlaying ? "#c0392b" : "#bbb",
              display: "inline-block",
            }}
            className={isPlaying ? "live-dot-red-blink" : ""}
          />
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              fontWeight: 700,
              color: isPlaying ? "#27ae60" : "#aaa",
            }}
          >
            EN VIVO
          </span>
        </div>
        {/* RADIO UNSCH top-left */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 14,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(6px)",
            borderRadius: 20,
            padding: "3px 10px",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              fontWeight: 800,
              color: "#2d6a4f",
            }}
          >
            RADIO UNSCH
          </span>
        </div>
      </div>

      {/* Floating metadata card */}
      <div
        style={{
          margin: "0 16px",
          marginTop: -16,
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          borderRadius: 18,
          border: "1px solid rgba(45, 106, 79, 0.18)",
          boxShadow: "0 4px 20px rgba(45, 106, 79, 0.15)",
          padding: "14px 18px",
          zIndex: 1,
          position: "relative",
        }}
      >
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "#1a3a2a",
            lineHeight: 1.3,
            marginBottom: 2,
          }}
          className="line-clamp-2"
        >
          {songTitle}
        </p>
        <p style={{ fontSize: "0.78rem", color: "#2d6a4f", fontWeight: 600 }}>
          {artistName}
        </p>
        {albumName ? (
          <p style={{ fontSize: "0.7rem", color: "#5a9a72", marginTop: 2 }}>
            {albumName}
          </p>
        ) : null}
        {nextTitle && (
          <div
            style={{
              marginTop: 8,
              borderTop: "1px solid rgba(45, 106, 79, 0.12)",
              paddingTop: 6,
            }}
          >
            <span
              style={{ fontSize: "0.65rem", color: "#3a8055", fontWeight: 500 }}
            >
              ♪ Siguiente: {nextTitle}
              {nextArtist ? ` — ${nextArtist}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* EQ */}
      <div
        className="flex items-center justify-center px-5 py-3"
        style={{ flexShrink: 0 }}
      >
        <EQJardin isPlaying={isPlaying} />
      </div>

      <div className="flex-1" />

      {/* Compact controls */}
      <div
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(14px)",
          borderTop: "1px solid rgba(45, 106, 79, 0.15)",
          padding: "12px 24px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Volume */}
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
              color: "#2d6a4f",
              padding: 4,
              display: "flex",
            }}
            data-ocid="jardin.toggle"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={currentVolume}
            onChange={(e) => handleVolumeChange([Number(e.target.value)])}
            style={{ flex: 1, accentColor: "#2d6a4f", cursor: "pointer" }}
            data-ocid="jardin.input"
          />
        </div>

        {/* Play button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={status === "loading"}
          data-ocid="jardin.primary_button"
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: isPlaying
              ? "linear-gradient(135deg, #1b4332, #2d6a4f)"
              : "linear-gradient(135deg, #2d6a4f, #52b788)",
            border: "none",
            cursor: status === "loading" ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: isPlaying
              ? "0 6px 24px rgba(27, 67, 50, 0.45)"
              : "0 6px 24px rgba(45, 106, 79, 0.4)",
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
          style={{ fontSize: "0.6rem", color: "#8aba9a", textAlign: "center" }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            style={{ color: "#2d6a4f" }}
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
