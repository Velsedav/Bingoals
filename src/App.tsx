import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ObjectivePage from "./pages/ObjectivePage";
import QuoteBar from "./components/QuoteBar";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("appTheme") || "neobrutalism");

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeaderInner">
          <div className="appTitleRow">
            <div>
              <div className="appTitle">BINGOALS</div>
              <div className="appTagline">Track your goals in 16 squares</div>
            </div>

            <button className="btn" onClick={() => setSettingsOpen(true)}>
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="appMain">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/objective/:id" element={<ObjectivePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <QuoteBar />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onQuotesChanged={() => { /* rien à faire pour l’instant */ }}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
