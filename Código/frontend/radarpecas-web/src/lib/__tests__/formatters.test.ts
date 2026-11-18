import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HORARIOS_LOJA,
  formatHorariosFuncionamento,
  formatMoneyBR,
  parseHorariosEditor,
  parseHorariosFuncionamento,
} from '../formatters';

describe('formatters', () => {
  it('formata valores monetários no padrão pt-BR (BRL)', () => {
    const formatado = formatMoneyBR(149.9).replace(/\u00A0/g, ' ');
    expect(formatado).toBe('R$ 149,90');
    expect(formatMoneyBR(0).replace(/\u00A0/g, ' ')).toBe('R$ 0,00');
  });

  it('converte horários em JSON array, objeto legado e texto livre sem prefixo "Resumo:"', () => {
    const legado = JSON.stringify({ seg_sex: '08:00 - 18:00', sab: '08:00 - 12:00' });
    const itensLegado = parseHorariosFuncionamento(legado);
    expect(itensLegado).toEqual([
      { label: 'Seg a Sex', valor: '08:00 - 18:00' },
      { label: 'Sáb', valor: '08:00 - 12:00' },
    ]);

    expect(formatHorariosFuncionamento(legado)).toBe('Seg a Sex: 08:00 - 18:00 • Sáb: 08:00 - 12:00');
    expect(parseHorariosFuncionamento('Resumo: Segunda a Sexta: 08:00 às 17:30')).toEqual([
      { label: '', valor: 'Segunda a Sexta: 08:00 às 17:30' },
    ]);
  });

  it('gera os 7 dias editáveis para o Painel do Lojista a partir de array, objeto legado ou fallback', () => {
    expect(parseHorariosEditor(null)).toEqual(DEFAULT_HORARIOS_LOJA);

    const dias = parseHorariosEditor(
      JSON.stringify({ seg_sex: '07:30 - 17:30', sab: '08:00 - 12:00', dom: 'Fechado' }),
    );
    expect(dias).toHaveLength(7);
    expect(dias[0]).toEqual({ dia: 'Segunda', abre: '07:30', fecha: '17:30', fechado: false });
    expect(dias[5]).toEqual({ dia: 'Sábado', abre: '08:00', fecha: '12:00', fechado: false });
    expect(dias[6]).toMatchObject({ dia: 'Domingo', fechado: true });
  });
});
