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

const NON_DAY_KEYS = new Set(['resumo', 'descricao', 'texto', 'geral', 'horario', 'horarios']);

export interface HorarioItem {
  label: string;
  valor: string;
}

/**
 * Faz o parse da string de horários de funcionamento (JSONB ou texto livre)
 * retornando uma lista estruturada de labels e valores, sem prefixos indevidos como "Resumo:".
 */
export function parseHorariosFuncionamento(horarios?: string | null): HorarioItem[] {
  if (!horarios || typeof horarios !== 'string' || !horarios.trim()) {
    return [];
  }

  const trimmed = horarios.trim();

  // Se for array JSON (como salvo pelo painel do lojista: [{ dia, abre, fecha, fechado }])
  if (trimmed.startsWith('[')) {
    try {
      const parsedArray = JSON.parse(trimmed);
      if (Array.isArray(parsedArray)) {
        return parsedArray
          .filter((it) => it && typeof it === 'object')
          .map((it) => {
            const dia = it.dia || it.label || it.day || '';
            const fechado = Boolean(it.fechado || it.closed);
            const valor = fechado
              ? 'Fechado'
              : it.abre && it.fecha
                ? `${it.abre} - ${it.fecha}`
                : it.valor || it.horario || 'Fechado';
            return {
              label: dia,
              valor,
            };
          });
      }
    } catch {
      // Segue para fallback
    }
  }

  // Tenta analisar como JSON se começar com '{'
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const result: HorarioItem[] = [];
        for (const [key, val] of Object.entries(parsed)) {
          if (val === undefined || val === null || String(val).trim() === '') continue;
          const normalizedKey = key.toLowerCase().trim();
          const cleanVal = String(val).trim().replace(/^resumo\s*:\s*/i, '');

          if (NON_DAY_KEYS.has(normalizedKey)) {
            if (cleanVal.includes('|') || cleanVal.includes('\n')) {
              const parts = cleanVal.split(/[|\n]/).map((p) => p.trim()).filter(Boolean);
              for (const p of parts) {
                const colonIdx = p.indexOf(':');
                if (colonIdx > -1) {
                  result.push({
                    label: p.slice(0, colonIdx).trim(),
                    valor: p.slice(colonIdx + 1).trim(),
                  });
                } else {
                  result.push({ label: '', valor: p });
                }
              }
            } else {
              result.push({ label: '', valor: cleanVal });
            }
          } else {
            const label =
              DAY_LABELS[normalizedKey] ||
              key
                .replace(/[_-]/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase());

            result.push({
              label,
              valor: cleanVal,
            });
          }
        }
        if (result.length > 0) return result;
      }
    } catch {
      // Se falhar o parse JSON, segue para tratamento como texto livre
    }
  }

  // Tratamento como texto livre (limpando qualquer prefixo "Resumo:" ou "resumo:")
  const cleanedText = trimmed.replace(/^resumo\s*:\s*/i, '');
  if (cleanedText.includes('|') || cleanedText.includes('\n')) {
    const parts = cleanedText.split(/[|\n]/).map((p) => p.trim()).filter(Boolean);
    return parts.map((p) => {
      const colonIdx = p.indexOf(':');
      if (colonIdx > -1) {
        return {
          label: p.slice(0, colonIdx).trim(),
          valor: p.slice(colonIdx + 1).trim(),
        };
      }
      return { label: '', valor: p };
    });
  }

  return [{ label: '', valor: cleanedText }];
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
