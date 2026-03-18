import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";
const OFFICIAL_URL = "/assets/uploads/OFFICIAL-1-1.png";
const EQ_BARS = [
  "eq-bar-1",
  "eq-bar-2",
  "eq-bar-3",
  "eq-bar-4",
  "eq-bar-5",
  "eq-bar-6",
  "eq-bar-7",
];

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const SILENT_AUDIO_SRC =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//tQxAADB8ABSmAAQAAANIAAAARMQU1FMy45OC4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function RadioPlayerModel4() {
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
  const logoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [rotation, setRotation] = useState(0);
  const [logoEnlarged, setLogoEnlarged] = useState(false);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    };
  }, []);

  const handleLogoTap = () => {
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    setLogoEnlarged(true);
    logoTimerRef.current = setTimeout(() => setLogoEnlarged(false), 3000);
  };

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
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
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
      if (isPlayingRef.current && audioRef.current?.paused)
        audioRef.current.play().catch(() => {});
    };
    const handleResume = () => {
      if (isPlayingRef.current && audioRef.current?.paused) attemptResume();
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    };
    const handleDocPause = () => {
      if (isPlayingRef.current && audioRef.current)
        audioRef.current.play().catch(() => {});
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

  useEffect(() => {
    if (isPlaying) {
      const animate = (timestamp: number) => {
        if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
        const delta = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        rotationRef.current = (rotationRef.current + (delta / 1000) * 18) % 360;
        setRotation(rotationRef.current);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
    }
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isPlaying]);

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
      style={{ background: "#000000" }}
    >
      {/* Animated aurora background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="aurora-wave aurora-1" />
        <div className="aurora-wave aurora-2" />
        <div className="aurora-wave aurora-3" />
      </div>

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
            audioRef.current?.play().catch(() => {
              attemptResume();
            }) ?? attemptResume();
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

      {/* Official logo — fixed bottom left */}
      <motion.div
        className="fixed bottom-4 left-0 z-50 cursor-pointer"
        animate={{ scale: logoEnlarged ? 2 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformOrigin: "bottom left" }}
        onTouchStart={handleLogoTap}
        onClick={handleLogoTap}
      >
        <img
          src={OFFICIAL_URL}
          alt="Official"
          className="h-9 w-auto object-contain"
          style={{ display: "block" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div
          className="relative rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "rgba(0,10,15,0.7)",
            backdropFilter: "blur(40px) saturate(200%)",
            boxShadow:
              "0 8px 100px rgba(0,95,107,0.35), 0 0 0 1px rgba(0,200,220,0.12), inset 0 1px 0 rgba(0,200,220,0.1)",
          }}
        >
          {/* EN VIVO badge */}
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full${isPlaying ? " live-dot-red-blink" : ""}`}
              style={{
                background: isPlaying ? "#ef4444" : "#6b7280",
                display: "inline-block",
              }}
            />
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(0,95,107,0.2)",
                border: "1px solid rgba(0,180,200,0.25)",
                color: isPlaying ? "#22c55e" : "#ef4444",
                letterSpacing: "0.2em",
              }}
            >
              EN VIVO
            </span>
          </div>

          {/* Station name — large bold */}
          <motion.div
            className="mt-8 text-center"
            animate={{ opacity: [0, 1, 1, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              times: [0, 0.3, 0.6, 0.9, 1],
            }}
          >
            <h1
              className="text-3xl font-black tracking-[0.35em] uppercase"
              style={{
                color: "#c8c8c8",
                fontFamily: "'Playfair Display', serif",
                textShadow:
                  "0 0 40px rgba(0,200,220,0.3), 0 2px 8px rgba(0,0,0,0.8)",
                letterSpacing: "0.35em",
              }}
            >
              RADIO UNSCH
            </h1>
          </motion.div>

          {/* Album art — larger with aurora glow */}
          <div className="relative mt-2">
            {isPlaying && (
              <>
                <div
                  className="pulse-ring absolute inset-0 rounded-full"
                  style={{
                    border: "2px solid rgba(0,150,180,0.7)",
                    margin: "-12px",
                  }}
                />
                <div
                  className="pulse-ring absolute inset-0 rounded-full"
                  style={{
                    border: "1px solid rgba(0,100,120,0.4)",
                    margin: "-24px",
                    animationDelay: "0.5s",
                  }}
                />
              </>
            )}
            <div
              className="w-44 h-44 rounded-full overflow-hidden"
              style={{
                boxShadow: isPlaying
                  ? "0 0 0 4px #005f6b, 0 0 80px rgba(0,95,107,0.7), 0 0 160px rgba(0,95,107,0.3)"
                  : "0 0 0 2px rgba(0,95,107,0.35), 0 0 40px rgba(0,95,107,0.15)",
                transform: `rotate(${rotation}deg)`,
                transition: isPlaying ? "none" : "transform 0.8s ease-out",
              }}
            >
              <img
                src={albumArt || LOGO_URL}
                alt="Radio UNSCH"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = LOGO_URL;
                }}
              />
            </div>
          </div>

          {/* EQ bars — more prominent */}
          <AnimatePresence>
            {isPlaying && status === "playing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-end gap-1.5 h-12"
              >
                {EQ_BARS.map((bar, i) => (
                  <div
                    key={bar}
                    className={`rounded-sm ${bar}`}
                    style={{
                      width: "10px",
                      background: "linear-gradient(to top, #005f6b, #00c8dc)",
                      minHeight: "4px",
                      animationDelay: `${i * 0.1}s`,
                      boxShadow: "0 0 6px rgba(0,200,220,0.4)",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata panel — wider glass */}
          <div
            data-ocid="m4.panel"
            className="w-full"
            style={{
              background: "rgba(0,15,20,0.5)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(0,150,180,0.2)",
              borderRadius: "1.25rem",
              padding: "1.25rem 1.5rem",
            }}
          >
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  data-ocid="m4.loading_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 justify-center py-3"
                  style={{ color: "#555" }}
                >
                  <Radio
                    className="w-5 h-5 animate-pulse"
                    style={{ color: "#005f6b" }}
                  />
                  <span className="text-sm">
                    {errorMsg || "Conectando al stream..."}
                  </span>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  key="error"
                  data-ocid="m4.error_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-3"
                >
                  <p className="text-sm" style={{ color: "#e55" }}>
                    {errorMsg}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={songTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-2.5"
                >
                  <p
                    className="text-base font-bold leading-tight"
                    style={{ color: "rgba(74,157,168,0.35)" }}
                  >
                    {metaLoading && !isPlaying
                      ? "En vivo - Radio UNSCH"
                      : songTitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <Music
                      className="w-4 h-4 shrink-0"
                      style={{ color: "#005f6b" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "rgba(74,157,168,0.45)" }}
                    >
                      {artistName}
                    </p>
                  </div>
                  {albumName && (
                    <p
                      className="text-[11px]"
                      style={{ color: "rgba(74,157,168,0.3)" }}
                    >
                      {albumName}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {duration > 0 && (
              <div className="mt-4 flex flex-col gap-1.5">
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: "3px", background: "rgba(0,95,107,0.25)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #005f6b, #00c8dc)",
                      borderRadius: "9999px",
                      transition: "width 1s linear",
                      boxShadow: "0 0 8px rgba(0,200,220,0.5)",
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(74,157,168,0.35)" }}
                  >
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(74,157,168,0.35)" }}
                  >
                    -{formatTime(remaining)}
                  </span>
                </div>
              </div>
            )}

            {nextTitle && (
              <p
                className="text-[10px] mt-2.5"
                style={{ color: "rgba(0,95,107,0.65)" }}
              >
                A continuación:{" "}
                <span style={{ color: "rgba(74,157,168,0.35)" }}>
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
              style={{ color: "#005f6b" }}
              aria-label={isMuted ? "Activar" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              data-ocid="m4.input"
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
              style={{ color: "rgba(0,95,107,0.7)" }}
            >
              {currentVolume}%
            </span>
          </div>

          {/* Play button — larger, brighter */}
          <motion.button
            type="button"
            data-ocid="m4.toggle"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            whileHover={{
              scale: 1.07,
              boxShadow: "0 0 60px rgba(0,200,220,0.8)",
            }}
            whileTap={{ scale: 0.93 }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-24 h-24 rounded-full flex items-center justify-center disabled:opacity-50 transition-all"
            style={{
              background: isPlaying
                ? "rgba(0,95,107,0.25)"
                : "rgba(0,95,107,0.15)",
              border: "2px solid rgba(0,200,220,0.7)",
              boxShadow:
                "0 0 30px rgba(0,95,107,0.5), inset 0 1px 0 rgba(0,200,220,0.15)",
              color: "#00c8dc",
            }}
          >
            {status === "loading" ? (
              <Radio className="w-9 h-9 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="w-9 h-9" />
            ) : (
              <Play className="w-9 h-9 ml-1" />
            )}
          </motion.button>

          {metaLoading && (
            <p className="text-xs" style={{ color: "rgba(0,95,107,0.4)" }}>
              Actualizando...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
