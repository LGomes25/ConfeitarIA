using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class ProdutoComponenteConfiguration : IEntityTypeConfiguration<ProdutoComponente>
{
    public void Configure(EntityTypeBuilder<ProdutoComponente> builder)
    {
        builder.ToTable("produto_componentes", table => table.HasCheckConstraint(
            "ck_produto_componentes_destino", "(componente_id IS NULL) <> (receita_completa_id IS NULL)"));
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.ProdutoId).HasColumnName("produto_id").IsRequired();
        builder.Property(x => x.ComponenteId).HasColumnName("componente_id");
        builder.Property(x => x.ReceitaCompletaId).HasColumnName("receita_completa_id");
        builder.Property(x => x.Ordem).HasColumnName("ordem").IsRequired();
        builder.Property(x => x.DataCriacao).HasColumnName("data_criacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.DataUltimaAlteracao).HasColumnName("data_ultima_alteracao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.HasOne(x => x.Componente).WithMany(x => x.Produtos).HasForeignKey(x => x.ComponenteId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ReceitaCompleta).WithMany(x => x.Produtos).HasForeignKey(x => x.ReceitaCompletaId).OnDelete(DeleteBehavior.Restrict);
    }
}
