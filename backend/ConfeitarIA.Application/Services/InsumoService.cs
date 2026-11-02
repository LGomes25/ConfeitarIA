using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Domain.Exceptions;
using ConfeitarIA.Domain.Repositories;
using FluentValidation;

namespace ConfeitarIA.Application.Services;

public class InsumoService : IInsumoService
{
    private readonly IInsumoRepository _insumoRepository;
    private readonly IRegistroCompraRepository _registroCompraRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IValidator<CriarInsumoRequest> _criarValidator;
    private readonly IValidator<AtualizarInsumoRequest> _atualizarValidator;

    public InsumoService(
        IInsumoRepository insumoRepository,
        IRegistroCompraRepository registroCompraRepository,
        IUnitOfWork unitOfWork,
        IValidator<CriarInsumoRequest> criarValidator,
        IValidator<AtualizarInsumoRequest> atualizarValidator)
    {
        _insumoRepository = insumoRepository;
        _registroCompraRepository = registroCompraRepository;
        _unitOfWork = unitOfWork;
        _criarValidator = criarValidator;
        _atualizarValidator = atualizarValidator;
    }

    public async Task<InsumoDto> CriarAsync(CriarInsumoRequest request, CancellationToken cancellationToken = default)
    {
        await _criarValidator.ValidateAndThrowAsync(request, cancellationToken);

        var nomeExiste = await _insumoRepository.ExisteComNomeAsync(request.Nome, null, cancellationToken);
        if (nomeExiste)
            throw new BusinessRuleException($"Já existe um insumo cadastrado com o nome '{request.Nome.Trim()}'.");

        var insumo = new Insumo(request.Nome, request.UnidadeMedida);

        await _insumoRepository.AdicionarAsync(insumo, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return MapearParaDto(insumo, null);
    }

    public async Task<InsumoDto> AtualizarAsync(int id, AtualizarInsumoRequest request, CancellationToken cancellationToken = default)
    {
        await _atualizarValidator.ValidateAndThrowAsync(request, cancellationToken);

        var insumo = await _insumoRepository.ObterPorIdAsync(id, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), id);

        var nomeExiste = await _insumoRepository.ExisteComNomeAsync(request.Nome, id, cancellationToken);
        if (nomeExiste)
            throw new BusinessRuleException($"Já existe outro insumo cadastrado com o nome '{request.Nome.Trim()}'.");

        insumo.Atualizar(request.Nome, request.UnidadeMedida);
        _insumoRepository.Atualizar(insumo);
        await _unitOfWork.CommitAsync(cancellationToken);

        var ultimoRegistro = await _registroCompraRepository.ObterUltimoRegistroAsync(id, cancellationToken);
        return MapearParaDto(insumo, ultimoRegistro?.ValorUnitario);
    }

    public async Task<IReadOnlyList<InsumoDto>> ListarAsync(bool? apenasAtivos = true, CancellationToken cancellationToken = default)
    {
        var insumosComCusto = await _insumoRepository.ListarComCustoAsync(apenasAtivos, cancellationToken);
        return insumosComCusto.Select(x => MapearParaDto(x.Insumo, x.CustoUnitario)).ToList();
    }

    public async Task<InsumoDetalheDto> ObterDetalhePorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var insumo = await _insumoRepository.ObterPorIdAsync(id, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), id);

        var ultimoRegistro = await _registroCompraRepository.ObterUltimoRegistroAsync(id, cancellationToken);

        UltimoRegistroCompraDto? ultimoDto = null;
        decimal? custoUnitario = null;

        if (ultimoRegistro is not null)
        {
            ultimoDto = new UltimoRegistroCompraDto(
                ultimoRegistro.Id,
                ultimoRegistro.DataCompra,
                ultimoRegistro.Quantidade,
                insumo.UnidadeMedida,
                ultimoRegistro.ValorTotal,
                ultimoRegistro.ValorUnitario,
                ultimoRegistro.Fornecedor
            );
            custoUnitario = ultimoRegistro.ValorUnitario;
        }

        return new InsumoDetalheDto(
            insumo.Id,
            insumo.Nome,
            insumo.UnidadeMedida,
            insumo.Ativo,
            insumo.DataCriacao,
            custoUnitario,
            ultimoDto
        );
    }

    public async Task InativarAsync(int id, CancellationToken cancellationToken = default)
    {
        var insumo = await _insumoRepository.ObterPorIdAsync(id, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), id);

        insumo.Inativar();
        _insumoRepository.Atualizar(insumo);
        await _unitOfWork.CommitAsync(cancellationToken);
    }

    public async Task ReativarAsync(int id, CancellationToken cancellationToken = default)
    {
        var insumo = await _insumoRepository.ObterPorIdAsync(id, cancellationToken);
        if (insumo is null)
            throw new EntityNotFoundException(nameof(Insumo), id);

        insumo.Reativar();
        _insumoRepository.Atualizar(insumo);
        await _unitOfWork.CommitAsync(cancellationToken);
    }

    private static InsumoDto MapearParaDto(Insumo insumo, decimal? custoUnitario) =>
        new(insumo.Id, insumo.Nome, insumo.UnidadeMedida, insumo.Ativo, custoUnitario, insumo.DataCriacao);
}
