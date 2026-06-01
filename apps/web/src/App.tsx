import { useEffect, useState } from "react";
import {
  Bot,
  PackageCheck,
  Boxes,
  Truck,
  CheckCircle2,
  RefreshCw,
  Send,
} from "lucide-react";
import { MetricCard } from "./components/MetricCard";
import { InfraRow } from "./components/InfraRow";

type DashboardSummary = {
  ordersToShipToday: number;
  incomingGoodsToday: number;
  availableOperatorsTomorrow: number;
};

export default function App() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSummary();
  }, []);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Warehouse Lab di Bona e zul</p>
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
      </header>

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

      <div className="layout">
        <section className="panel">
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
        </section>

        <section className="panel chatPanel">
          <header className="panelHeader chatHeader">
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
          </header>

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
        </section>
      </div>
    </main>
  );
}
