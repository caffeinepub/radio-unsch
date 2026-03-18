import { motion } from "motion/react";

interface Props {
  onBack: () => void;
}

export default function QuienesSomos({ onBack }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#000000", color: "#e0f7fa" }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(0,5,7,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,200,220,0.12)",
        }}
      >
        <button
          type="button"
          data-ocid="quienes.close_button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{
            background: "rgba(0,200,220,0.08)",
            border: "1px solid rgba(0,200,220,0.18)",
            color: "#00c8dc",
          }}
          aria-label="Volver"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
          >
            <path
              d="M19 12H5M12 5l-7 7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1
          className="text-base font-bold tracking-widest uppercase"
          style={{ color: "#00c8dc" }}
        >
          Quiénes Somos
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          {/* Logo / Icon */}
          <div className="flex justify-center mb-2">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-full"
              style={{
                background: "rgba(0,95,107,0.15)",
                border: "1px solid rgba(0,200,220,0.25)",
                boxShadow: "0 0 32px rgba(0,200,220,0.1)",
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00c8dc"
                strokeWidth={1.5}
                className="w-10 h-10"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M3 12a9 9 0 0 1 9-9" strokeLinecap="round" />
                <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round" />
                <path d="M6.34 6.34a7 7 0 0 0 0 11.32" strokeLinecap="round" />
                <path d="M17.66 6.34a7 7 0 0 1 0 11.32" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Main card */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(0,20,25,0.8)",
              border: "1px solid rgba(0,200,220,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            <h2 className="text-lg font-bold mb-3" style={{ color: "#00c8dc" }}>
              Radio UNSCH
            </h2>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "rgba(180,220,225,0.8)" }}
            >
              Radio UNSCH es la emisora oficial de la Universidad Nacional de
              San Cristóbal de Huamanga (UNSCH), con sede en Ayacucho, Perú.
              Transmitimos contenido cultural, educativo e informativo para
              nuestra comunidad universitaria y la región.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(180,220,225,0.8)" }}
            >
              Nuestra misión es ser el puente entre la universidad y la
              sociedad, difundiendo el conocimiento, la cultura y los valores de
              nuestra institución a través de la radio en línea.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Fundación", value: "UNSCH" },
              { label: "Ciudad", value: "Ayacucho" },
              { label: "Formato", value: "Online 24/7" },
              { label: "Región", value: "Perú" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 flex flex-col gap-1"
                style={{
                  background: "rgba(0,20,25,0.7)",
                  border: "1px solid rgba(0,200,220,0.08)",
                }}
              >
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: "rgba(0,200,220,0.5)" }}
                >
                  {item.label}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "rgba(224,247,250,0.9)" }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(0,20,25,0.8)",
              border: "1px solid rgba(0,200,220,0.1)",
            }}
          >
            <h3
              className="text-sm font-bold mb-2 tracking-widest uppercase"
              style={{ color: "#00c8dc" }}
            >
              Nuestra Señal
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(180,220,225,0.75)" }}
            >
              Transmisión en vivo las 24 horas, los 7 días de la semana. Música,
              noticias y programas universitarios para toda la comunidad
              huamanguina.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
