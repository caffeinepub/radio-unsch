import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { RadioPlayerModel1 } from "./components/RadioPlayerModel1";
import { RadioPlayerModel2 } from "./components/RadioPlayerModel2";
import { RadioPlayerModel3 } from "./components/RadioPlayerModel3";

type ModelId = 1 | 2 | 3;

const MODELS = [
  {
    id: 1 as ModelId,
    name: "Minimalista Moderno",
    desc: "Ultra limpio, negro puro, sin adornos",
    bg: "#000000",
    accentBg: "#005f6b",
    accentText: "#ffffff",
    border: "rgba(0,95,107,0.25)",
    previewLines: [
      { w: "40%", h: 8, bg: "rgba(255,255,255,0.08)" },
      { w: "70%", h: 14, bg: "rgba(255,255,255,0.5)" },
      { w: "55%", h: 10, bg: "rgba(255,255,255,0.25)" },
    ],
  },
  {
    id: 2 as ModelId,
    name: "Glassmorphism Premium",
    desc: "Cristal esmerilado, brillo teal, elegante",
    bg: "#050a0a",
    accentBg: "rgba(0,95,107,0.7)",
    accentText: "#00c8dc",
    border: "rgba(0,95,107,0.5)",
    previewLines: [
      { w: "40%", h: 8, bg: "rgba(0,200,220,0.2)" },
      { w: "70%", h: 14, bg: "rgba(255,255,255,0.55)" },
      { w: "55%", h: 10, bg: "rgba(0,200,220,0.35)" },
    ],
  },
  {
    id: 3 as ModelId,
    name: "Neon Retro",
    desc: "Neón brillante, futurista, retro-tech",
    bg: "#0d0d0d",
    accentBg: "transparent",
    accentText: "#00d4e8",
    border: "#00d4e8",
    previewLines: [
      { w: "40%", h: 8, bg: "rgba(0,212,232,0.2)" },
      { w: "70%", h: 14, bg: "rgba(255,255,255,0.7)" },
      { w: "55%", h: 10, bg: "rgba(0,212,232,0.5)" },
    ],
  },
];

function ModelPreviewCard({
  model,
  onSelect,
}: { model: (typeof MODELS)[0]; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: model.bg,
        border: `1px solid ${model.border}`,
        boxShadow:
          model.id === 3
            ? "0 0 20px rgba(0,212,232,0.2), 0 4px 30px rgba(0,0,0,0.5)"
            : model.id === 2
              ? "0 0 20px rgba(0,95,107,0.2), 0 4px 30px rgba(0,0,0,0.5)"
              : "0 4px 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Mini visual preview */}
      <div
        className="relative h-48 flex flex-col items-center justify-center gap-3 p-6"
        style={{ background: model.bg }}
      >
        {/* Glow for model 2 */}
        {model.id === 2 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,95,107,0.18) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Fake vinyl disc */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background:
              model.id === 3
                ? "linear-gradient(135deg, #1a1a1a, #0a0a0a)"
                : model.id === 2
                  ? "rgba(0,95,107,0.3)"
                  : "rgba(0,95,107,0.9)",
            border:
              model.id === 3
                ? "2px solid #00d4e8"
                : model.id === 2
                  ? "2px solid rgba(0,95,107,0.6)"
                  : "none",
            boxShadow:
              model.id === 3
                ? "0 0 15px rgba(0,212,232,0.5)"
                : model.id === 2
                  ? "0 0 20px rgba(0,95,107,0.4)"
                  : "none",
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background:
                model.id === 3
                  ? "#00d4e8"
                  : model.id === 2
                    ? "#00c8dc"
                    : "rgba(255,255,255,0.9)",
              boxShadow: model.id === 3 ? "0 0 10px #00d4e8" : "none",
            }}
          />
        </div>

        {/* Fake text lines */}
        {model.previewLines.map((line) => (
          <div
            key={line.bg}
            className="rounded-full"
            style={{ width: line.w, height: line.h, background: line.bg }}
          />
        ))}

        {/* Fake EQ for model 2 & 3 */}
        {(model.id === 2 || model.id === 3) && (
          <div className="flex items-end gap-1 h-6">
            {[10, 16, 8, 20, 12].map((h) => (
              <div
                key={h}
                className="w-1.5 rounded-sm"
                style={{
                  height: h,
                  background: model.id === 3 ? "#00d4e8" : "#005f6b",
                  boxShadow: model.id === 3 ? "0 0 6px #00d4e8" : "none",
                }}
              />
            ))}
          </div>
        )}

        {/* Model number badge */}
        <div
          className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background:
              model.id === 3
                ? "transparent"
                : model.id === 2
                  ? "rgba(0,95,107,0.4)"
                  : "#005f6b",
            border:
              model.id === 3
                ? "1px solid #00d4e8"
                : model.id === 2
                  ? "1px solid rgba(0,200,220,0.5)"
                  : "none",
            color: model.id === 3 ? "#00d4e8" : "#fff",
            boxShadow: model.id === 3 ? "0 0 8px rgba(0,212,232,0.6)" : "none",
          }}
        >
          {model.id}
        </div>
      </div>

      {/* Card info + button */}
      <div
        className="p-5 flex flex-col gap-3"
        style={{
          background: model.id === 2 ? "rgba(0,10,12,0.8)" : model.bg,
          borderTop: `1px solid ${model.border}`,
        }}
      >
        <div>
          <h3
            className="font-bold text-base leading-tight"
            style={{
              color:
                model.id === 3 ? model.accentText : "rgba(255,255,255,0.9)",
              textShadow:
                model.id === 3 ? `0 0 10px ${model.accentText}` : "none",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {model.name}
          </h3>
          <p
            className="text-xs mt-1"
            style={{
              color:
                model.id === 3
                  ? "rgba(0,212,232,0.6)"
                  : "rgba(255,255,255,0.35)",
            }}
          >
            {model.desc}
          </p>
        </div>

        <motion.button
          type="button"
          data-ocid={`selector.item.${model.id}`}
          onClick={onSelect}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold tracking-wide"
          style={{
            background:
              model.id === 3
                ? "transparent"
                : model.id === 2
                  ? "rgba(0,95,107,0.3)"
                  : "#005f6b",
            border:
              model.id === 3
                ? "1px solid #00d4e8"
                : model.id === 2
                  ? "1px solid rgba(0,200,220,0.5)"
                  : "none",
            color: model.id === 3 ? "#00d4e8" : "#fff",
            boxShadow:
              model.id === 3
                ? "0 0 12px rgba(0,212,232,0.3)"
                : model.id === 2
                  ? "0 0 12px rgba(0,95,107,0.25)"
                  : "none",
          }}
        >
          Seleccionar este modelo
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [selected, setSelected] = useState<ModelId | null>(null);

  return (
    <AnimatePresence mode="wait">
      {selected === null ? (
        <motion.div
          key="selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen flex flex-col items-center justify-start px-4 py-12"
          style={{ background: "#000" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p
              className="text-xs font-semibold tracking-[0.25em] uppercase mb-3"
              style={{ color: "#005f6b" }}
            >
              Radio UNSCH
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold"
              style={{
                color: "#ffffff",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Elige tu estilo
            </h1>
            <p
              className="mt-3 text-sm"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Tres diseños distintos para el mismo reproductor. Elige el que más
              te guste.
            </p>
          </motion.div>

          {/* Cards grid */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODELS.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <ModelPreviewCard
                  model={model}
                  onSelect={() => setSelected(model.id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={`model-${selected}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {/* Back button */}
          <motion.button
            type="button"
            data-ocid="player.secondary_button"
            onClick={() => setSelected(null)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur"
            style={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(0,95,107,0.4)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            ← Cambiar modelo
          </motion.button>

          {selected === 1 && <RadioPlayerModel1 />}
          {selected === 2 && <RadioPlayerModel2 />}
          {selected === 3 && <RadioPlayerModel3 />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
