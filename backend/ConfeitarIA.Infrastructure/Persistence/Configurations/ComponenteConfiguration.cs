using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class ComponenteConfiguration : IEntityTypeConfiguration<Componente>
{
    public void Configure(EntityTypeBuilder<Componente> builder)
    {
        builder.ToTable("componentes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Descricao).HasColumnName("descricao").HasColumnType("text");
        builder.Property(x => x.TempoPreparoMinutos).HasColumnName("tempo_preparo_minutos");
        builder.Property(x => x.Ativo).HasColumnName("ativo").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.DataCriacao).HasColumnName("data_criacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.DataUltimaAlteracao).HasColumnName("data_ultima_alteracao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.HasMany(x => x.Itens).WithOne(x => x.Componente).HasForeignKey(x => x.ComponenteId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.Produtos).WithOne(x => x.Componente).HasForeignKey(x => x.ComponenteId).OnDelete(DeleteBehavior.Restrict);
    }
}
