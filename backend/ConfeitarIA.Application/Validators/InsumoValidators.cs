using ConfeitarIA.Application.DTOs;
using FluentValidation;

namespace ConfeitarIA.Application.Validators;

public class CriarInsumoRequestValidator : AbstractValidator<CriarInsumoRequest>
{
    public CriarInsumoRequestValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("O nome do insumo é obrigatório.")
            .MaximumLength(200).WithMessage("O nome do insumo deve ter no máximo 200 caracteres.");

        RuleFor(x => x.UnidadeMedida)
            .NotEmpty().WithMessage("A unidade de medida é obrigatória.")
            .MaximumLength(20).WithMessage("A unidade de medida deve ter no máximo 20 caracteres.");
    }
}

public class AtualizarInsumoRequestValidator : AbstractValidator<AtualizarInsumoRequest>
{
    public AtualizarInsumoRequestValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("O nome do insumo é obrigatório.")
            .MaximumLength(200).WithMessage("O nome do insumo deve ter no máximo 200 caracteres.");

        RuleFor(x => x.UnidadeMedida)
            .NotEmpty().WithMessage("A unidade de medida é obrigatória.")
            .MaximumLength(20).WithMessage("A unidade de medida deve ter no máximo 20 caracteres.");
    }
}

