import { useQuery } from "@tanstack/react-query";

export interface NowPlaying {
  title: string;
  artist: string;
  album: string;
  art: string;
  genre: string;
  listeners: number;
  elapsed: number;
  duration: number;
  remaining: number;
  nextTitle: string;
  nextArtist: string;
  nextArt: string;
  isOnline: boolean;
}

export function useRadioMetadata() {
  return useQuery<NowPlaying>({
    queryKey: ["radioMetadata"],
    queryFn: async () => {
      const res = await fetch("https://studio5.site/public/radio_unsch");
      const data = await res.json();
      return {
        title: data.now_playing?.song?.title ?? "",
        artist: data.now_playing?.song?.artist ?? "",
        album: data.now_playing?.song?.album ?? "",
        art: data.now_playing?.song?.art ?? "",
        genre: data.now_playing?.song?.genre ?? "",
        listeners: data.listeners?.total ?? 0,
        elapsed: data.now_playing?.elapsed ?? 0,
        duration: data.now_playing?.duration ?? 0,
        remaining: data.now_playing?.remaining ?? 0,
        nextTitle: data.playing_next?.song?.title ?? "",
        nextArtist: data.playing_next?.song?.artist ?? "",
        nextArt: data.playing_next?.song?.art ?? "",
        isOnline: data.is_online ?? false,
      };
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}
