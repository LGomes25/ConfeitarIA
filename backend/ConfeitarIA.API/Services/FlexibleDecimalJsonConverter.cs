using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ConfeitarIA.API.Services;

public sealed class FlexibleDecimalJsonConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
            return reader.GetDecimal();

        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("O valor decimal deve ser um número ou texto numérico.");

        var input = reader.GetString()?.Trim();
        if (string.IsNullOrEmpty(input))
            throw new JsonException("O valor decimal não pode estar vazio.");

        var normalized = Normalize(input);
        if (decimal.TryParse(normalized, NumberStyles.Float, CultureInfo.InvariantCulture, out var value))
            return value;

        throw new JsonException($"O valor '{input}' não é um decimal válido.");
    }

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options) =>
        writer.WriteNumberValue(value);

    private static string Normalize(string input)
    {
        var commaIndex = input.LastIndexOf(',');
        var dotIndex = input.LastIndexOf('.');

        if (commaIndex < 0)
            return input;
        if (dotIndex < 0)
            return input.Replace(',', '.');

        var decimalSeparator = commaIndex > dotIndex ? ',' : '.';
        var groupSeparator = decimalSeparator == ',' ? '.' : ',';
        return input
            .Replace(groupSeparator.ToString(), string.Empty)
            .Replace(decimalSeparator, '.');
    }
}
