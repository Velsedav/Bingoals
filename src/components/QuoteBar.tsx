import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal";
import { QuoteRow, addFooterQuote, deleteFooterQuote, listQuotes } from "../db";

// ✅ Change this to control footer quote speed (ms)
const QUOTE_ROTATE_MS = 4000;

function pickRandom<T>(arr: T[], avoid?: T | null) {
  if (arr.length === 0) return null;
  if (arr.length === 1) return arr[0];
  let next = arr[Math.floor(Math.random() * arr.length)];
  if (avoid != null) {
    let guard = 0;
    while (next === avoid && guard < 10) {
      next = arr[Math.floor(Math.random() * arr.length)];
      guard++;
    }
  }
  return next;
}

export default function QuoteBar() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [current, setCurrent] = useState<QuoteRow | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  const timerRef = useRef<number>(0);

  async function reloadQuotes(preservePick = true) {
    const q = await listQuotes();
    setQuotes(q);

    if (!preservePick) {
      setCurrent(q.length ? pickRandom(q) : null);
      return;
    }

    // keep current if still exists, else pick another
    if (current && q.some((x) => x.id === current.id)) return;
    setCurrent(q.length ? pickRandom(q) : null);
  }

  useEffect(() => {
    void reloadQuotes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rotate every QUOTE_ROTATE_MS
  useEffect(() => {
    window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setCurrent((prev) => {
        const next = pickRandom(quotes, prev);
        return next ?? prev ?? null;
      });
    }, QUOTE_ROTATE_MS);

    return () => window.clearInterval(timerRef.current);
  }, [quotes]);

  const text = useMemo(() => current?.text ?? "Add quotes (hover here) →", [current]);

  return (
    <>
      <footer className="quoteBar">
        <div className="quoteBarCenter">
          <span className="quoteMark">“</span>

          {/* ✅ fade re-triggers on change */}
          <span key={current?.id ?? "empty"} className="quoteFade">
            {text}
          </span>

          <span className="quoteMark">”</span>
        </div>

        <div className="quoteBarActions">
          <button
            className="btn"
            title="Shuffle"
            onClick={() => setCurrent((prev) => pickRandom(quotes, prev) ?? prev ?? null)}
          >
            ↻
          </button>
          <button className="btn" title="Manage quotes" onClick={() => setManageOpen(true)}>
            ✎
          </button>
        </div>
      </footer>

      <ManageQuotesModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        quotes={quotes}
        onChanged={async () => {
          await reloadQuotes(false);
        }}
      />
    </>
  );
}

function ManageQuotesModal(props: {
  open: boolean;
  onClose: () => void;
  quotes: QuoteRow[];
  onChanged: () => Promise<void>;
}) {
  const [newText, setNewText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (props.open) setNewText("");
  }, [props.open]);

  return (
    <Modal open={props.open} title="Quotes" onClose={props.onClose}>
      <div className="form">
        <label>Add a new quote</label>
        <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Type a quote…" />

        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn" onClick={props.onClose}>
            Close
          </button>
          <button
            className="btn primary"
            disabled={busy || newText.trim().length === 0}
            onClick={async () => {
              setBusy(true);
              try {
                await addFooterQuote(newText.trim());
                setNewText("");
                await props.onChanged();
              } finally {
                setBusy(false);
              }
            }}
          >
            Add
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {props.quotes.length === 0 ? (
            <div className="muted">No quotes yet.</div>
          ) : (
            props.quotes.map((q) => (
              <div key={q.id} className="quoteManageRow">
                <div className="quoteManageText">{q.text}</div>
                <button
                  className="btn danger"
                  title="Delete"
                  onClick={async () => {
                    if (!confirm("Delete this quote?")) return;
                    await deleteFooterQuote(q.id);
                    await props.onChanged();
                  }}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}