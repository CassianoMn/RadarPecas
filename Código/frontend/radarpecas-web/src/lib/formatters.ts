const DAY_LABELS: Record<string, string> = {
  seg_sex: 'Seg a Sex',
  'seg-sex': 'Seg a Sex',
  seg_a_sex: 'Seg a Sex',
  seg_sab: 'Seg a Sáb',
  'seg-sab': 'Seg a Sáb',
  seg_a_sab: 'Seg a Sáb',
  sab: 'Sáb',
  sabado: 'Sábado',
  sábado: 'Sábado',
  dom: 'Dom',
  domingo: 'Domingo',
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  feriados: 'Feriados',
};

export interface HorarioItem {
  label: string;
  valor: string;
}

/**
 * Faz o parse da string de horários de funcionamento (JSONB ou texto livre)
 * retornando uma lista estruturada de labels e valores.
 */
export function parseHorariosFuncionamento(horarios?: string | null): HorarioItem[] {
  if (!horarios || typeof horarios !== 'string' || !horarios.trim()) {
    return [];
  }

  const trimmed = horarios.trim();

  // Tenta analisar como JSON se começar com '{'
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return Object.entries(parsed)
          .filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== '')
          .map(([key, val]) => {
            const normalizedKey = key.toLowerCase().trim();
            const label =
              DAY_LABELS[normalizedKey] ||
              key
                .replace(/[_-]/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());

            return {
              label,
              valor: String(val).trim(),
            };
          });
      }
    } catch {
      // Se falhar o parse JSON, segue para tratamento como texto livre
    }
  }

  return [{ label: '', valor: trimmed }];
}

/**
 * Formata a string de horários para exibição compacta inline (ex: cards da HomePage).
 * Exemplo: "Seg a Sex: 08:00 - 18:00 • Sáb: 08:00 - 13:00"
 */
export function formatHorariosFuncionamento(horarios?: string | null): string {
  const items = parseHorariosFuncionamento(horarios);
  if (items.length === 0) return '';

  return items
    .map((item) => (item.label ? `${item.label}: ${item.valor}` : item.valor))
    .join(' • ');
}
