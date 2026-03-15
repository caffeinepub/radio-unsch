import { Slider } from "@/components/ui/slider";
import { Music, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "../hooks/useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";
const WHATSAPP_URL = "/assets/uploads/whatsapp-2-1.png";

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function RadioPlayerModel1() {
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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div
          className="flex flex-col items-center gap-8 p-8"
          style={{ background: "#000" }}
        >
          {/* EN VIVO chip */}
          <div className="self-end flex items-center gap-1.5">
            <span
              className="live-dot w-1.5 h-1.5 rounded-full"
              style={{ background: isPlaying ? "#ff2222" : "#005f6b" }}
            />
            <span
              className="text-[10px] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "#005f6b" }}
            >
              En Vivo
            </span>
          </div>

          {/* Circle album art */}
          <div
            className="w-44 h-44 rounded-full overflow-hidden"
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

          {/* Station name */}
          <div className="text-center">
            <p
              className="text-lg font-semibold tracking-[0.2em] uppercase"
              style={{ color: "#4a4a4a", fontFamily: "'Figtree', sans-serif" }}
            >
              Radio UNSCH
            </p>
          </div>

          {/* Metadata */}
          <div className="w-full text-center">
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <motion.div
                  key="loading"
                  data-ocid="m1.loading_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm" style={{ color: "#555" }}>
                    Conectando...
                  </p>
                </motion.div>
              ) : status === "error" ? (
                <motion.div
                  key="error"
                  data-ocid="m1.error_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm" style={{ color: "#c0392b" }}>
                    {errorMsg}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={songTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col gap-2"
                >
                  {isPlaying && (
                    <p
                      className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                      style={{ color: "#005f6b" }}
                    >
                      Ahora Suena
                    </p>
                  )}
                  <p
                    className="text-2xl font-bold leading-tight"
                    style={{
                      color: "#ffffff",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {metaLoading && !isPlaying
                      ? "En vivo - Radio UNSCH"
                      : songTitle}
                  </p>
                  <div className="flex items-center justify-center gap-1.5">
                    <Music className="w-3 h-3" style={{ color: "#444" }} />
                    <p className="text-sm" style={{ color: "#777" }}>
                      {artistName}
                    </p>
                  </div>
                  {albumName && (
                    <p className="text-xs" style={{ color: "#444" }}>
                      {albumName}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          {duration > 0 && (
            <div className="w-full flex flex-col gap-1">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: "3px", background: "#1a1a1a" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min((elapsed / duration) * 100, 100)}%`,
                    background: "#005f6b",
                    borderRadius: "9999px",
                    transition: "width 1s linear",
                  }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px]" style={{ color: "#444" }}>
                  {formatTime(elapsed)}
                </span>
                <span className="text-[10px]" style={{ color: "#444" }}>
                  -{formatTime(remaining)}
                </span>
              </div>
            </div>
          )}

          {/* A continuación */}
          {nextTitle && (
            <p
              className="text-[10px] text-center w-full"
              style={{ color: "#333" }}
            >
              A continuación:{" "}
              <span style={{ color: "#444" }}>
                {nextArtist && `${nextArtist} — `}
                {nextTitle}
              </span>
            </p>
          )}

          {/* Volume — above play button */}
          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="shrink-0"
              style={{ color: "#444" }}
              aria-label={isMuted ? "Activar" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <Slider
              data-ocid="m1.input"
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
              style={{ color: "#444" }}
            >
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {/* Play button */}
          <motion.button
            type="button"
            data-ocid="m1.toggle"
            onClick={handleTogglePlay}
            disabled={status === "loading"}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            className="w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-50"
            style={{ background: "#005f6b", color: "#fff" }}
          >
            {status === "loading" ? (
              <Radio className="w-6 h-6 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </motion.button>

          {metaLoading && (
            <p className="text-xs" style={{ color: "#333" }}>
              Actualizando...
            </p>
          )}

          {/* WhatsApp contact — bottom left */}
          <div className="w-full flex items-center gap-2 mt-2">
            <img
              src={WHATSAPP_URL}
              alt="WhatsApp"
              className="w-8 h-8 rounded-lg object-cover bg-white"
            />
            <span className="text-sm" style={{ color: "#005f6b" }}>
              939 935 295
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
