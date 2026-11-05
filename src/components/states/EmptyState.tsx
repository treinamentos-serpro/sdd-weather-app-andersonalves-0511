interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  hint = 'Tente buscar outra cidade ou verifique o nome informado.',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h2 className="break-words text-xl font-semibold">{title}</h2>
      <p className="mt-2 break-words text-slate-300">{hint}</p>
    </div>
  );
}
