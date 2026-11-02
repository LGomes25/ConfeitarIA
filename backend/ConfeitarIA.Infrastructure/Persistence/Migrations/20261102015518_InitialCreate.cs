using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ConfeitarIA.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "insumos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    unidade_medida = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_insumos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "registros_compra",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    insumo_id = table.Column<int>(type: "integer", nullable: false),
                    data_compra = table.Column<DateOnly>(type: "date", nullable: false),
                    quantidade = table.Column<decimal>(type: "numeric(12,4)", nullable: false),
                    valor_total = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    valor_unitario = table.Column<decimal>(type: "numeric(12,6)", nullable: false, computedColumnSql: "valor_total / quantidade", stored: true),
                    fornecedor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_registros_compra", x => x.id);
                    table.ForeignKey(
                        name: "FK_registros_compra_insumos_insumo_id",
                        column: x => x.insumo_id,
                        principalTable: "insumos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_insumos_nome",
                table: "insumos",
                column: "nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_registros_data",
                table: "registros_compra",
                column: "data_compra");

            migrationBuilder.CreateIndex(
                name: "idx_registros_insumo",
                table: "registros_compra",
                column: "insumo_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "registros_compra");

            migrationBuilder.DropTable(
                name: "insumos");
        }
    }
}
