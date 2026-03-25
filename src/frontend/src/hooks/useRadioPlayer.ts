import { useCallback, useEffect, useRef, useState } from "react";
import { useRadioMetadata } from "./useRadioMetadata";

const STREAM_URL = "https://studio5.live/listen/radio_unsch/radio.mp3";
const LOGO_URL = "/assets/uploads/cc-ok-1-1.jpg";

const SILENT_AUDIO_SRC =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//tQxAADB8ABSmAAQAAANIAAAARMQU1FMy45OC4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function useRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const volumeRef = useRef(80);
  const wakeLockRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);
  const isPlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
        } else scheduleReconnect();
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
      if (ctx?.state === "suspended") ctx.resume().catch(() => {});
      if (isPlayingRef.current) ensureAudioContextKeepalive();
      const sa = silentAudioRef.current;
      if (sa?.paused) sa.play().catch(() => {});
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
        if (isPlayingRef.current && audio?.paused) attemptResume();
        const ctx = audioContextRef.current;
        if (ctx?.state === "suspended") ctx.resume().catch(() => {});
        if (isPlayingRef.current) acquireWakeLock();
      } else {
        const audio = audioRef.current;
        if (isPlayingRef.current) {
          audio?.play().catch(() => {});
          const ctx = audioContextRef.current;
          if (ctx?.state === "suspended") ctx.resume().catch(() => {});
        }
      }
    };
    const handleFreeze = () => {
      const audio = audioRef.current;
      if (isPlayingRef.current && audio?.paused) audio.play().catch(() => {});
    };
    const handleResume = () => {
      const audio = audioRef.current;
      if (isPlayingRef.current && audio?.paused) attemptResume();
      const ctx = audioContextRef.current;
      if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    };
    const handleDocPause = () => {
      const audio = audioRef.current;
      if (isPlayingRef.current && audio) audio.play().catch(() => {});
    };
    const handlePageHide = () => {
      if (isPlayingRef.current) audioRef.current?.play().catch(() => {});
    };
    const handlePageShow = () => {
      if (isPlayingRef.current && audioRef.current?.paused) attemptResume();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("freeze", handleFreeze);
    document.addEventListener("resume", handleResume);
    document.addEventListener("pause", handleDocPause);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("freeze", handleFreeze);
      document.removeEventListener("resume", handleResume);
      document.removeEventListener("pause", handleDocPause);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [attemptResume, acquireWakeLock]);

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

  return {
    audioRef,
    silentAudioRef,
    SILENT_AUDIO_SRC,
    LOGO_URL,
    isPlaying,
    status,
    errorMsg,
    volume,
    isMuted,
    songTitle,
    artistName,
    albumName,
    albumArt,
    elapsed,
    duration,
    remaining,
    nextTitle,
    nextArtist,
    metaLoading,
    handleTogglePlay,
    handleVolumeChange,
    toggleMute,
    scheduleReconnect,
    attemptResume,
    currentVolume: isMuted ? 0 : volume,
  };
}

export const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
