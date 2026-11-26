using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConfeitarIA.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Fase4AjustesFluxoProdutos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_itens_receita_destino",
                table: "itens_receita");

            migrationBuilder.AddColumn<bool>(
                name: "apresentar_ao_publico",
                table: "produtos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "especificacao_extra",
                table: "produtos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "receita_completa_id",
                table: "produtos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "sem_gluten",
                table: "produtos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "sem_lactose",
                table: "produtos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "vegano",
                table: "produtos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "insumo_id",
                table: "itens_receita",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_produtos_receita_completa_id",
                table: "produtos",
                column: "receita_completa_id",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_itens_receita_destino",
                table: "itens_receita",
                sql: "((insumo_id IS NOT NULL AND ((receita_completa_id IS NULL) <> (componente_id IS NULL))) OR (insumo_id IS NULL AND receita_completa_id IS NOT NULL AND componente_id IS NOT NULL))");

            migrationBuilder.AddForeignKey(
                name: "FK_produtos_receitas_completas_receita_completa_id",
                table: "produtos",
                column: "receita_completa_id",
                principalTable: "receitas_completas",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_produtos_receitas_completas_receita_completa_id",
                table: "produtos");

            migrationBuilder.DropIndex(
                name: "IX_produtos_receita_completa_id",
                table: "produtos");

            migrationBuilder.DropCheckConstraint(
                name: "ck_itens_receita_destino",
                table: "itens_receita");

            migrationBuilder.DropColumn(
                name: "apresentar_ao_publico",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "especificacao_extra",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "receita_completa_id",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "sem_gluten",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "sem_lactose",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "vegano",
                table: "produtos");

            migrationBuilder.AlterColumn<int>(
                name: "insumo_id",
                table: "itens_receita",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_itens_receita_destino",
                table: "itens_receita",
                sql: "(receita_completa_id IS NULL) <> (componente_id IS NULL)");
        }
    }
}
