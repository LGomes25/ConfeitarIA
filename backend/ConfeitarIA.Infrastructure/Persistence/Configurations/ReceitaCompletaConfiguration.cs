using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class ReceitaCompletaConfiguration : IEntityTypeConfiguration<ReceitaCompleta>
{
    public void Configure(EntityTypeBuilder<ReceitaCompleta> builder)
    {
        builder.ToTable("receitas_completas");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Descricao).HasColumnName("descricao").HasColumnType("text");
        builder.Property(x => x.TempoPreparoMinutos).HasColumnName("tempo_preparo_minutos");
        builder.Property(x => x.Rendimento).HasColumnName("rendimento").HasMaxLength(100);
        builder.Property(x => x.Ativo).HasColumnName("ativo").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.DataCriacao).HasColumnName("data_criacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.DataUltimaAlteracao).HasColumnName("data_ultima_alteracao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.HasMany(x => x.Itens).WithOne(x => x.ReceitaCompleta).HasForeignKey(x => x.ReceitaCompletaId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.Produtos).WithOne(x => x.ReceitaCompleta).HasForeignKey(x => x.ReceitaCompletaId).OnDelete(DeleteBehavior.Restrict);
    }
}
