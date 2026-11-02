using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Domain.Exceptions;
using ConfeitarIA.Domain.Repositories;
using FluentValidation;

namespace ConfeitarIA.Application.Services;

public class RegistroCompraService : IRegistroCompraService
{
    private readonly IRegistroCompraRepository _registroCompraRepository;
    private readonly IInsumoRepository _insumoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CriarRegistroCompraRequest> _criarValidator;

    public RegistroCompraService(
        IRegistroCompraRepository registroCompraRepository,
        IInsumoRepository insumoRepository,
        IUnitOfWork unitOfWork,
        IValidator<CriarRegistroCompraRequest> criarValidator)
    {
        _registroCompraRepository = registroCompraRepository;
        _insumoRepository = insumoRepository;
        _unitOfWork = unitOfWork;
        _criarValidator = criarValidator;
    }

    public async Task<RegistroCompraDto> RegistrarCompraAsync(CriarRegistroCompraRequest request, CancellationToken cancellationToken = default)
    {
        await _criarValidator.ValidateAndThrowAsync(request, cancellationToken);

        var insumo = await _insumoRepository.ObterPorIdAsync(request.InsumoId, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), request.InsumoId);

        // Regra R1.05 e R2.04: Insumo inativo não aceita novos registros de compra
        if (!insumo.Ativo)
            throw new BusinessRuleException($"Não é permitido registrar compras para o insumo inativo '{insumo.Nome}'. Reative o insumo antes de prosseguir.");

        var registro = new RegistroCompra(
            request.InsumoId,
            request.DataCompra,
            request.Quantidade,
            request.ValorTotal,
            request.Fornecedor
        );

        await _registroCompraRepository.AdicionarAsync(registro, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return new RegistroCompraDto(
            registro.Id,
            registro.InsumoId,
            insumo.Nome,
            insumo.UnidadeMedida,
            registro.DataCompra,
            registro.Quantidade,
            registro.ValorTotal,
            registro.ValorUnitario,
            registro.Fornecedor,
            registro.DataCriacao
        );
    }

    public async Task<IReadOnlyList<RegistroCompraDto>> ListarPorInsumoAsync(int insumoId, CancellationToken cancellationToken = default)
    {
        var insumo = await _insumoRepository.ObterPorIdAsync(insumoId, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), insumoId);

        var compras = await _registroCompraRepository.ListarPorInsumoAsync(insumoId, cancellationToken);

        return compras.Select(c => new RegistroCompraDto(
            c.Id,
            c.InsumoId,
            insumo.Nome,
            insumo.UnidadeMedida,
            c.DataCompra,
            c.Quantidade,
            c.ValorTotal,
            c.ValorUnitario,
            c.Fornecedor,
            c.DataCriacao
        )).ToList();
    }

    public async Task<GraficoEvolucaoPrecosDto> ObterGraficoEvolucaoPrecosAsync(int insumoId, CancellationToken cancellationToken = default)
    {
        var insumo = await _insumoRepository.ObterPorIdAsync(insumoId, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), insumoId);

        // Regra R3.02: Últimos 12 meses
        var dataReferencia = DateOnly.FromDateTime(DateTime.UtcNow);
        var registros12Meses = await _registroCompraRepository.ObterHistoricoUltimos12MesesAsync(insumoId, dataReferencia, cancellationToken);

        var pontos = registros12Meses.Select(r => new PontoGraficoPrecoDto(
            r.DataCompra,
            r.ValorUnitario,
            r.Quantidade,
            r.ValorTotal,
            r.Fornecedor
        )).ToList();

        var ultimoRegistro = await _registroCompraRepository.ObterUltimoRegistroAsync(insumoId, cancellationToken);

        return new GraficoEvolucaoPrecosDto(
            insumo.Id,
            insumo.Nome,
            insumo.UnidadeMedida,
            insumo.Ativo,
            ultimoRegistro?.ValorUnitario,
            pontos
        );
    }

    public async Task ExcluirRegistroAsync(int id, CancellationToken cancellationToken = default)
    {
        var registro = await _registroCompraRepository.ObterPorIdAsync(id, cancellationToken);
        if (registro is null)
            throw new EntityNotFoundException(nameof(RegistroCompra), id);

        // Regra R2.05: Excluir um registro de compra não remove o insumo
        _registroCompraRepository.Remover(registro);
        await _unitOfWork.CommitAsync(cancellationToken);
    }
}
