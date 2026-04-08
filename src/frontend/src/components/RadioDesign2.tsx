/**
 * Diseño COSMOS — Radio UNSCH
 * Animado, elegante, con fondo de partículas y ondas de audio.
 * Audio engine robusto para reproducción con pantalla bloqueada.
 * Metadatos: carátula, artista y canción prominentes.
 */
import {
  Music,
  Pause,
  Play,
  Radio,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

// ─────────────────── CONSTANTS ───────────────────
const STREAM_URL = "https://studio5.site/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";

// Silent audio blob to keep audio focus alive
const SILENT_SRC =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA";

// ─────────────────── ANIMATED BACKGROUND ───────────────────
function AnimatedBackground({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 60;
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      hue: number;
    };
    const particles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 40 + 180,
      }),
    );

    const draw = (ts: number) => {
      const dt = ts - timeRef.current;
      timeRef.current = ts;
      const speed = isPlaying ? 1 : 0.3;
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createRadialGradient(
        w / 2,
        h * 0.38,
        0,
        w / 2,
        h * 0.38,
        h * 0.8,
      );
      grad.addColorStop(0, "#030a14");
      grad.addColorStop(0.45, "#050c18");
      grad.addColorStop(1, "#020508");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        const phase = (ts / 4000 + i * 1.2) % (Math.PI * 2);
        ctx.save();
        ctx.globalAlpha = (isPlaying ? 0.07 : 0.03) + Math.sin(phase) * 0.02;
        const wg = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.6);
        const hue = 185 + i * 15;
        wg.addColorStop(0, `hsla(${hue},70%,40%,0)`);
        wg.addColorStop(0.5, `hsla(${hue},70%,40%,1)`);
        wg.addColorStop(1, `hsla(${hue},70%,40%,0)`);
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
          const y =
            h * 0.35 +
            Math.sin(x / 180 + phase + i * 0.8) * (h * 0.06) +
            Math.cos(x / 90 + phase * 0.7) * (h * 0.03);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      for (const p of particles) {
        p.x += p.vx * speed * (dt / 16);
        p.y += p.vy * speed * (dt / 16);
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha * (isPlaying ? 1 : 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 70%, 65%)`;
        ctx.fill();
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

// ─────────────────── EQ CANVAS ───────────────────
function EQCanvas({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const barsRef = useRef<
    { h: number; ph: number; spd: number; target: number }[]
  >([]);

  useEffect(() => {
    const BARS = 24;
    if (barsRef.current.length === 0) {
      barsRef.current = Array.from({ length: BARS }, (_, i) => ({
        h: 4,
        ph: Math.random() * Math.PI * 2,
        spd: 1.2 + Math.random() * 1.8 + (i < 4 ? -0.5 : i > 18 ? 0.5 : 0),
        target: 4,
      }));
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let ts = 0;

    const MAX_H = 48;

    const draw = (now: number) => {
      const dt = now - ts;
      ts = now;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bars = barsRef.current;
      const barW = Math.floor(w / BARS) - 1;

      for (let i = 0; i < BARS; i++) {
        const b = bars[i];
        if (isPlaying) {
          b.ph += (b.spd * dt) / 1000;
          const freqShape = i < 5 ? 0.9 : i < 10 ? 1.0 : i < 18 ? 0.75 : 0.5;
          b.target =
            4 +
            (MAX_H - 4) * freqShape * (0.45 + 0.55 * Math.abs(Math.sin(b.ph)));
          const chaos = Math.sin(b.ph * 2.3) * 0.2;
          b.target = Math.max(4, b.target + chaos * MAX_H * 0.15);
        } else {
          b.target = 4;
        }
        b.h += (b.target - b.h) * Math.min(1, (dt / 1000) * 8);

        const x = i * (barW + 1);
        const barH = Math.max(3, b.h);
        const y = h - barH;

        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, `rgba(80,220,210,${isPlaying ? 0.9 : 0.25})`);
        grad.addColorStop(0.5, `rgba(40,160,180,${isPlaying ? 0.7 : 0.15})`);
        grad.addColorStop(1, `rgba(10,80,100,${isPlaying ? 0.4 : 0.08})`);

        ctx.save();
        ctx.beginPath();
        const rx = 2;
        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + barW - rx, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + rx);
        ctx.lineTo(x + barW, h);
        ctx.lineTo(x, h);
        ctx.lineTo(x, y + rx);
        ctx.quadraticCurveTo(x, y, x + rx, y);
        ctx.closePath();
        ctx.fillStyle = grad;
        if (isPlaying) ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(80,220,210,0.5)";
        ctx.fill();
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={44}
      style={{ width: "100%", height: "44px", display: "block" }}
    />
  );
}

// ─────────────────── MAIN COMPONENT ───────────────────
export function RadioDesign2() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const silentRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const volRef = useRef(85);
  const isPlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const [_errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: meta } = useRadioMetadata();

  const songTitle =
    meta?.title || (isPlaying ? "Cargando..." : "Presiona play");
  const artistName = meta?.artist || "";
  const albumArt = meta?.art || "";
  const albumName = meta?.album || "";
  const nextTitle = meta?.nextTitle || "";
  const nextArtist = meta?.nextArtist || "";
  const duration = meta?.duration || 0;

  useEffect(() => {
    if (meta?.elapsed !== undefined) {
      setElapsed(meta.elapsed);
      elapsedRef.current = meta.elapsed;
    }
  }, [meta?.elapsed]);

  useEffect(() => {
    if (isPlaying) {
      progressRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const startAudioCtx = useCallback(() => {
    try {
      if (audioCtxRef.current) return;
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioCtxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.frequency.value = 1;
      osc.connect(gain);
      osc.start();
      oscRef.current = osc;
    } catch {}
  }, []);

  const resumeAudioCtx = useCallback(() => {
    try {
      const ctx = audioCtxRef.current;
      if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    } catch {}
  }, []);

  const stopAudioCtx = useCallback(() => {
    try {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      oscRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    } catch {}
  }, []);

  const acquireWakeLock = useCallback(async () => {
    try {
      if (!("wakeLock" in navigator)) return;
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        if (isPlayingRef.current) acquireWakeLock();
      });
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {}
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectRef.current) return;
    setStatus("loading");
    reconnectRef.current = setTimeout(async () => {
      reconnectRef.current = null;
      const audio = audioRef.current;
      if (!audio || !isPlayingRef.current) return;
      try {
        audio.src = `${STREAM_URL}?t=${Date.now()}`;
        audio.load();
        audio.volume = volRef.current / 100;
        await audio.play();
        setStatus("playing");
        setErrorMsg("");
      } catch {
        scheduleReconnect();
      }
    }, 1200);
  }, []);

  const attemptResume = useCallback(
    (attempt = 0) => {
      const audio = audioRef.current;
      if (!audio || !isPlayingRef.current) return;
      audio.play().catch(() => {
        if (attempt < 8)
          setTimeout(
            () => attemptResume(attempt + 1),
            Math.min(600 * (attempt + 1), 3000),
          );
        else scheduleReconnect();
      });
    },
    [scheduleReconnect],
  );

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const startKeepAlive = useCallback(() => {
    stopKeepAlive();
    const tick = () => {
      resumeAudioCtx();
      const sa = silentRef.current;
      if (sa?.paused) sa.play().catch(() => {});
      if (audioRef.current?.paused && isPlayingRef.current) attemptResume();
      if (isPlayingRef.current && "mediaSession" in navigator)
        navigator.mediaSession.playbackState = "playing";
    };
    keepAliveRef.current = setInterval(tick, 1500);
    try {
      const blob = new Blob(["setInterval(() => postMessage(1), 900);"], {
        type: "application/javascript",
      });
      const url = URL.createObjectURL(blob);
      workerRef.current = new Worker(url);
      URL.revokeObjectURL(url);
      workerRef.current.onmessage = tick;
    } catch {}
  }, [stopKeepAlive, resumeAudioCtx, attemptResume]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (isPlayingRef.current && audioRef.current?.paused) attemptResume();
        resumeAudioCtx();
        if (isPlayingRef.current) acquireWakeLock();
      } else if (isPlayingRef.current) {
        audioRef.current?.play().catch(() => {});
        resumeAudioCtx();
      }
    };
    const onPageHide = () => {
      if (isPlayingRef.current) audioRef.current?.play().catch(() => {});
    };
    const onPageShow = () => {
      if (isPlayingRef.current && audioRef.current?.paused) attemptResume();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [attemptResume, resumeAudioCtx, acquireWakeLock]);

  const setupMediaSession = useCallback(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta?.title || "En Vivo",
      artist: meta?.artist || "Radio UNSCH",
      album: "Radio UNSCH",
      artwork: [
        {
          src: albumArt || window.location.origin + LOGO_URL,
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current
        ?.play()
        .then(() => {
          setIsPlaying(true);
          setStatus("playing");
        })
        .catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setStatus("idle");
      stopKeepAlive();
      releaseWakeLock();
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setStatus("idle");
      stopKeepAlive();
      releaseWakeLock();
    });
    navigator.mediaSession.playbackState = "playing";
  }, [meta, albumArt, stopKeepAlive, releaseWakeLock]);

  useEffect(() => {
    if (isPlaying) setupMediaSession();
  }, [isPlaying, setupMediaSession]);

  const handleToggle = async () => {
    const audio = audioRef.current;
    const silent = silentRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      silent?.pause();
      stopAudioCtx();
      stopKeepAlive();
      releaseWakeLock();
      setIsPlaying(false);
      setStatus("idle");
      if ("mediaSession" in navigator)
        navigator.mediaSession.playbackState = "paused";
    } else {
      setStatus("loading");
      setErrorMsg("");
      try {
        if (silent) {
          silent.volume = 0.001;
          silent.loop = true;
          silent.play().catch(() => {});
        }
        audio.src = STREAM_URL;
        audio.load();
        audio.volume = volRef.current / 100;
        await audio.play();
        startAudioCtx();
        startKeepAlive();
        acquireWakeLock();
        setIsPlaying(true);
        setStatus("playing");
      } catch {
        setStatus("error");
        setErrorMsg("No se pudo conectar. Intenta de nuevo.");
        setIsPlaying(false);
      }
    }
  };

  const handleVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    volRef.current = v;
    if (audioRef.current) audioRef.current.volume = v / 100;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volRef.current / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const progressPct =
    isPlaying && duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;
  const currentVol = isMuted ? 0 : volume;

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatedBackground isPlaying={isPlaying} />

      {/* biome-ignore lint/a11y/useMediaCaption: streaming radio */}
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        onError={() => {
          if (isPlayingRef.current) scheduleReconnect();
        }}
        onStalled={() => {
          if (isPlayingRef.current) scheduleReconnect();
        }}
        onEnded={() => {
          if (isPlayingRef.current) scheduleReconnect();
        }}
        onPause={() => {
          if (isPlayingRef.current)
            audioRef.current?.play().catch(() => attemptResume());
        }}
        onPlay={() => setStatus("playing")}
        onWaiting={() => setStatus("loading")}
        onCanPlay={() => {
          if (isPlayingRef.current) setStatus("playing");
        }}
      />
      {/* biome-ignore lint/a11y/useMediaCaption: silent keepalive */}
      <audio ref={silentRef} src={SILENT_SRC} preload="auto" playsInline loop />

      {/* ── CARD ── */}
      <div className="cosmos-card w-full mx-4" style={{ maxWidth: "22rem" }}>
        {/* EN VIVO badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span
            className={isPlaying ? "live-dot-red-blink" : "live-dot-off"}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(0,80,100,0.25)",
              border: "1px solid rgba(0,180,210,0.22)",
              color: isPlaying ? "#4ade80" : "#9ca3af",
            }}
          >
            EN VIVO
          </span>
        </div>

        {/* Station name */}
        <div className="text-center mt-6 mb-1">
          <h1
            className={isPlaying ? "station-title shimmer" : "station-title"}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "0.78rem",
              fontWeight: 900,
              letterSpacing: "0.32em",
              color: "#c8c8d8",
              textShadow: isPlaying ? "0 0 32px rgba(80,220,210,0.35)" : "none",
            }}
          >
            RADIO UNSCH
          </h1>
        </div>

        {/* ── ALBUM ART — square, prominent ── */}
        <div className="flex justify-center my-2">
          <div
            style={{
              position: "relative",
              width: 180,
              height: 180,
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: isPlaying
                ? "0 0 0 2px rgba(0,180,210,0.7), 0 8px 48px rgba(0,100,130,0.65)"
                : "0 0 0 1px rgba(0,80,100,0.35), 0 4px 24px rgba(0,50,70,0.3)",
              transition: "box-shadow 0.4s ease",
            }}
          >
            <img
              src={albumArt || LOGO_URL}
              alt={songTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                animation: "spin-album 12s linear infinite",
                animationPlayState: isPlaying ? "running" : "paused",
                transform: isPlaying ? "scale(1.04)" : "scale(1)",
                transition: "transform 0.5s ease",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = LOGO_URL;
              }}
            />
            {/* overlay glow */}
            {isPlaying && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 50% 100%, rgba(0,180,210,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        </div>

        {/* ── SONG TITLE + ARTIST — prominent ── */}
        <div
          style={{
            textAlign: "center",
            padding: "0.25rem 0.25rem 0",
          }}
        >
          <p
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "rgba(200,235,240,0.96)",
              lineHeight: 1.25,
              marginBottom: "0.3rem",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {songTitle}
          </p>
          {artistName && (
            <div
              className="flex items-center justify-center gap-1.5"
              style={{ marginBottom: "0.1rem" }}
            >
              <Music
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#00a0b8" }}
              />
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  color: "rgba(100,200,215,0.85)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {artistName}
              </p>
            </div>
          )}
          {albumName && (
            <p
              style={{
                fontSize: "0.72rem",
                color: "rgba(70,150,170,0.6)",
                marginTop: "0.1rem",
              }}
            >
              {albumName}
            </p>
          )}
        </div>

        {/* EQ Bars */}
        <div style={{ height: 44, margin: "0" }}>
          <EQCanvas isPlaying={isPlaying && status === "playing"} />
        </div>

        {/* Progress bar */}
        {isPlaying && duration > 0 && (
          <div
            style={{
              height: 3,
              borderRadius: 9999,
              background: "rgba(0,80,100,0.3)",
              overflow: "hidden",
              marginTop: "-4px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "linear-gradient(90deg,#00a0b8,#50dcd2)",
                borderRadius: 9999,
                transition: "width 1s linear",
                boxShadow: "0 0 8px rgba(80,220,210,0.5)",
              }}
            />
          </div>
        )}

        {/* Next song */}
        {nextTitle && (
          <div
            className="flex items-center gap-1.5 min-w-0"
            style={{ color: "rgba(0,120,140,0.7)" }}
          >
            <SkipForward className="w-3 h-3 shrink-0" />
            <span
              className="text-xs truncate"
              style={{ color: "rgba(100,180,195,0.65)" }}
            >
              <span style={{ color: "rgba(0,140,165,0.9)" }}>
                A continuación:{" "}
              </span>
              {nextTitle}
              {nextArtist ? ` — ${nextArtist}` : ""}
            </span>
          </div>
        )}

        {/* Volume control */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={toggleMute}
            className="shrink-0"
            style={{ color: "#00a0b8" }}
            aria-label={isMuted ? "Activar" : "Silenciar"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={currentVol}
            onChange={handleVol}
            style={{ "--val": `${currentVol}%` } as React.CSSProperties}
            className="custom-volume-slider flex-1"
            aria-label="Volumen"
          />
          <span
            className="text-[10px] w-7 text-right"
            style={{ color: "rgba(0,150,180,0.7)" }}
          >
            {currentVol}%
          </span>
        </div>

        {/* Play button */}
        <div className="flex justify-center mt-1 mb-1">
          <button
            type="button"
            onClick={handleToggle}
            disabled={status === "loading"}
            className="play-button-cosmos"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {status === "loading" ? (
              <Radio className="w-9 h-9 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="w-9 h-9" />
            ) : (
              <Play className="w-9 h-9 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
