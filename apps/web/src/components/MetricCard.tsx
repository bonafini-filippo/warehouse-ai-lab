import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface MetricCardProps {
  title: string;
  value?: number;
  loading: boolean;
  icon: ReactNode;
}

export function MetricCard({ title, value, loading, icon }: MetricCardProps) {
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
