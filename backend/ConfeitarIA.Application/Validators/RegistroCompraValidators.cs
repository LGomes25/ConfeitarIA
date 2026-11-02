using ConfeitarIA.Application.DTOs;
using FluentValidation;

namespace ConfeitarIA.Application.Validators;

public class CriarRegistroCompraRequestValidator : AbstractValidator<CriarRegistroCompraRequest>
{
    public CriarRegistroCompraRequestValidator()
    {
        RuleFor(x => x.InsumoId)
            .GreaterThan(0).WithMessage("O insumo vinculado é obrigatório.");

        RuleFor(x => x.DataCompra)
            .NotEmpty().WithMessage("A data da compra é obrigatória.");

        RuleFor(x => x.Quantidade)
            .GreaterThan(0).WithMessage("A quantidade comprada deve ser maior que zero.");

        RuleFor(x => x.ValorTotal)
            .GreaterThanOrEqualTo(0).WithMessage("O valor total não pode ser negativo.");

        RuleFor(x => x.Fornecedor)
            .MaximumLength(200).WithMessage("O nome do fornecedor deve ter no máximo 200 caracteres.");
    }
}

