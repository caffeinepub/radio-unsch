import { Slider } from "@/components/ui/slider";
import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";
const OFFICIAL_URL = "/assets/uploads/OFFICIAL-1-1.png";
const EQ_BARS = ["eq-bar-1", "eq-bar-2", "eq-bar-3", "eq-bar-4", "eq-bar-5"];

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const SILENT_AUDIO_SRC =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//tQxAADB8ABSmAAQAAANIAAAARMQU1FMy45OC4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function RadioPlayerModel2() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [rotation, setRotation] = useState(0);
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

  // ─── Wake Lock — auto re-acquire on release ───────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      const nav = navigator as Navigator & {
        wakeLock: { request: (type: string) => Promise<WakeLockSentinel> };
      };
      const wl = await nav.wakeLock.request("screen");
      wakeLockRef.current = wl;
      wl.addEventListener("release", () => {
        wakeLockRef.current = null;
        const reacquire = async () => {
          if (!isPlayingRef.current) return;
          document.removeEventListener("visibilitychange", reacquire);
          if (document.visibilityState === "visible") {
            try {
              const newWl = await nav.wakeLock.request("screen");
              wakeLockRef.current = newWl;
            } catch {
              // ignore
            }
          }
        };
        if (document.visibilityState === "visible") {
          if (isPlayingRef.current) {
            nav.wakeLock
              .request("screen")
              .then((newWl) => {
                wakeLockRef.current = newWl;
              })
              .catch(() => {});
          }
        } else {
          document.addEventListener("visibilitychange", reacquire);
        }
      });
    } catch {
      // not supported
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
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
      audio.src = STREAM_URL;
      audio.load();
      try {
        await audio.play();
        setStatus("playing");
        setErrorMsg("");
      } catch {
        // retry on next stall
      }
    }, 3000);
  }, []);

  // ─── Visibility change: resume audio on unlock ────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const audio = audioRef.current;
        if (isPlayingRef.current && audio && audio.paused) {
          audio.play().catch(() => scheduleReconnect());
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [scheduleReconnect]);

  // ─── Vinyl rotation ───────────────────────────────────────────────────────
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

  // ─── Media Session ────────────────────────────────────────────────────────
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
      navigator.mediaSession.playbackState = "paused";
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
      setStatus("idle");
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
  }, [songTitle, artistName, albumName, albumArt]);

  useEffect(() => {
    if (isPlaying) setupMediaSession();
  }, [isPlaying, setupMediaSession]);

  // ─── Play / Pause ─────────────────────────────────────────────────────────
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
      await releaseWakeLock();
      setIsPlaying(false);
      setStatus("idle");
      if ("mediaSession" in navigator)
        navigator.mediaSession.playbackState = "paused";
    } else {
      setStatus("loading");
      setErrorMsg("");
      try {
        audio.src = STREAM_URL;
        audio.load();
        audio.volume = volume / 100;
        await audio.play();
        if (silentAudio) {
          silentAudio.volume = 0.001;
          silentAudio.loop = true;
          silentAudio.play().catch(() => {});
        }
        await acquireWakeLock();
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
    if (audioRef.current) audioRef.current.volume = v / 100;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "#050a0a" }}
    >
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,95,107,0.22) 0%, rgba(0,95,107,0.06) 50%, transparent 80%)",
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
      <div className="fixed bottom-4 left-0 z-50">
        <img
          src={OFFICIAL_URL}
          alt="Official"
          className="h-9 w-auto object-contain"
          style={{ display: "block" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div
          className="relative rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "rgba(0,20,22,0.55)",
            backdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(0,95,107,0.5)",
            boxShadow:
              "0 8px 80px rgba(0,95,107,0.2), inset 0 1px 0 rgba(0,200,220,0.08)",
          }}
        >
          {/* EN VIVO badge */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5">
            <span
              className="live-dot w-2 h-2 rounded-full"
              style={{ background: isPlaying ? "#ff2222" : "#005f6b" }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
              style={{
                color: isPlaying ? "#ff2222" : "#00c8dc",
                background: "rgba(0,95,107,0.25)",
                border: "1px solid rgba(0,95,107,0.5)",
              }}
            >
              EN VIVO
            </span>
          </div>

          {/* Album art */}
          <div className="relative mt-6">
            {isPlaying && (
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{
                  border: "2px solid rgba(0,95,107,0.8)",
                  margin: "-8px",
                }}
              />
            )}
            <div
              className="w-36 h-36 rounded-full overflow-hidden"
              style={{
                boxShadow: isPlaying
                  ? "0 0 0 3px #005f6b, 0 0 60px rgba(0,95,107,0.6), 0 0 120px rgba(0,95,107,0.25)"
                  : "0 0 0 2px rgba(0,95,107,0.3)",
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

          {/* Station name */}
          <div className="text-center">
            <p
              className="text-lg font-semibold tracking-[0.2em] uppercase"
              style={{
                color: "#555555",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Radio UNSCH
            </p>
          </div>

          {/* Equalizer */}
          <AnimatePresence>
            {isPlaying && status === "playing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-1 h-10"
              >
                {EQ_BARS.map((bar) => (
                  <div
                    key={bar}
                    className={`w-2 rounded-sm ${bar}`}
                    style={{ background: "#005f6b", minHeight: "4px" }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata panel */}
          <div
            data-ocid="m2.panel"
            className="w-full"
            style={{
              background: "rgba(0,10,12,0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,95,107,0.4)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
            }}
          >
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  data-ocid="m2.loading_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 justify-center py-2"
                  style={{ color: "#555" }}
                >
                  <Radio
                    className="w-4 h-4 animate-pulse"
                    style={{ color: "#005f6b" }}
                  />
                  <span className="text-sm">
                    {errorMsg || "Conectando al stream..."}
                  </span>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  key="error"
                  data-ocid="m2.error_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-2"
                >
                  <p className="text-sm" style={{ color: "#e55" }}>
                    {errorMsg}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={songTitle}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-2"
                >
                  <p
                    className="text-lg font-bold leading-tight"
                    style={{ color: "#4a9da8" }}
                  >
                    {metaLoading && !isPlaying
                      ? "En vivo - Radio UNSCH"
                      : songTitle}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Music
                      className="w-3.5 h-3.5"
                      style={{ color: "#005f6b" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "rgba(74,157,168,0.7)" }}
                    >
                      {artistName}
                    </p>
                  </div>
                  {albumName && (
                    <p
                      className="text-[10px]"
                      style={{ color: "rgba(74,157,168,0.45)" }}
                    >
                      {albumName}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {duration > 0 && (
              <div className="mt-3 flex flex-col gap-1">
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: "3px", background: "rgba(0,95,107,0.2)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #005f6b, #00c8dc)",
                      borderRadius: "9999px",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(74,157,168,0.55)" }}
                  >
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(74,157,168,0.55)" }}
                  >
                    -{formatTime(remaining)}
                  </span>
                </div>
              </div>
            )}

            {nextTitle && (
              <p
                className="text-[10px] mt-2"
                style={{ color: "rgba(0,95,107,0.6)" }}
              >
                A continuación:{" "}
                <span style={{ color: "rgba(74,157,168,0.55)" }}>
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
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <Slider
              data-ocid="m2.input"
              min={0}
              max={100}
              step={1}
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              className="flex-1"
              aria-label="Volumen"
            />
            <span
              className="text-[10px] w-7 text-right"
              style={{ color: "rgba(0,95,107,0.7)" }}
            >
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {/* Play button */}
          <motion.button
            type="button"
            data-ocid="m2.toggle"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(0,95,107,0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50 transition-all"
            style={{
              background: isPlaying
                ? "rgba(0,95,107,0.2)"
                : "rgba(0,95,107,0.15)",
              border: "2px solid #005f6b",
              boxShadow: "0 0 20px rgba(0,95,107,0.35)",
              color: "#00c8dc",
            }}
          >
            {status === "loading" ? (
              <Radio className="w-7 h-7 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
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
