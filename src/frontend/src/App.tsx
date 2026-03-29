import { useState } from "react";
import { LightDesign1 } from "./components/LightDesign1";
import { LightDesign2 } from "./components/LightDesign2";
import { LightDesign3 } from "./components/LightDesign3";

type DesignKey = "coral" | "cielo" | "jardin";

const designs: {
  key: DesignKey;
  label: string;
  activeColor: string;
  activeBg: string;
}[] = [
  { key: "coral", label: "Coral", activeColor: "#b85c42", activeBg: "#fde8e2" },
  { key: "cielo", label: "Cielo", activeColor: "#2563a8", activeBg: "#dbeafe" },
  {
    key: "jardin",
    label: "Jardín",
    activeColor: "#2d6a4f",
    activeBg: "#d1fae5",
  },
];

export default function App() {
  const [active, setActive] = useState<DesignKey>("coral");

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Design selector bar */}
      <div
        style={{
          background:
            active === "coral"
              ? "linear-gradient(135deg, #faf7f4 0%, #fde8e2 100%)"
              : active === "cielo"
                ? "linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%)"
                : "linear-gradient(135deg, #f0f5f0 0%, #d1fae5 100%)",
          borderBottom:
            active === "coral"
              ? "1px solid #f0d0c0"
              : active === "cielo"
                ? "1px solid #bfdbfe"
                : "1px solid #a7f3d0",
        }}
        className="flex items-center justify-center gap-3 py-2 px-4 shrink-0"
      >
        {designs.map((d) => (
          <button
            type="button"
            key={d.key}
            data-ocid={`design.${d.key}.tab`}
            onClick={() => setActive(d.key)}
            style={{
              background: active === d.key ? d.activeBg : "transparent",
              color: active === d.key ? d.activeColor : "#888",
              border:
                active === d.key
                  ? `1.5px solid ${d.activeColor}`
                  : "1.5px solid #ddd",
              fontWeight: active === d.key ? 700 : 400,
              borderRadius: "9999px",
              padding: "4px 18px",
              fontSize: "0.82rem",
              letterSpacing: "0.05em",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Design panels */}
      <div className="flex-1 min-h-0">
        {active === "coral" && <LightDesign1 />}
        {active === "cielo" && <LightDesign2 />}
        {active === "jardin" && <LightDesign3 />}
      </div>
    </div>
  );
}
