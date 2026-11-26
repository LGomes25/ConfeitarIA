using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ConfeitarIA.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HistoricoPrecificacaoProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "historico_precificacao_produtos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    produto_id = table.Column<int>(type: "integer", nullable: false),
                    data_registro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    custo_total = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    preco_venda_final = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    margem_lucro = table.Column<decimal>(type: "numeric(18,4)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_historico_precificacao_produtos", x => x.id);
                    table.ForeignKey(
                        name: "FK_historico_precificacao_produtos_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_historico_precificacao_produtos_data_registro",
                table: "historico_precificacao_produtos",
                column: "data_registro");

            migrationBuilder.CreateIndex(
                name: "IX_historico_precificacao_produtos_produto_id",
                table: "historico_precificacao_produtos",
                column: "produto_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "historico_precificacao_produtos");
        }
    }
}
