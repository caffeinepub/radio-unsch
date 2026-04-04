/**
 * Diseño PLATA — Radio UNSCH
 * Player principal embebido desde https://studio5.site/public/radio_unsch
 */
import { useEffect, useState } from "react";

export function RadioDesign2() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col relative overflow-hidden"
      style={{ background: "#080810" }}
    >
      {/* Fondo decorativo */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(70,70,90,0.22) 0%, rgba(40,40,55,0.08) 55%, transparent 80%)",
        }}
      />

      {/* Iframe del player oficial */}
      <div
        className={`flex-1 flex flex-col transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ overflow: "hidden" }}
      >
        <iframe
          src="https://studio5.site/public/radio_unsch"
          title="Radio UNSCH"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            flex: 1,
          }}
          className="flex-1"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
