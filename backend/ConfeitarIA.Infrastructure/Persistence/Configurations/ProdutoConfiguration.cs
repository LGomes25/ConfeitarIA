using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConfeitarIA.Infrastructure.Persistence.Configurations;

public sealed class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("produtos");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.NomePublico).HasColumnName("nome_publico").HasMaxLength(200).IsRequired();
        builder.Property(x => x.DescricaoPublica).HasColumnName("descricao_publica").HasColumnType("text");
        builder.Property(x => x.IngredientesPrincipais).HasColumnName("ingredientes_principais").HasColumnType("text");
        builder.Property(x => x.CategoriaProdutoId).HasColumnName("categoria_produto_id");
        builder.Property(x => x.ReceitaCompletaId).HasColumnName("receita_completa_id");
        builder.Property(x => x.SemLactose).HasColumnName("sem_lactose").HasDefaultValue(false).IsRequired();
        builder.Property(x => x.SemGluten).HasColumnName("sem_gluten").HasDefaultValue(false).IsRequired();
        builder.Property(x => x.Vegano).HasColumnName("vegano").HasDefaultValue(false).IsRequired();
        builder.Property(x => x.EspecificacaoExtra).HasColumnName("especificacao_extra").HasMaxLength(100);
        builder.Property(x => x.ApresentarAoPublico).HasColumnName("apresentar_ao_publico").HasDefaultValue(false).IsRequired();
        builder.Property(x => x.Ativo).HasColumnName("ativo").HasDefaultValue(true).IsRequired();
        builder.Property(x => x.DataCriacao).HasColumnName("data_criacao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.Property(x => x.DataUltimaAlteracao).HasColumnName("data_ultima_alteracao").HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        builder.HasMany(x => x.Componentes).WithOne(x => x.Produto).HasForeignKey(x => x.ProdutoId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.ItensExtras).WithOne(x => x.Produto).HasForeignKey(x => x.ProdutoId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Precificacao).WithOne(x => x.Produto).HasForeignKey<Precificacao>(x => x.ProdutoId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ReceitaCompleta).WithOne().HasForeignKey<Produto>(x => x.ReceitaCompletaId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => x.ReceitaCompletaId).IsUnique();
    }
}
