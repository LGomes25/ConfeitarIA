using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace ConfeitarIA.Application.DTOs;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class DecimalRangeAttribute : ValidationAttribute
{
    private readonly decimal _minimum;
    private readonly decimal _maximum;

    public DecimalRangeAttribute(string minimum, string maximum)
    {
        _minimum = ParseBound(minimum);
        _maximum = ParseBound(maximum);

        if (_minimum > _maximum)
            throw new ArgumentException("O limite mínimo deve ser menor ou igual ao limite máximo.");
    }

    public override bool IsValid(object? value)
    {
        if (value is null)
            return true;

        try
        {
            var number = Convert.ToDecimal(value, CultureInfo.InvariantCulture);
            return number >= _minimum && number <= _maximum;
        }
        catch (FormatException)
        {
            return false;
        }
        catch (InvalidCastException)
        {
            return false;
        }
        catch (OverflowException)
        {
            return false;
        }
    }

    public override string FormatErrorMessage(string name) =>
        ErrorMessage ?? $"{name} deve estar entre {_minimum} e {_maximum}.";

    private static decimal ParseBound(string value)
    {
        var normalized = value.Replace(',', '.');
        if (!decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out var bound))
            throw new ArgumentException($"Limite decimal inválido: {value}");
        return bound;
    }
}
