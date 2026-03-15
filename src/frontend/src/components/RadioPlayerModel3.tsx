import { Slider } from "@/components/ui/slider";
import {
  Music,
  Pause,
  Play,
  Radio,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";
const NEON = "#00d4e8";
const EQ_BARS = ["eq-bar-1", "eq-bar-2", "eq-bar-3", "eq-bar-4", "eq-bar-5"];

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function RadioPlayerModel3() {
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

  const { data: metadata, isLoading: metaLoading } = useRadioMetadata();

  const songTitle = metadata?.title || "Radio UNSCH - En Vivo";
  const artistName = metadata?.artist || "Radio UNSCH";
  const albumName = metadata?.album || "";
  const albumArt = metadata?.art || "";
  const listeners = metadata?.listeners ?? 0;
  const elapsed = metadata?.elapsed ?? 0;
  const duration = metadata?.duration ?? 0;
  const remaining = metadata?.remaining ?? 0;
  const nextTitle = metadata?.nextTitle || "";
  const nextArtist = metadata?.nextArtist || "";

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
  }, [songTitle, artistName, albumName, albumArt]);

  useEffect(() => {
    if (isPlaying) setupMediaSession();
  }, [isPlaying, setupMediaSession]);

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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      style={{ background: "#000000" }}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: streaming radio */}
      <audio
        ref={audioRef}
        className="media-session-audio"
        preload="none"
        onError={() => {
          if (isPlaying) {
            setStatus("error");
            setErrorMsg("Conexión interrumpida.");
            setIsPlaying(false);
          }
        }}
        onPlay={() => setStatus("playing")}
        onWaiting={() => setStatus("loading")}
        onCanPlay={() => {
          if (isPlaying) setStatus("playing");
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Neon charcoal card */}
        <div
          className="relative rounded-2xl p-8 flex flex-col items-center gap-6"
          style={{
            background: "#0d0d0d",
            border: `1px solid ${NEON}`,
            boxShadow:
              "0 0 20px rgba(0,212,232,0.4), 0 0 60px rgba(0,212,232,0.15), inset 0 0 30px rgba(0,212,232,0.03)",
          }}
        >
          {/* Corner neon accents */}
          <div
            className="absolute top-0 left-0 w-6 h-6"
            style={{
              borderTop: `2px solid ${NEON}`,
              borderLeft: `2px solid ${NEON}`,
              borderRadius: "0.5rem 0 0 0",
            }}
          />
          <div
            className="absolute top-0 right-0 w-6 h-6"
            style={{
              borderTop: `2px solid ${NEON}`,
              borderRight: `2px solid ${NEON}`,
              borderRadius: "0 0.5rem 0 0",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-6 h-6"
            style={{
              borderBottom: `2px solid ${NEON}`,
              borderLeft: `2px solid ${NEON}`,
              borderRadius: "0 0 0 0.5rem",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-6 h-6"
            style={{
              borderBottom: `2px solid ${NEON}`,
              borderRight: `2px solid ${NEON}`,
              borderRadius: "0 0 0.5rem 0",
            }}
          />

          {/* EN VIVO neon badge */}
          <div className="absolute top-5 right-8 flex items-center gap-1.5">
            <span
              className="live-dot w-2 h-2 rounded-full"
              style={{ background: NEON, boxShadow: `0 0 8px ${NEON}` }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: NEON, textShadow: `0 0 10px ${NEON}` }}
            >
              EN VIVO
            </span>
          </div>

          {/* Station name — neon glow text */}
          <h1
            className="text-3xl font-black tracking-wider uppercase mt-4"
            style={{
              color: NEON,
              textShadow: `0 0 10px ${NEON}, 0 0 30px rgba(0,212,232,0.5)`,
              fontFamily: "'Figtree', sans-serif",
              letterSpacing: "0.12em",
            }}
          >
            RADIO UNSCH
          </h1>

          {/* Square album art with neon frame */}
          <div
            className="relative"
            style={{
              padding: "4px",
              background: `linear-gradient(135deg, ${NEON}, transparent, ${NEON})`,
              borderRadius: "0.5rem",
              boxShadow: "0 0 20px rgba(0,212,232,0.4)",
            }}
          >
            <div
              className="w-40 h-40 overflow-hidden rounded"
              style={{
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

          {/* Metadata */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  data-ocid="m3.loading_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 justify-center py-2"
                >
                  <Radio
                    className="w-4 h-4 animate-pulse"
                    style={{ color: NEON }}
                  />
                  <span className="text-sm" style={{ color: NEON }}>
                    Conectando...
                  </span>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  key="error"
                  data-ocid="m3.error_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-2"
                >
                  <p className="text-sm" style={{ color: "#ff4444" }}>
                    {errorMsg}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={songTitle}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-2"
                >
                  {isPlaying && (
                    <p
                      className="text-[10px] font-bold tracking-[0.25em] uppercase"
                      style={{ color: NEON, textShadow: `0 0 8px ${NEON}` }}
                    >
                      ▶ AHORA SUENA
                    </p>
                  )}
                  <p
                    className="text-xl font-bold leading-tight"
                    style={{ color: "#ffffff" }}
                  >
                    {metaLoading && !isPlaying
                      ? "En vivo - Radio UNSCH"
                      : songTitle}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" style={{ color: NEON }} />
                    <p className="text-sm" style={{ color: NEON }}>
                      {artistName}
                    </p>
                  </div>
                  {albumName && (
                    <p
                      className="text-xs"
                      style={{ color: "rgba(0,212,232,0.5)" }}
                    >
                      {albumName}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            {duration > 0 && (
              <div className="mt-3 flex flex-col gap-1">
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{
                    height: "3px",
                    background: "rgba(0,212,232,0.15)",
                    boxShadow: "0 0 4px rgba(0,212,232,0.1)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                      background: NEON,
                      borderRadius: "9999px",
                      boxShadow: `0 0 6px ${NEON}`,
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(0,212,232,0.5)" }}
                  >
                    {formatTime(elapsed)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(0,212,232,0.5)" }}
                  >
                    -{formatTime(remaining)}
                  </span>
                </div>
              </div>
            )}

            {/* A continuación */}
            {nextTitle && (
              <p
                className="text-[10px] mt-2"
                style={{ color: "rgba(0,212,232,0.4)" }}
              >
                A continuación:{" "}
                <span style={{ color: "rgba(0,212,232,0.6)" }}>
                  {nextArtist && `${nextArtist} — `}
                  {nextTitle}
                </span>
              </p>
            )}
          </div>

          {/* Neon EQ bars */}
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
                    style={{
                      background: NEON,
                      minHeight: "4px",
                      boxShadow: `0 0 8px ${NEON}`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {listeners > 0 && (
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: NEON }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{listeners.toLocaleString("es-PE")} oyentes</span>
            </div>
          )}

          {/* Neon play button */}
          <motion.button
            type="button"
            data-ocid="m3.toggle"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 50px rgba(0,212,232,0.7)",
            }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50"
            style={{
              background: "transparent",
              border: `2px solid ${NEON}`,
              boxShadow:
                "0 0 20px rgba(0,212,232,0.5), inset 0 0 20px rgba(0,212,232,0.05)",
              color: NEON,
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
              className="shrink-0"
              style={{ color: NEON }}
              aria-label={isMuted ? "Activar" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              data-ocid="m3.input"
              min={0}
              max={100}
              step={1}
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              className="flex-1"
              aria-label="Volumen"
            />
            <span className="text-xs w-8 text-right" style={{ color: NEON }}>
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {metaLoading && (
            <p className="text-xs" style={{ color: "rgba(0,212,232,0.4)" }}>
              Actualizando...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
