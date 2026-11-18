using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ConfeitarIA.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Fase4_Ajustes_Produtos_Caracteristicas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "especificacao_extra",
                newName: "especificacoes_adicionais",
                table: "produtos");

            migrationBuilder.AlterColumn<string>(
                name: "especificacoes_adicionais",
                table: "produtos",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tipo_produto",
                table: "produtos",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tipo_produto",
                table: "produtos");

            migrationBuilder.AlterColumn<string>(
                name: "especificacoes_adicionais",
                table: "produtos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.RenameColumn(
                name: "especificacoes_adicionais",
                newName: "especificacao_extra",
                table: "produtos");
        }
    }
}
