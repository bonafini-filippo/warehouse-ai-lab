interface InfraRowProps {
  label: string;
  value: string;
}

export function InfraRow({ label, value }: InfraRowProps) {
  return (
    <div className="infraRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
