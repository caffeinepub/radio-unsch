import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ChatPage from "./components/ChatPage";
import DesarrolladorPage from "./components/DesarrolladorPage";
import QuienesSomos from "./components/QuienesSomos";
import { RadioPlayerModel2 } from "./components/RadioPlayerModel2";

type Page = "quienes" | "chat" | "dev" | null;

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState<Page>(null);

  function openPage(page: Page) {
    setActivePage(page);
    setDrawerOpen(false);
  }

  return (
    <div className="relative min-h-screen" style={{ background: "#000000" }}>
      <button
        type="button"
        data-ocid="nav.open_modal_button"
        onClick={() => setDrawerOpen(true)}
        className="fixed top-4 left-4 z-50 flex flex-col justify-center items-center gap-[5px] p-2 rounded-md"
        style={{
          background: "rgba(0,15,18,0.75)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,200,220,0.18)",
          boxShadow: "0 2px 12px rgba(0,200,220,0.12)",
        }}
        aria-label="Abrir menu"
      >
        <span
          className="block w-5 h-[2px] rounded-full"
          style={{ background: "#00c8dc" }}
        />
        <span
          className="block w-5 h-[2px] rounded-full"
          style={{ background: "#00c8dc" }}
        />
        <span
          className="block w-5 h-[2px] rounded-full"
          style={{ background: "#00c8dc" }}
        />
      </button>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              data-ocid="nav.modal"
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(2px)",
              }}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-50 flex flex-col"
              style={{
                width: "70vw",
                maxWidth: "280px",
                background: "rgba(0,10,12,0.97)",
                backdropFilter: "blur(24px) saturate(200%)",
                borderRight: "1px solid rgba(0,200,220,0.15)",
                boxShadow: "4px 0 40px rgba(0,200,220,0.08)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 pt-5 pb-4"
                style={{ borderBottom: "1px solid rgba(0,200,220,0.1)" }}
              >
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#00c8dc", letterSpacing: "0.2em" }}
                >
                  Menu
                </span>
                <button
                  type="button"
                  data-ocid="nav.close_button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center w-7 h-7 rounded-full"
                  style={{
                    background: "rgba(0,200,220,0.08)",
                    border: "1px solid rgba(0,200,220,0.18)",
                    color: "#00c8dc",
                  }}
                  aria-label="Cerrar menu"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-3.5 h-3.5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-3 pt-4">
                <DrawerItem
                  ocid="nav.quienes.link"
                  label="Quienes Somos"
                  icon={
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      className="w-5 h-5"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path
                        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  onClick={() => openPage("quienes")}
                  active={activePage === "quienes"}
                />
                <DrawerItem
                  ocid="nav.chat.link"
                  label="Chat"
                  icon={
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      className="w-5 h-5"
                    >
                      <path
                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  onClick={() => openPage("chat")}
                  active={activePage === "chat"}
                />
                <DrawerItem
                  ocid="nav.dev.link"
                  label="Desarrollador"
                  icon={
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      className="w-5 h-5"
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
                  }
                  onClick={() => openPage("dev")}
                  active={activePage === "dev"}
                />
              </nav>

              <div
                className="mt-auto px-5 pb-6 pt-4"
                style={{ borderTop: "1px solid rgba(0,200,220,0.08)" }}
              >
                <p
                  className="text-[10px] tracking-wider"
                  style={{ color: "rgba(0,200,220,0.3)" }}
                >
                  RADIO UNSCH
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePage && (
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40"
            style={{ background: "#000000" }}
          >
            {activePage === "quienes" && (
              <QuienesSomos onBack={() => setActivePage(null)} />
            )}
            {activePage === "chat" && (
              <ChatPage onBack={() => setActivePage(null)} />
            )}
            {activePage === "dev" && (
              <DesarrolladorPage onBack={() => setActivePage(null)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <RadioPlayerModel2 />
    </div>
  );
}

function DrawerItem({
  label,
  icon,
  onClick,
  active,
  ocid,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active: boolean;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all"
      style={{
        background: active ? "rgba(0,200,220,0.1)" : "transparent",
        color: active ? "#00c8dc" : "rgba(180,220,225,0.7)",
        border: active
          ? "1px solid rgba(0,200,220,0.2)"
          : "1px solid transparent",
      }}
    >
      <span style={{ color: active ? "#00c8dc" : "rgba(0,200,220,0.5)" }}>
        {icon}
      </span>
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </button>
  );
}
