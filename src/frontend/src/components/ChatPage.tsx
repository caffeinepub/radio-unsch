import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onBack: () => void;
}

export default function ChatPage({ onBack }: Props) {
  const [message, setMessage] = useState("");

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
          data-ocid="chat.close_button"
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
        <div className="flex items-center gap-2">
          <h1
            className="text-base font-bold tracking-widest uppercase"
            style={{ color: "#00c8dc" }}
          >
            Chat
          </h1>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full tracking-wider"
            style={{
              background: "rgba(0,200,220,0.12)",
              border: "1px solid rgba(0,200,220,0.2)",
              color: "rgba(0,200,220,0.7)",
            }}
          >
            Próximamente
          </span>
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 px-4 py-6 flex flex-col gap-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center gap-6 mt-8"
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full"
            style={{
              background: "rgba(0,95,107,0.15)",
              border: "1px solid rgba(0,200,220,0.2)",
              boxShadow: "0 0 32px rgba(0,200,220,0.08)",
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
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#00c8dc" }}
            >
              Chat en vivo
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(180,220,225,0.6)" }}
            >
              Pronto podrás chatear en tiempo real con otros oyentes y el equipo
              de Radio UNSCH.
            </p>
          </div>

          {/* Coming soon card */}
          <div
            className="w-full rounded-2xl p-5"
            style={{
              background: "rgba(0,20,25,0.85)",
              border: "1px solid rgba(0,200,220,0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#00c8dc" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "rgba(0,200,220,0.7)" }}
                >
                  Funciones próximas
                </span>
              </div>
              {[
                "Chat en tiempo real con oyentes",
                "Mensajes al DJ en vivo",
                "Solicitudes de canciones",
                "Comunidad Radio UNSCH",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#005f6b"
                    strokeWidth={2}
                    className="w-3.5 h-3.5 flex-shrink-0"
                  >
                    <polyline
                      points="20 6 9 17 4 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(180,220,225,0.7)" }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Input bar (placeholder) */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: "rgba(0,5,7,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,200,220,0.1)",
        }}
      >
        <input
          data-ocid="chat.input"
          type="text"
          placeholder="Escribe un mensaje..."
          disabled
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(0,20,25,0.8)",
            border: "1px solid rgba(0,200,220,0.12)",
            color: "rgba(180,220,225,0.5)",
            cursor: "not-allowed",
          }}
        />
        <button
          type="button"
          data-ocid="chat.submit_button"
          disabled
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{
            background: "rgba(0,95,107,0.3)",
            border: "1px solid rgba(0,200,220,0.15)",
            color: "rgba(0,200,220,0.4)",
            cursor: "not-allowed",
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
