using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class PrecificacaoConfiguration : IEntityTypeConfiguration<Precificacao>
{
    public void Configure(EntityTypeBuilder<Precificacao> builder)
    {
        builder.ToTable("precificacoes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.ProdutoId).HasColumnName("produto_id").IsRequired();
        builder.HasIndex(x => x.ProdutoId).IsUnique();
        builder.Property(x => x.CustoTotalInsumos).HasColumnName("custo_total_insumos").HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(x => x.TempoMaoObraMinutos).HasColumnName("tempo_mao_obra_minutos");
        builder.Property(x => x.ValorHoraMaoObra).HasColumnName("valor_hora_mao_obra").HasColumnType("decimal(10,2)");
        builder.Property(x => x.CustoMaoDeObra).HasColumnName("custo_mao_de_obra").HasColumnType("decimal(12,2)");
        builder.Property(x => x.CustoTotalAnterior).HasColumnName("custo_total_anterior").HasColumnType("decimal(12,2)");
        builder.Property(x => x.CustoTotal).HasColumnName("custo_total").HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(x => x.VariacaoCustoPercentual).HasColumnName("variacao_custo_percentual").HasColumnType("decimal(8,2)");
        builder.Property(x => x.AlertaVariacaoPreco).HasColumnName("alerta_variacao_preco").HasDefaultValue(false).IsRequired();
        builder.Property(x => x.MargemSugeridaPercentual).HasColumnName("margem_sugerida_percentual").HasColumnType("decimal(8,2)").HasDefaultValue(100m).IsRequired();
        builder.Property(x => x.PrecoSugerido).HasColumnName("preco_sugerido").HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(x => x.PrecoVendaFinal).HasColumnName("preco_venda_final").HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(x => x.LucroBruto).HasColumnName("lucro_bruto").HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(x => x.MargemRealSobreCusto).HasColumnName("margem_real_sobre_custo").HasColumnType("decimal(8,2)").IsRequired();
        builder.Property(x => x.MargemRealSobreVenda).HasColumnName("margem_real_sobre_venda").HasColumnType("decimal(8,2)").IsRequired();
        builder.Property(x => x.DataUltimaAtualizacao).HasColumnName("data_ultima_atualizacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
    }
}
