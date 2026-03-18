import { motion } from "motion/react";

interface Props {
  onBack: () => void;
}

const techStack = [
  { name: "React 19", desc: "Interfaz de usuario moderna" },
  { name: "TypeScript", desc: "Tipado estático seguro" },
  { name: "Vite", desc: "Build ultrarrápido" },
  { name: "Tailwind CSS", desc: "Estilos utilitarios" },
  { name: "Motion/React", desc: "Animaciones fluidas" },
  { name: "AzuraCast API", desc: "Metadatos en tiempo real" },
  { name: "Media Session API", desc: "Controles de pantalla de bloqueo" },
  { name: "Wake Lock API", desc: "Pantalla siempre activa" },
];

const features = [
  "Streaming de audio en vivo 24/7",
  "Metadatos en tiempo real (artista, canción, álbum)",
  "PWA instalable en Android e iOS",
  "Reproducción en segundo plano",
  "Controles en pantalla de bloqueo",
  "Reconexión automática anti-corte",
  "Diseño Glassmorphism Premium",
  "Web Worker para audio persistente",
];

export default function DesarrolladorPage({ onBack }: Props) {
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
          data-ocid="dev.close_button"
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
          Desarrollador
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 overflow-y-auto pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          {/* App info card */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(0,20,25,0.85)",
              border: "1px solid rgba(0,200,220,0.12)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
                style={{
                  background: "rgba(0,95,107,0.2)",
                  border: "1px solid rgba(0,200,220,0.2)",
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00c8dc"
                  strokeWidth={1.8}
                  className="w-6 h-6"
                >
                  <polyline
                    points="16 18 22 12 16 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="8 6 2 12 8 18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: "#00c8dc" }}>
                  Radio UNSCH App
                </h2>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "rgba(0,200,220,0.5)" }}
                >
                  Versión 53 — PWA
                </p>
                <p
                  className="text-xs mt-2 leading-relaxed"
                  style={{ color: "rgba(180,220,225,0.7)" }}
                >
                  Aplicación web progresiva desarrollada para la transmisión
                  oficial de Radio UNSCH. Optimizada para dispositivos móviles
                  con reproducción en segundo plano.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(0,20,25,0.8)",
              border: "1px solid rgba(0,200,220,0.08)",
            }}
          >
            <h3
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#00c8dc" }}
            >
              Funcionalidades
            </h3>
            <div className="flex flex-col gap-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#005f6b" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "rgba(180,220,225,0.75)" }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <h3
              className="text-xs font-bold tracking-widest uppercase mb-3 px-1"
              style={{ color: "rgba(0,200,220,0.6)" }}
            >
              Stack Tecnológico
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(0,20,25,0.7)",
                    border: "1px solid rgba(0,200,220,0.07)",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "rgba(0,200,220,0.85)" }}
                  >
                    {tech.name}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "rgba(180,220,225,0.5)" }}
                  >
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stream info */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(0,20,25,0.8)",
              border: "1px solid rgba(0,200,220,0.08)",
            }}
          >
            <h3
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#00c8dc" }}
            >
              Infraestructura
            </h3>
            <div className="flex flex-col gap-2">
              <InfoRow label="Stream" value="studio5.live" />
              <InfoRow label="API" value="AzuraCast" />
              <InfoRow label="Hosting" value="Internet Computer" />
              <InfoRow label="Protocolo" value="HTTPS / MP3" />
            </div>
          </div>

          {/* Footer attribution */}
          <div className="text-center pt-2 pb-4">
            <p className="text-[10px]" style={{ color: "rgba(0,200,220,0.3)" }}>
              © {new Date().getFullYear()} Radio UNSCH. Construido con{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(0,200,220,0.5)",
                  textDecoration: "underline",
                }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px]" style={{ color: "rgba(0,200,220,0.5)" }}>
        {label}
      </span>
      <span
        className="text-[11px] font-medium"
        style={{ color: "rgba(180,220,225,0.75)" }}
      >
        {value}
      </span>
    </div>
  );
}
