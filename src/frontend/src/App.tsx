import { useState } from "react";
import { RadioDesign1 } from "./components/RadioDesign1";
import { RadioDesign2 } from "./components/RadioDesign2";
import { RadioDesign3 } from "./components/RadioDesign3";

const designs = [
  { id: 1, label: "Carmesí", color: "#e53e3e" },
  { id: 2, label: "Oceánico", color: "#00b4d8" },
  { id: 3, label: "Esmeralda", color: "#00c853" },
];

export default function App() {
  const [active, setActive] = useState(1);

  return (
    <div
      className="relative"
      style={{ background: "#000000", minHeight: "100vh" }}
    >
      {/* Design switcher */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center gap-2 py-3 px-4"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {designs.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActive(d.id)}
            className="text-[11px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full transition-all duration-300"
            style={{
              background: active === d.id ? `${d.color}22` : "transparent",
              border: `1px solid ${active === d.id ? `${d.color}60` : "rgba(255,255,255,0.08)"}`,
              color: active === d.id ? d.color : "rgba(255,255,255,0.3)",
              boxShadow: active === d.id ? `0 0 14px ${d.color}18` : "none",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="pt-12">
        {active === 1 && <RadioDesign1 />}
        {active === 2 && <RadioDesign2 />}
        {active === 3 && <RadioDesign3 />}
      </div>
    </div>
  );
}
