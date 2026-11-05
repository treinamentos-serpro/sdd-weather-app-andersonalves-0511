export function formatLocalDateTime(local: string | null | undefined): string {
  if (local == null || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(local)) {
    return 'Indisponível';
  }

  // UTC serve apenas para validar o calendário, sem converter o horário local.
  const date = new Date(`${local}Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, local.length) !== local) {
    return 'Indisponível';
  }

  const [year, month, day] = local.slice(0, 10).split('-');
  return `${day}/${month}/${year} às ${local.slice(11, 16)}`;
}
