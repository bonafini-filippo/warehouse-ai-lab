import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bot,
  Boxes,
  CheckCircle2,
  Loader2,
  PackageCheck,
  RefreshCw,
  Send,
  Truck,
} from "lucide-react";
import "./styles.css";

type DashboardSummary = {
  ordersToShipToday: number;
  incomingGoodsToday: number;
  availableOperatorsTomorrow: number;
};

function App() {
  const [summary, setSummary] = (useState < DashboardSummary) | (null > null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = (useState < string) | (null > null);

  async function loadSummary() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard/summary");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as DashboardSummary;
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Warehouse AI Lab di Bona</p>
          <h1>Dashboard magazzino</h1>
          <p className="subtitle">
            Mini app React collegata al backend Go, che legge i dati da
            PostgreSQL tramite rete Docker interna.
          </p>
        </div>

        <button className="refreshButton" onClick={loadSummary}>
          <RefreshCw size={18} />
          Aggiorna
        </button>
      </section>

      {error && (
        <div className="errorBox">
          <strong>Errore:</strong> {error}
        </div>
      )}

      <section className="grid">
        <MetricCard
          title="Ordini da spedire oggi"
          value={summary?.ordersToShipToday}
          loading={loading}
          icon={<PackageCheck size={24} />}
        />

        <MetricCard
          title="Merci arrivate oggi"
          value={summary?.incomingGoodsToday}
          loading={loading}
          icon={<Boxes size={24} />}
        />

        <MetricCard
          title="Operatori liberi domani"
          value={summary?.availableOperatorsTomorrow}
          loading={loading}
          icon={<Truck size={24} />}
        />
      </section>

      <section className="layout">
        <div className="panel">
          <div className="panelHeader">
            <CheckCircle2 size={20} />
            <h2>Stato infrastruttura</h2>
          </div>

          <div className="infraList">
            <InfraRow label="Traefik reverse proxy" value="Online" />
            <InfraRow label="Go API container" value="Online" />
            <InfraRow label="PostgreSQL globale" value="Online" />
            <InfraRow label="Docker network proxy" value="Attiva" />
            <InfraRow label="Docker network infra_db" value="Attiva" />
          </div>
        </div>

        <div className="panel chatPanel">
          <div className="panelHeader chatHeader">
            <div>
              <div className="chatTitle">
                <Bot size={20} />
                <h2>AI Assistant</h2>
              </div>
              <p>
                Mock UI per il prossimo step: function calling verso il backend.
              </p>
            </div>

            <button
              className="toggleButton"
              onClick={() => setChatOpen(!chatOpen)}
            >
              {chatOpen ? "Nascondi" : "Apri"}
            </button>
          </div>

          {chatOpen && (
            <>
              <div className="messages">
                <div className="message assistant">
                  Ciao, sono l’assistente del magazzino. Nel prossimo step mi
                  collegheremo a un endpoint tipo <code>/api/chat</code>.
                </div>

                <div className="message user">
                  Quanti operatori liberi abbiamo domani?
                </div>

                <div className="message assistant">
                  Dal database risultano{" "}
                  <strong>
                    {summary?.availableOperatorsTomorrow ?? "..."}
                  </strong>{" "}
                  operatori disponibili domani.
                </div>
              </div>

              <form
                className="chatInput"
                onSubmit={(event) => {
                  event.preventDefault();
                  setMessage("");
                }}
              >
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Scrivi una domanda..."
                />
                <button type="submit">
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value?: number;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <article className="card">
      <div className="iconBox">{icon}</div>
      <p>{title}</p>
      <strong>
        {loading ? <Loader2 className="spin" size={28} /> : (value ?? "-")}
      </strong>
    </article>
  );
}

function InfraRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="infraRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
