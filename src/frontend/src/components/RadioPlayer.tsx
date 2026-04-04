import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Music,
  Pause,
  Play,
  Radio,
  SkipForward,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1.jpg";

// Teal accent: #005f6b → oklch(37 0.07 200)
const TEAL = "oklch(37 0.07 200)";
const TEAL_BRIGHT = "oklch(55 0.1 200)";
const TEAL_MID = "oklch(45 0.08 200)";
const TEAL_DIM = "oklch(30 0.06 200 / 0.5)";
const TEAL_GLOW = "oklch(37 0.07 200 / 0.3)";

const EQ_BARS = [
  { cls: "eq-bar-1" },
  { cls: "eq-bar-2" },
  { cls: "eq-bar-3" },
  { cls: "eq-bar-4" },
  { cls: "eq-bar-5" },
];

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
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

  const [interpolatedElapsed, setInterpolatedElapsed] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const { data: metadata, isLoading: metaLoading } = useRadioMetadata();

  useEffect(() => {
    if (metadata?.elapsed !== undefined) {
      setInterpolatedElapsed(metadata.elapsed);
    }
  }, [metadata?.elapsed]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setInterpolatedElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

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
      title: metadata?.title || "En Vivo",
      artist: metadata?.artist || "Radio UNSCH",
      album: "Radio UNSCH",
      artwork: [
        {
          src: window.location.origin + LOGO_URL,
          sizes: "300x300",
          type: "image/jpeg",
        },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
  }, [metadata]);

  useEffect(() => {
    if (isPlaying) setupMediaSession();
  }, [isPlaying, setupMediaSession]);

  useEffect(() => {
    if (isPlaying && metadata && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title || "En Vivo",
        artist: metadata.artist || "Radio UNSCH",
        album: "Radio UNSCH",
        artwork: [
          {
            src: window.location.origin + LOGO_URL,
            sizes: "300x300",
            type: "image/jpeg",
          },
        ],
      });
    }
  }, [metadata, isPlaying]);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setStatus("idle");
    } else {
      setStatus("loading");
      setErrorMsg("");
      try {
        audio.src = STREAM_URL;
        audio.load();
        await audio.play();
        setIsPlaying(true);
        setStatus("playing");
      } catch {
        setStatus("error");
        setErrorMsg("No se pudo conectar al stream. Intenta de nuevo.");
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

  const handleAudioError = () => {
    if (isPlaying) {
      setStatus("error");
      setErrorMsg("Conexión interrumpida. Intenta reproducir de nuevo.");
      setIsPlaying(false);
    }
  };

  const songTitle =
    metadata?.title ||
    (isPlaying ? "Cargando información..." : "Presiona play para escuchar");
  const artistName = metadata?.artist || "Radio UNSCH";

  const duration = metadata?.duration ?? 0;
  const progressPct =
    isPlaying && duration > 0
      ? Math.min((interpolatedElapsed / duration) * 100, 100)
      : 0;

  const nextTitle = metadata?.nextTitle ?? "";
  const nextArtist = metadata?.nextArtist ?? "";
  const listeners = metadata?.listeners ?? 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 130% 80% at 50% 0%, oklch(6 0.005 200) 0%, oklch(3 0.003 200) 60%, oklch(2 0.002 0) 100%)",
        }}
      />

      {/* biome-ignore lint/a11y/useMediaCaption: streaming radio does not provide caption tracks */}
      <audio
        ref={audioRef}
        className="media-session-audio"
        preload="none"
        onError={handleAudioError}
        onPlay={() => setStatus("playing")}
        onWaiting={() => setStatus("loading")}
        onCanPlay={() => {
          if (isPlaying) setStatus("playing");
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        <div
          className="relative rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "oklch(9 0.005 0 / 0.98)",
            backdropFilter: "blur(40px)",
            border: `1px solid ${TEAL_DIM}`,
            boxShadow: `0 24px 100px ${TEAL_GLOW}, 0 0 0 1px oklch(37 0.07 200 / 0.08), inset 0 1px 0 oklch(37 0.07 200 / 0.06)`,
          }}
        >
          {/* EN VIVO badge */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5">
            <span
              className="live-dot w-2 h-2 rounded-full inline-block"
              style={{ background: TEAL }}
            />
            <Badge
              style={{
                background: "oklch(37 0.07 200 / 0.2)",
                color: TEAL_BRIGHT,
                border: "1px solid oklch(37 0.07 200 / 0.4)",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
              }}
            >
              EN VIVO
            </Badge>
          </div>

          {/* Vinyl logo */}
          <div className="relative">
            {isPlaying && (
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{ border: `2px solid ${TEAL}`, margin: "-6px" }}
              />
            )}
            <div
              className="relative w-32 h-32 rounded-full overflow-hidden"
              style={{
                boxShadow: isPlaying
                  ? `0 0 0 3px ${TEAL}, 0 0 50px oklch(37 0.07 200 / 0.25)`
                  : "0 0 0 2px oklch(25 0.005 0 / 0.5)",
                transform: `rotate(${rotation}deg)`,
                transition: isPlaying ? "none" : "transform 0.8s ease-out",
              }}
            >
              <img
                src={LOGO_URL}
                alt="Radio UNSCH"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at center, oklch(2 0.002 0 / 0.7) 0%, transparent 35%)",
                }}
              />
            </div>
          </div>

          {/* Station name */}
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "oklch(90 0.005 0)",
              }}
            >
              Radio UNSCH
            </h1>
          </div>

          {/* Equalizer */}
          <AnimatePresence>
            {isPlaying && status === "playing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-end gap-1 h-10"
              >
                {EQ_BARS.map((bar) => (
                  <div
                    key={bar.cls}
                    className={`w-2 rounded-sm ${bar.cls}`}
                    style={{ background: TEAL_BRIGHT, minHeight: "4px" }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* NOW PLAYING metadata panel */}
          <div
            data-ocid="player.panel"
            className="w-full"
            style={{
              background: "oklch(12 0.005 0 / 0.9)",
              border: "1px solid oklch(37 0.07 200 / 0.35)",
              borderRadius: "0.75rem",
              padding: "1rem 1.25rem",
            }}
          >
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  data-ocid="player.loading_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 justify-center py-2"
                  style={{ color: "oklch(50 0.005 0)" }}
                >
                  <Radio
                    className="w-4 h-4 animate-pulse"
                    style={{ color: TEAL_MID }}
                  />
                  <span className="text-sm">Conectando al stream...</span>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  key="error"
                  data-ocid="player.error_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-2"
                >
                  <p className="text-sm" style={{ color: "oklch(65 0.18 25)" }}>
                    {errorMsg}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={songTitle}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-2"
                >
                  {isPlaying && (
                    <p
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: TEAL_BRIGHT }}
                    >
                      Ahora Suena
                    </p>
                  )}
                  <p
                    className="text-xl font-bold leading-tight"
                    style={{ color: "oklch(92 0.005 0)" }}
                  >
                    {songTitle}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Music
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: TEAL_MID }}
                    />
                    <p
                      className="text-base font-semibold"
                      style={{ color: "oklch(60 0.005 0)" }}
                    >
                      {artistName}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar + Next song + Listeners */}
          <div className="w-full flex flex-col gap-2 -mt-3">
            <AnimatePresence>
              {isPlaying && duration > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-0.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(20 0.005 0)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progressPct}%`,
                      background: TEAL_BRIGHT,
                      transition: "width 1s linear",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-2">
              {nextTitle ? (
                <div
                  className="flex items-center gap-1.5 min-w-0"
                  style={{ color: "oklch(45 0.005 0)" }}
                >
                  <SkipForward
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: TEAL_DIM }}
                  />
                  <span className="text-sm truncate">
                    <span
                      className="font-medium"
                      style={{ color: "oklch(38 0.04 200)" }}
                    >
                      A continuación:{" "}
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: "oklch(52 0.005 0)" }}
                    >
                      {nextTitle}
                      {nextArtist ? ` — ${nextArtist}` : ""}
                    </span>
                  </span>
                </div>
              ) : (
                <div />
              )}

              {isPlaying && listeners > 0 && (
                <div
                  className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(37 0.07 200 / 0.12)",
                    border: "1px solid oklch(37 0.07 200 / 0.2)",
                  }}
                >
                  <Users className="w-2.5 h-2.5" style={{ color: TEAL_MID }} />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(45 0.06 200)" }}
                  >
                    {listeners}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Play / Pause */}
          <motion.button
            type="button"
            data-ocid="player.toggle"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none"
            style={{
              background: isPlaying ? "transparent" : TEAL,
              border: isPlaying ? `2px solid ${TEAL}` : "none",
              boxShadow: isPlaying
                ? `0 0 30px ${TEAL_GLOW}`
                : `0 4px 30px ${TEAL_GLOW}`,
              color: isPlaying ? TEAL_BRIGHT : "oklch(95 0.005 0)",
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

          {/* Volume */}
          <div className="w-full flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              className="shrink-0 p-1 rounded-full focus-visible:outline-none focus-visible:ring-2"
              style={{ color: TEAL_MID }}
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              data-ocid="player.input"
              min={0}
              max={100}
              step={1}
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              className="flex-1"
              aria-label="Volumen"
            />
            <span
              className="shrink-0 text-xs w-8 text-right"
              style={{ color: "oklch(38 0.04 200)" }}
            >
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {isPlaying && metaLoading && (
            <p className="text-xs" style={{ color: TEAL_DIM }}>
              Actualizando metadatos...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
