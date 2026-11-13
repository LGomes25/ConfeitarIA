using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class ItemReceitaConfiguration : IEntityTypeConfiguration<ItemReceita>
{
    public void Configure(EntityTypeBuilder<ItemReceita> builder)
    {
        builder.ToTable("itens_receita", table => table.HasCheckConstraint(
            "ck_itens_receita_destino",
            "((insumo_id IS NOT NULL AND ((receita_completa_id IS NULL) <> (componente_id IS NULL))) OR " +
            "(insumo_id IS NULL AND receita_completa_id IS NOT NULL AND componente_id IS NOT NULL))"));
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.ReceitaCompletaId).HasColumnName("receita_completa_id");
        builder.Property(x => x.ComponenteId).HasColumnName("componente_id");
        builder.Property(x => x.InsumoId).HasColumnName("insumo_id");
        builder.Property(x => x.Quantidade).HasColumnName("quantidade").HasColumnType("decimal(12,4)").IsRequired();
        builder.Property(x => x.ValorUnitarioNoCusto).HasColumnName("valor_unitario_no_custo").HasColumnType("decimal(12,6)").IsRequired();
        builder.Property(x => x.CustoItem).HasColumnName("custo_item").HasColumnType("decimal(12,6)")
            .HasComputedColumnSql("quantidade * valor_unitario_no_custo", stored: true);
        builder.Property(x => x.DataCriacao).HasColumnName("data_criacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.DataUltimaAlteracao).HasColumnName("data_ultima_alteracao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.HasOne(x => x.Insumo).WithMany().HasForeignKey(x => x.InsumoId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Componente).WithMany(x => x.Itens).HasForeignKey(x => x.ComponenteId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ReceitaCompleta).WithMany(x => x.Itens).HasForeignKey(x => x.ReceitaCompletaId).OnDelete(DeleteBehavior.Cascade);
    }
}
