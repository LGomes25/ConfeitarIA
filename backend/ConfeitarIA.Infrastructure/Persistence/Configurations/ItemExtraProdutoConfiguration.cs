using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class ItemExtraProdutoConfiguration : IEntityTypeConfiguration<ItemExtraProduto>
{
    public void Configure(EntityTypeBuilder<ItemExtraProduto> builder)
    {
        builder.ToTable("itens_extras_produto", table => table.HasCheckConstraint(
            "ck_itens_extras_tipo",
            "(insumo_id IS NOT NULL AND descricao_item IS NULL AND quantidade IS NOT NULL) OR (insumo_id IS NULL AND descricao_item IS NOT NULL AND quantidade IS NULL)"));
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.ProdutoId).HasColumnName("produto_id").IsRequired();
        builder.Property(x => x.InsumoId).HasColumnName("insumo_id");
        builder.Property(x => x.DescricaoItem).HasColumnName("descricao_item").HasMaxLength(200);
        builder.Property(x => x.Quantidade).HasColumnName("quantidade").HasColumnType("decimal(12,4)");
        builder.Property(x => x.ValorUnitario).HasColumnName("valor_unitario").HasColumnType("decimal(12,6)").IsRequired();
        builder.Property(x => x.CustoItem).HasColumnName("custo_item").HasColumnType("decimal(12,6)")
            .HasComputedColumnSql("CASE WHEN quantidade IS NULL THEN valor_unitario ELSE quantidade * valor_unitario END", stored: true);
        builder.Property(x => x.DataCriacao).HasColumnName("data_criacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.DataUltimaAlteracao).HasColumnName("data_ultima_alteracao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.HasOne(x => x.Insumo).WithMany().HasForeignKey(x => x.InsumoId).OnDelete(DeleteBehavior.Restrict);
    }
}
