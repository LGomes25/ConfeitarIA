using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class HistoricoPrecificacaoProdutoConfiguration :
    IEntityTypeConfiguration<HistoricoPrecificacaoProduto>
{
    public void Configure(EntityTypeBuilder<HistoricoPrecificacaoProduto> builder)
    {
        builder.ToTable("historico_precificacao_produtos");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.ProdutoId).HasColumnName("produto_id").IsRequired();
        builder.Property(x => x.DataRegistro).HasColumnName("data_registro")
            .HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.CustoTotal).HasColumnName("custo_total")
            .HasColumnType("decimal(18,4)").IsRequired();
        builder.Property(x => x.PrecoVendaFinal).HasColumnName("preco_venda_final")
            .HasColumnType("decimal(18,4)").IsRequired();
        builder.Property(x => x.MargemLucro).HasColumnName("margem_lucro")
            .HasColumnType("decimal(18,4)").IsRequired();
        builder.HasIndex(x => x.ProdutoId);
        builder.HasIndex(x => x.DataRegistro);
        builder.HasOne(x => x.Produto).WithMany().HasForeignKey(x => x.ProdutoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
