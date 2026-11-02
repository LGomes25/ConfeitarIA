using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public class InsumoConfiguration : IEntityTypeConfiguration<Insumo>
{
    public void Configure(EntityTypeBuilder<Insumo> builder)
    {
        builder.ToTable("insumos");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(i => i.Nome)
            .HasColumnName("nome")
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(i => i.Nome)
            .IsUnique();

        builder.Property(i => i.UnidadeMedida)
            .HasColumnName("unidade_medida")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(i => i.Ativo)
            .HasColumnName("ativo")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(i => i.DataCriacao)
            .HasColumnName("data_criacao")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.HasMany(i => i.RegistrosCompra)
            .WithOne(r => r.Insumo)
            .HasForeignKey(r => r.InsumoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

