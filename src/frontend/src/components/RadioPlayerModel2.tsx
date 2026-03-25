import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const SILENT_AUDIO_SRC =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//tQxAADB8ABSmAAQAAANIAAAARMQU1FMy45OC4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function CanvasEqualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const barsRef = useRef(
    Array.from({ length: 18 }, (_, i) => {
      const isBass = i < 5;
      const isTreble = i >= 12;
      return {
        current: Math.random() * 0.4 + 0.1,
        target: Math.random() * 0.6 + 0.15,
        peak: 0,
        peakTimer: 0,
        speed: isBass ? 0.04 : isTreble ? 0.12 : 0.08,
        maxH: isBass ? 1.0 : isTreble ? 0.65 : 0.85,
        changeTimer: 0,
        changeInterval: isBass ? 25 : isTreble ? 8 : 15,
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
        const idleH = 4;
        for (let i = 0; i < N; i++) {
          const x = i * (barW + 2);
          ctx.fillStyle = "rgba(0,95,107,0.3)";
          ctx.beginPath();
          ctx.roundRect(x, H - idleH, barW, idleH, 2);
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
          const isTreble = i >= 12;
          const minH = isBass ? 0.25 : isTreble ? 0.05 : 0.1;
          bar.target = minH + Math.random() * (bar.maxH - minH);
          if (Math.random() < 0.15) bar.target *= 0.2;
        }

        bar.current += (bar.target - bar.current) * bar.speed;

        if (bar.current > bar.peak) {
          bar.peak = bar.current;
          bar.peakTimer = 20;
        } else {
          bar.peakTimer--;
          if (bar.peakTimer <= 0) {
            bar.peak -= 0.015;
            if (bar.peak < bar.current) bar.peak = bar.current;
          }
        }

        const x = i * (barW + 2);
        const barHeight = Math.max(3, Math.round(bar.current * (H - 4)));
        const peakY = Math.max(0, H - Math.round(bar.peak * (H - 4)) - 3);

        const grad = ctx.createLinearGradient(0, H - barHeight, 0, H);
        grad.addColorStop(0, "#5ab8c8");
        grad.addColorStop(0.5, "#2a8090");
        grad.addColorStop(1, "#005f6b");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, H - barHeight, barW, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        ctx.fillStyle = "rgba(90,184,200,0.25)";
        ctx.beginPath();
        ctx.roundRect(
          x,
          H - barHeight,
          barW,
          Math.min(4, barHeight),
          [2, 2, 0, 0],
        );
        ctx.fill();

        if (bar.peak > 0.05) {
          ctx.fillStyle = "rgba(90,184,200,0.7)";
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
      width={200}
      height={44}
      style={{ display: "block", imageRendering: "pixelated" }}
    />
  );
}

export function RadioPlayerModel2() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const volumeRef = useRef(80);
  const wakeLockRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cardVisible, setCardVisible] = useState(false);
  const isPlayingRef = useRef(false);

  const { data: metadata, isLoading: metaLoading } = useRadioMetadata();

  const songTitle = metadata?.title || "Radio UNSCH - En Vivo";
  const artistName = metadata?.artist || "Radio UNSCH";
  const albumName = metadata?.album || "";
  const albumArt = metadata?.art || "";
  const elapsed = metadata?.elapsed ?? 0;
  const duration = metadata?.duration ?? 0;
  const remaining = metadata?.remaining ?? 0;
  const nextTitle = metadata?.nextTitle || "";
  const nextArtist = metadata?.nextArtist || "";

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Card entrance animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setCardVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ─── AudioContext keepalive ───────────────────────────────────────────────
  const startAudioContextKeepalive = useCallback(() => {
    try {
      if (audioContextRef.current) return;
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioContextRef.current = ctx;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.001;
      gainNode.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 1;
      osc.connect(gainNode);
      osc.start();
      oscillatorRef.current = osc;
    } catch {}
  }, []);

  const ensureAudioContextKeepalive = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        startAudioContextKeepalive();
        return;
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      if (!oscillatorRef.current) {
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.001;
        gainNode.connect(ctx.destination);
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 1;
        osc.connect(gainNode);
        osc.start();
        oscillatorRef.current = osc;
      }
    } catch {}
  }, [startAudioContextKeepalive]);

  const stopAudioContextKeepalive = useCallback(() => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch {}
  }, []);

  // ─── Wake Lock ────────────────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        if (wakeLockRef.current) {
          try {
            await wakeLockRef.current.release();
          } catch {}
          wakeLockRef.current = null;
        }
        wakeLockRef.current = await (navigator as any).wakeLock.request(
          "screen",
        );
        wakeLockRef.current.addEventListener("release", () => {
          if (isPlayingRef.current) acquireWakeLock();
        });
      }
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

  // ─── Auto-reconnect ───────────────────────────────────────────────────────
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    setStatus("loading");
    setErrorMsg("Reconectando...");
    reconnectTimerRef.current = setTimeout(async () => {
      reconnectTimerRef.current = null;
      const audio = audioRef.current;
      if (!audio || !isPlayingRef.current) return;
      audio.src = `${STREAM_URL}?t=${Date.now()}`;
      audio.load();
      try {
        audio.volume = volumeRef.current / 100;
        await audio.play();
        setStatus("playing");
        setErrorMsg("");
      } catch {}
    }, 1000);
  }, []);

  const attemptResume = useCallback(
    (attempt = 0) => {
      const audio = audioRef.current;
      if (!audio || !isPlayingRef.current) return;
      audio.play().catch(() => {
        if (attempt < 10) {
          const delay = Math.min(500 * (attempt + 1), 3000);
          setTimeout(() => attemptResume(attempt + 1), delay);
        } else {
          scheduleReconnect();
        }
      });
    },
    [scheduleReconnect],
  );

  const stopKeepAliveInterval = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const startKeepAliveInterval = useCallback(() => {
    stopKeepAliveInterval();
    keepAliveIntervalRef.current = setInterval(() => {
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
      if (isPlayingRef.current) ensureAudioContextKeepalive();
      const silentAudio = silentAudioRef.current;
      if (silentAudio?.paused) silentAudio.play().catch(() => {});
      if (audioRef.current?.paused && isPlayingRef.current) attemptResume();
      if (isPlayingRef.current && "mediaSession" in navigator)
        navigator.mediaSession.playbackState = "playing";
    }, 1500);

    try {
      const blob = new Blob(["setInterval(() => postMessage('tick'), 1000);"], {
        type: "application/javascript",
      });
      const url = URL.createObjectURL(blob);
      workerRef.current = new Worker(url);
      URL.revokeObjectURL(url);
      workerRef.current.onmessage = () => {
        const ctx = audioContextRef.current;
        if (ctx?.state === "suspended") ctx.resume().catch(() => {});
        const sa = silentAudioRef.current;
        if (sa?.paused) sa.play().catch(() => {});
        if (audioRef.current?.paused && isPlayingRef.current) attemptResume();
        if (isPlayingRef.current && "mediaSession" in navigator)
          navigator.mediaSession.playbackState = "playing";
      };
    } catch {}
  }, [stopKeepAliveInterval, attemptResume, ensureAudioContextKeepalive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const audio = audioRef.current;
        if (isPlayingRef.current && audio && audio.paused) attemptResume();
        const ctx = audioContextRef.current;
        if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
        if (isPlayingRef.current) acquireWakeLock();
      } else {
        const audio = audioRef.current;
        if (isPlayingRef.current) {
          audio?.play().catch(() => {});
          const ctx = audioContextRef.current;
          if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
        }
      }
    };
    const handleFreeze = () => {
      const audio = audioRef.current;
      if (isPlayingRef.current && audio && audio.paused)
        audio.play().catch(() => {});
    };
    const handleResume = () => {
      const audio = audioRef.current;
      if (isPlayingRef.current && audio && audio.paused) attemptResume();
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    };
    const handleDocPause = () => {
      const audio = audioRef.current;
      if (isPlayingRef.current && audio) audio.play().catch(() => {});
    };
    const handlePageHide = () => {
      if (isPlayingRef.current) audioRef.current?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("freeze", handleFreeze);
    document.addEventListener("resume", handleResume);
    document.addEventListener("pause", handleDocPause);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("freeze", handleFreeze);
      document.removeEventListener("resume", handleResume);
      document.removeEventListener("pause", handleDocPause);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [attemptResume, acquireWakeLock]);

  useEffect(() => {
    const handlePageShow = () => {
      if (isPlayingRef.current && audioRef.current?.paused) attemptResume();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [attemptResume]);

  const setupMediaSession = useCallback(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: songTitle,
      artist: artistName,
      album: albumName || "Radio UNSCH",
      artwork: [
        {
          src: albumArt || window.location.origin + LOGO_URL,
          sizes: "300x300",
          type: "image/jpeg",
        },
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
          navigator.mediaSession.playbackState = "playing";
        })
        .catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setStatus("idle");
      stopKeepAliveInterval();
      releaseWakeLock();
      navigator.mediaSession.playbackState = "paused";
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setStatus("idle");
      stopKeepAliveInterval();
      releaseWakeLock();
      navigator.mediaSession.playbackState = "none";
    });
    for (const action of [
      "seekbackward",
      "seekforward",
      "previoustrack",
      "nexttrack",
    ] as MediaSessionAction[]) {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {}
    }
    navigator.mediaSession.playbackState = "playing";
  }, [
    songTitle,
    artistName,
    albumName,
    albumArt,
    stopKeepAliveInterval,
    releaseWakeLock,
  ]);

  useEffect(() => {
    if (isPlaying) setupMediaSession();
  }, [isPlaying, setupMediaSession]);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    const silentAudio = silentAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (silentAudio) silentAudio.pause();
      stopAudioContextKeepalive();
      stopKeepAliveInterval();
      releaseWakeLock();
      setIsPlaying(false);
      setStatus("idle");
      if ("mediaSession" in navigator)
        navigator.mediaSession.playbackState = "paused";
    } else {
      setStatus("loading");
      setErrorMsg("");
      try {
        if (silentAudio) {
          silentAudio.volume = 0.001;
          silentAudio.loop = true;
          silentAudio.play().catch(() => {});
        }
        audio.src = STREAM_URL;
        audio.load();
        audio.volume = volumeRef.current / 100;
        await audio.play();
        startAudioContextKeepalive();
        startKeepAliveInterval();
        acquireWakeLock();
        setIsPlaying(true);
        setStatus("playing");
      } catch {
        setStatus("error");
        setErrorMsg("No se pudo conectar al stream.");
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    volumeRef.current = v;
    if (audioRef.current) audioRef.current.volume = v / 100;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volumeRef.current / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const currentVolume = isMuted ? 0 : volume;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "#050a0a" }}
    >
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,80,90,0.15) 0%, rgba(0,60,70,0.04) 50%, transparent 80%)",
        }}
      />

      {/* biome-ignore lint/a11y/useMediaCaption: streaming radio */}
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        x-webkit-airplay="allow"
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
          if (isPlayingRef.current) {
            const audio = audioRef.current;
            if (audio) {
              audio.play().catch(() => {
                attemptResume();
              });
            } else {
              attemptResume();
            }
          }
        }}
        onPlay={() => setStatus("playing")}
        onWaiting={() => setStatus("loading")}
        onCanPlay={() => {
          if (isPlayingRef.current) setStatus("playing");
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
        ref={cardRef}
        className={`w-full max-w-md radio-card-enter${cardVisible ? " radio-card-visible" : ""}`}
      >
        <div
          className="relative rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "rgba(0,20,22,0.55)",
            backdropFilter: "blur(32px) saturate(180%)",
            boxShadow:
              "0 8px 80px rgba(0,70,80,0.15), inset 0 1px 0 rgba(0,150,170,0.05)",
          }}
        >
          {/* EN VIVO badge */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5">
            <span
              className={`live-dot w-2 h-2 rounded-full${isPlaying ? " live-dot-red-blink" : ""}`}
              style={{ background: isPlaying ? "#c0392b" : "#6b7280" }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,70,80,0.2)",
                border: "1px solid rgba(0,80,95,0.35)",
                color: isPlaying ? "#4a9e6a" : "#9ca3af",
              }}
            >
              EN VIVO
            </span>
          </div>

          {/* Album art — CSS-driven vinyl spin */}
          <div className="relative mt-6">
            {isPlaying && (
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{
                  border: "2px solid rgba(0,80,95,0.5)",
                  margin: "-8px",
                }}
              />
            )}
            <div
              className={`w-36 h-36 rounded-full overflow-hidden${isPlaying ? " vinyl-spinning" : ""}`}
              style={{
                boxShadow: isPlaying
                  ? "0 0 0 3px #005060, 0 0 40px rgba(0,80,95,0.4), 0 0 80px rgba(0,70,85,0.15)"
                  : "0 0 0 2px rgba(0,70,85,0.25)",
                transition: isPlaying ? "none" : "box-shadow 0.4s ease",
              }}
            >
              <img
                src={albumArt || LOGO_URL}
                alt="Radio UNSCH"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = LOGO_URL;
                }}
              />
            </div>
          </div>

          {/* Station name — static */}
          <div className="text-center">
            <p
              className="text-lg font-semibold tracking-[0.2em] uppercase"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#9a9a9a",
              }}
            >
              Radio UNSCH
            </p>
          </div>

          {/* Canvas Equalizer — always shown */}
          <div
            style={{
              opacity: isPlaying && status === "playing" ? 1 : 0.4,
              transition: "opacity 0.4s ease",
            }}
          >
            <CanvasEqualizer isPlaying={isPlaying && status === "playing"} />
          </div>

          {/* Metadata panel */}
          <div
            data-ocid="m2.panel"
            className="w-full"
            style={{
              background: "rgba(0,10,12,0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,80,95,0.3)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
            }}
          >
            <div style={{ minHeight: "3rem" }}>
              {status === "loading" ? (
                <div
                  data-ocid="m2.loading_state"
                  className="flex items-center gap-2 justify-center py-2"
                  style={{ color: "#555" }}
                >
                  <Radio
                    className="w-4 h-4 animate-pulse"
                    style={{ color: "#3a7a85" }}
                  />
                  <span className="text-sm">
                    {errorMsg || "Conectando al stream..."}
                  </span>
                </div>
              ) : status === "error" ? (
                <div data-ocid="m2.error_state" className="text-center py-2">
                  <p className="text-sm" style={{ color: "#b05050" }}>
                    {errorMsg}
                  </p>
                </div>
              ) : (
                <div
                  className="flex flex-col gap-2"
                  style={{ transition: "opacity 0.3s ease" }}
                >
                  <p
                    className="text-lg font-bold leading-tight"
                    style={{ color: "rgba(90,150,160,0.85)" }}
                  >
                    {metaLoading && !isPlaying
                      ? "En vivo - Radio UNSCH"
                      : songTitle}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Music
                      className="w-3.5 h-3.5"
                      style={{ color: "#3a7a85" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "rgba(90,150,160,0.85)" }}
                    >
                      {artistName}
                    </p>
                  </div>
                  {albumName && (
                    <p
                      className="text-[10px]"
                      style={{ color: "rgba(90,150,160,0.65)" }}
                    >
                      {albumName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {duration > 0 && (
              <div className="mt-3 flex flex-col gap-1">
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: "3px", background: "rgba(0,80,95,0.18)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #3a6a75, #5a9aaa)",
                      borderRadius: "9999px",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(90,150,160,0.55)" }}
                  >
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(90,150,160,0.55)" }}
                  >
                    -{formatTime(remaining)}
                  </span>
                </div>
              </div>
            )}

            {nextTitle && (
              <p
                className="text-[10px] mt-2"
                style={{ color: "rgba(0,120,140,0.75)" }}
              >
                A continuación:{" "}
                <span style={{ color: "rgba(90,150,160,0.65)" }}>
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
              className="shrink-0"
              style={{ color: "#3a7a85" }}
              aria-label={isMuted ? "Activar" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              data-ocid="m2.input"
              type="range"
              min={0}
              max={100}
              step={1}
              value={currentVolume}
              onChange={(e) => handleVolumeChange([Number(e.target.value)])}
              style={{ "--val": `${currentVolume}%` } as React.CSSProperties}
              className="custom-volume-slider flex-1"
              aria-label="Volumen"
            />
            <span
              className="text-[10px] w-7 text-right"
              style={{ color: "rgba(0,80,95,0.6)" }}
            >
              {currentVolume}%
            </span>
          </div>

          {/* Play button */}
          <button
            type="button"
            data-ocid="m2.toggle"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="play-btn w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50"
            style={{
              background: isPlaying
                ? "rgba(0,75,88,0.2)"
                : "rgba(0,75,88,0.12)",
              border: "2px solid #3a7a85",
              boxShadow: "0 0 16px rgba(0,80,95,0.25)",
              color: "#7ab8c4",
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

          {metaLoading && (
            <p className="text-xs" style={{ color: "rgba(0,80,95,0.35)" }}>
              Actualizando...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
