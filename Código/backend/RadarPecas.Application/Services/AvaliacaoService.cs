using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Avaliacoes;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class AvaliacaoService : IAvaliacaoService
{
    private readonly IApplicationDbContext _context;

    public AvaliacaoService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<AvaliacoesResumoResponse>> ObterAvaliacoesLojaAsync(Guid lojaId, CancellationToken cancellationToken = default)
    {
        var avaliacoes = await _context.AvaliacoesLoja
            .AsNoTracking()
            .Include(a => a.Usuario)
            .Where(a => a.LojaId == lojaId)
            .OrderByDescending(a => a.DataAvaliacao)
            .ToListAsync(cancellationToken);

        var total = avaliacoes.Count;
        var media = total > 0 ? Math.Round(avaliacoes.Average(a => a.Nota), 1) : 5.0;
        var percentualRecomenda = total > 0 ? Math.Round((double)avaliacoes.Count(a => a.Recomenda) / total * 100, 1) : 100.0;

        var lista = avaliacoes.Select(a => new AvaliacaoResponse
        {
            Id = a.Id,
            LojaId = a.LojaId,
            UsuarioId = a.UsuarioId,
            NomeUsuario = a.Usuario != null ? a.Usuario.Nome : "Cliente",
            Nota = a.Nota,
            Comentario = a.Comentario,
            Recomenda = a.Recomenda,
            DataAvaliacao = a.DataAvaliacao
        }).ToList();

        var response = new AvaliacoesResumoResponse
        {
            LojaId = lojaId,
            MediaNotas = media,
            TotalAvaliacoes = total,
            PercentualRecomendacao = percentualRecomenda,
            Avaliacoes = lista
        };

        return ApiResponse<AvaliacoesResumoResponse>.Ok(response);
    }

    public async Task<ApiResponse<AvaliacaoResponse>> AvaliarLojaAsync(Guid usuarioId, Guid lojaId, CriarAvaliacaoRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Nota < 1 || request.Nota > 5)
        {
            return ApiResponse<AvaliacaoResponse>.Fail("A nota da avaliação deve estar entre 1 e 5 estrelas.");
        }

        var lojaExiste = await _context.Lojas.AnyAsync(l => l.Id == lojaId, cancellationToken);
        if (!lojaExiste)
        {
            return ApiResponse<AvaliacaoResponse>.Fail("Loja não encontrada.");
        }

        // Verifica se o usuário já avaliou esta loja (atualiza ou insere)
        var avaliacaoExistente = await _context.AvaliacoesLoja
            .Include(a => a.Usuario)
            .FirstOrDefaultAsync(a => a.LojaId == lojaId && a.UsuarioId == usuarioId, cancellationToken);

        if (avaliacaoExistente != null)
        {
            avaliacaoExistente.Nota = request.Nota;
            avaliacaoExistente.Comentario = request.Comentario?.Trim();
            avaliacaoExistente.Recomenda = request.Recomenda;
            avaliacaoExistente.DataAvaliacao = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            var response = new AvaliacaoResponse
            {
                Id = avaliacaoExistente.Id,
                LojaId = avaliacaoExistente.LojaId,
                UsuarioId = avaliacaoExistente.UsuarioId,
                NomeUsuario = avaliacaoExistente.Usuario?.Nome ?? "Cliente",
                Nota = avaliacaoExistente.Nota,
                Comentario = avaliacaoExistente.Comentario,
                Recomenda = avaliacaoExistente.Recomenda,
                DataAvaliacao = avaliacaoExistente.DataAvaliacao
            };

            return ApiResponse<AvaliacaoResponse>.Ok(response, "Sua avaliação foi atualizada com sucesso.");
        }
        else
        {
            var novaAvaliacao = new AvaliacaoLoja
            {
                LojaId = lojaId,
                UsuarioId = usuarioId,
                Nota = request.Nota,
                Comentario = request.Comentario?.Trim(),
                Recomenda = request.Recomenda,
                DataAvaliacao = DateTime.UtcNow
            };

            await _context.AvaliacoesLoja.AddAsync(novaAvaliacao, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var usuario = await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == usuarioId, cancellationToken);

            var response = new AvaliacaoResponse
            {
                Id = novaAvaliacao.Id,
                LojaId = novaAvaliacao.LojaId,
                UsuarioId = novaAvaliacao.UsuarioId,
                NomeUsuario = usuario?.Nome ?? "Cliente",
                Nota = novaAvaliacao.Nota,
                Comentario = novaAvaliacao.Comentario,
                Recomenda = novaAvaliacao.Recomenda,
                DataAvaliacao = novaAvaliacao.DataAvaliacao
            };

            return ApiResponse<AvaliacaoResponse>.Ok(response, "Avaliação registrada com sucesso.");
        }
    }
}
