using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.Infrastructure.Persistence.Context;

public class ConfeitarIADbContext : IdentityDbContext<ApplicationUser>
{
    public ConfeitarIADbContext(DbContextOptions<ConfeitarIADbContext> options) : base(options)
    {
    }

    public DbSet<Insumo> Insumos => Set<Insumo>();
    public DbSet<RegistroCompra> RegistrosCompra => Set<RegistroCompra>();
    public DbSet<Endereco> Enderecos => Set<Endereco>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Componente> Componentes => Set<Componente>();
    public DbSet<ReceitaCompleta> ReceitasCompletas => Set<ReceitaCompleta>();
    public DbSet<ItemReceita> ItensReceita => Set<ItemReceita>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<ProdutoComponente> ProdutoComponentes => Set<ProdutoComponente>();
    public DbSet<ItemExtraProduto> ItensExtrasProduto => Set<ItemExtraProduto>();
    public DbSet<Precificacao> Precificacoes => Set<Precificacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ConfeitarIADbContext).Assembly);
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.NomeApelido).HasMaxLength(100).IsRequired();
            entity.Property(user => user.Email).HasMaxLength(150);
            entity.Property(user => user.PhoneNumber).HasMaxLength(20);
            entity.HasIndex(user => user.NormalizedEmail)
                .HasDatabaseName("EmailIndex")
                .IsUnique()
                .HasFilter("\"NormalizedEmail\" IS NOT NULL");
            entity.HasIndex(user => user.PhoneNumber).IsUnique().HasFilter("\"PhoneNumber\" IS NOT NULL");
        });
        modelBuilder.Entity<Endereco>(entity =>
        {
            entity.ToTable("Enderecos");
            entity.HasKey(address => address.Id);
            entity.Property(address => address.Tipo).HasMaxLength(20).IsRequired();
            entity.Property(address => address.Logradouro).HasMaxLength(200);
            entity.Property(address => address.Numero).HasMaxLength(20);
            entity.Property(address => address.Bairro).HasMaxLength(100);
            entity.Property(address => address.Cidade).HasMaxLength(100);
            entity.Property(address => address.UF).HasColumnType("char(2)");
            entity.Property(address => address.CEP).HasMaxLength(10);
            entity.HasIndex(address => new { address.UsuarioId, address.Tipo }).IsUnique();
            entity.HasOne(address => address.Usuario)
                .WithMany(user => user.Enderecos)
                .HasForeignKey(address => address.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(token => token.Id);
            entity.Property(token => token.Token).IsRequired();
            entity.HasIndex(token => token.Token).IsUnique();
            entity.HasOne(token => token.Usuario)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
