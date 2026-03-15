import { useEffect, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import Modal from "./Modal";
import {
  addQuoteText,
  deleteQuote,
  exportBackupTo,
  importBackupFrom,
  listQuotes,
  resetQuotesToDefaults,
  updateQuoteText
} from "../db";

const THEMES: { id: string; label: string; bg: string; fg: string; accent: string }[] = [
  { id: "neobrutalism",    label: "Neobrutalism",     bg: "#c94535", fg: "#ffffff", accent: "#000000" },
  { id: "terminal-orange", label: "Terminal Orange",  bg: "#111111", fg: "#ff9d00", accent: "#000000" },
  { id: "terminal-green",  label: "Terminal Green",   bg: "#111111", fg: "#00ff00", accent: "#000000" },
  { id: "midnight",        label: "Midnight",         bg: "#0f172a", fg: "#e2e8f0", accent: "#22d3ee" },
  { id: "sakura",          label: "Sakura",           bg: "#ffe4e6", fg: "#1c0a11", accent: "#4a0e24" },
  { id: "blueprint",       label: "Blueprint",        bg: "#0c1f38", fg: "#cfe8ff", accent: "#38bdf8" },
];

export default function SettingsModal({
  open: isOpen,
  onClose,
  onQuotesChanged,
  theme,
  setTheme
}: {
  open: boolean;
  onClose: () => void;
  onQuotesChanged?: () => void;
  theme: string;
  setTheme: (t: string) => void;
}) {
  const [quotes, setQuotes] = useState<{ id: string; text: string }[]>([]);
  const [newQuote, setNewQuote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [liveMsg, setLiveMsg] = useState("");

  function announce(msg: string) {
    setLiveMsg("");
    requestAnimationFrame(() => setLiveMsg(msg));
  }

  async function refresh() {
    const rows = await listQuotes();
    setQuotes(rows.map((r) => ({ id: r.id, text: r.text })));
  }

  useEffect(() => {
    if (!isOpen) {
      // Revert any hover preview when modal closes
      document.documentElement.setAttribute("data-theme", theme);
      return;
    }
    refresh();
    setQuotesError(null);
    setBackupError(null);
  }, [isOpen, theme]);

  async function handleAddQuote() {
    if (newQuote.trim().length === 0 || busy !== null) return;
    setBusy("add");
    setQuotesError(null);
    try {
      await addQuoteText(newQuote.trim());
      setNewQuote("");
      await refresh();
      onQuotesChanged?.();
      announce("Quote added.");
    } catch {
      setQuotesError("Failed to add quote. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveEdit(id: string) {
    if (editText.trim().length === 0 || busy !== null) return;
    setBusy("edit");
    setQuotesError(null);
    try {
      await updateQuoteText(id, editText.trim());
      await refresh();
      onQuotesChanged?.();
      announce("Quote updated.");
    } catch {
      setQuotesError("Failed to save quote. Please try again.");
    } finally {
      setBusy(null);
      setEditingId(null);
    }
  }

  async function handleDeleteQuote(id: string) {
    setBusy("del");
    setQuotesError(null);
    try {
      await deleteQuote(id);
      await refresh();
      onQuotesChanged?.();
      announce("Quote deleted.");
    } catch {
      setQuotesError("Failed to delete quote. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleResetQuotes() {
    if (!confirm("Restore original quotes? Your custom quotes will be lost.")) return;
    setBusy("reset");
    setQuotesError(null);
    try {
      await resetQuotesToDefaults();
      await refresh();
      onQuotesChanged?.();
      announce("Quotes restored to defaults.");
    } catch {
      setQuotesError("Failed to restore quotes. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal open={isOpen} title="Settings" onClose={onClose}>
      {/* Screen reader live region — visually hidden */}
      <div
        role="status"
        aria-live="polite"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        {liveMsg}
      </div>

      <div style={{ display: "grid", gap: 0 }}>

        {/* ── Quotes ── */}
        <section style={{ display: "grid", gap: 10, paddingBottom: 16 }}>
          <h3 className="h2">Quotes</h3>
          <div className="muted" style={{ marginTop: -4 }}>Shown in the quote bar at the bottom of the app.</div>

          {quotesError && (
            <div role="alert" style={{ fontSize: 12, fontWeight: 700, color: "#cc0000" }}>
              {quotesError}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={{ flex: 1, minWidth: 200 }}
              aria-label="New quote text"
              value={newQuote}
              placeholder="Add a quote…"
              maxLength={280}
              onChange={(e) => { setNewQuote(e.target.value); setQuotesError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddQuote(); }}
            />
            <button
              className="btn primary"
              disabled={busy !== null || newQuote.trim().length === 0}
              onClick={handleAddQuote}
            >
              {busy === "add" ? "Adding…" : "Add"}
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {quotes.length === 0 ? (
              <div className="muted">No quotes yet. Add one above to see it in the footer bar.</div>
            ) : (
              quotes.map((q) => (
                <div key={q.id} className="quoteManageRow">
                  {editingId === q.id ? (
                    <>
                      <input
                        style={{ flex: 1 }}
                        value={editText}
                        autoFocus
                        maxLength={280}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(q.id);
                          else if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        className="btn primary"
                        disabled={busy !== null || editText.trim().length === 0}
                        onClick={() => handleSaveEdit(q.id)}
                      >
                        {busy === "edit" ? "Saving…" : "Save"}
                      </button>
                      <button
                        className="btn"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="quoteManageText">{q.text}</div>
                      <button
                        className="btn"
                        disabled={busy !== null}
                        onClick={() => { setEditingId(q.id); setEditText(q.text); }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger"
                        disabled={busy !== null}
                        onClick={() => handleDeleteQuote(q.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div>
            <button
              className="btn danger"
              disabled={busy !== null}
              onClick={handleResetQuotes}
            >
              {busy === "reset" ? "Restoring…" : "⚠ Restore original quotes"}
            </button>
          </div>
        </section>

        {/* ── Theme ── */}
        <section style={{ display: "grid", gap: 12, borderTop: "var(--border)", paddingTop: 16, paddingBottom: 16 }}>
          <h3 className="h2">Theme</h3>
          <div className="muted" style={{ marginTop: -4 }}>Hover to preview · click to apply.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                className="themeBtn"
                onClick={() => setTheme(t.id)}
                onMouseEnter={() => document.documentElement.setAttribute("data-theme", t.id)}
                onMouseLeave={() => document.documentElement.setAttribute("data-theme", theme)}
                onFocus={() => document.documentElement.setAttribute("data-theme", t.id)}
                onBlur={() => document.documentElement.setAttribute("data-theme", theme)}
                style={{
                  background: t.bg,
                  border: theme === t.id ? "3px solid " + t.accent : "2px solid " + t.fg,
                  color: t.fg,
                  padding: "10px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  boxShadow: theme === t.id ? "3px 3px 0 " + t.fg : "2px 2px 0 " + t.fg,
                }}
              >
                {t.label}
                {theme === t.id && <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>✓ Active</div>}
              </button>
            ))}
          </div>
        </section>

        {/* ── Backup ── */}
        <section style={{ display: "grid", gap: 10, borderTop: "var(--border)", paddingTop: 16 }}>
          <h3 className="h2">Backup</h3>

          {backupError && (
            <div role="alert" style={{ fontSize: 12, fontWeight: 700, color: "#cc0000" }}>
              {backupError}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn"
              disabled={busy !== null}
              onClick={async () => {
                const out = await save({
                  title: "Export backup",
                  defaultPath: "year-bingo-backup.sqlite",
                  filters: [{ name: "SQLite", extensions: ["sqlite", "db"] }]
                });
                if (!out) return;

                setBusy("export");
                setBackupError(null);
                try {
                  await exportBackupTo(String(out));
                  setExportDone(true);
                  announce("Backup exported successfully.");
                  setTimeout(() => setExportDone(false), 2500);
                } catch {
                  setBackupError("Export failed. Check available disk space and try again.");
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "export" ? "Exporting…" : exportDone ? "Exported ✓" : "Export…"}
            </button>

            <button
              className="btn"
              disabled={busy !== null}
              onClick={async () => {
                if (!confirm("Importing a backup will restart the app. Any running timer sessions will be lost. Continue?")) return;

                const picked = await open({
                  title: "Import backup",
                  multiple: false,
                  filters: [{ name: "SQLite", extensions: ["sqlite", "db"] }]
                });
                if (!picked) return;

                const path = Array.isArray(picked) ? picked[0] : picked;

                setBusy("import");
                setBackupError(null);
                try {
                  await importBackupFrom(String(path));
                  await relaunch();
                } catch {
                  setBackupError("Import failed. The file may be corrupted or incompatible.");
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "import" ? "Importing…" : "Import…"}
            </button>
          </div>

          <div className="muted">
            Tip: export directly to a synced Google Drive folder.
          </div>
        </section>

      </div>
    </Modal>
  );
}
