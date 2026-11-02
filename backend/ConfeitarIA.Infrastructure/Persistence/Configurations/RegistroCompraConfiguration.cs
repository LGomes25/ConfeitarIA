using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public class RegistroCompraConfiguration : IEntityTypeConfiguration<RegistroCompra>
{
    public void Configure(EntityTypeBuilder<RegistroCompra> builder)
    {
        builder.ToTable("registros_compra");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(r => r.InsumoId)
            .HasColumnName("insumo_id")
            .IsRequired();

        builder.Property(r => r.DataCompra)
            .HasColumnName("data_compra")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(r => r.Quantidade)
            .HasColumnName("quantidade")
            .HasColumnType("decimal(12,4)")
            .IsRequired();

        builder.Property(r => r.ValorTotal)
            .HasColumnName("valor_total")
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(r => r.ValorUnitario)
            .HasColumnName("valor_unitario")
            .HasColumnType("decimal(12,6)")
            .HasComputedColumnSql("valor_total / quantidade", stored: true);

        builder.Property(r => r.Fornecedor)
            .HasColumnName("fornecedor")
            .HasMaxLength(200);

        builder.Property(r => r.DataCriacao)
            .HasColumnName("data_criacao")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.HasIndex(r => r.InsumoId)
            .HasDatabaseName("idx_registros_insumo");

        builder.HasIndex(r => r.DataCompra)
            .HasDatabaseName("idx_registros_data");
    }
}

