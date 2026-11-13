using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ConfeitarIA.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Fase4_ReceitasPrecificacaoProdutos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "componentes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    descricao = table.Column<string>(type: "text", nullable: true),
                    tempo_preparo_minutos = table.Column<int>(type: "integer", nullable: true),
                    ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    data_ultima_alteracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_componentes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "produtos",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome_publico = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    descricao_publica = table.Column<string>(type: "text", nullable: true),
                    ingredientes_principais = table.Column<string>(type: "text", nullable: true),
                    categoria_produto_id = table.Column<int>(type: "integer", nullable: true),
                    ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    data_ultima_alteracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_produtos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "receitas_completas",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    descricao = table.Column<string>(type: "text", nullable: true),
                    tempo_preparo_minutos = table.Column<int>(type: "integer", nullable: true),
                    rendimento = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    data_ultima_alteracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receitas_completas", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "itens_extras_produto",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    produto_id = table.Column<int>(type: "integer", nullable: false),
                    insumo_id = table.Column<int>(type: "integer", nullable: true),
                    descricao_item = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    quantidade = table.Column<decimal>(type: "numeric(12,4)", nullable: true),
                    valor_unitario = table.Column<decimal>(type: "numeric(12,6)", nullable: false),
                    custo_item = table.Column<decimal>(type: "numeric(12,6)", nullable: false, computedColumnSql: "CASE WHEN quantidade IS NULL THEN valor_unitario ELSE quantidade * valor_unitario END", stored: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    data_ultima_alteracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_itens_extras_produto", x => x.id);
                    table.CheckConstraint("ck_itens_extras_tipo", "(insumo_id IS NOT NULL AND descricao_item IS NULL AND quantidade IS NOT NULL) OR (insumo_id IS NULL AND descricao_item IS NOT NULL AND quantidade IS NULL)");
                    table.ForeignKey(
                        name: "FK_itens_extras_produto_insumos_insumo_id",
                        column: x => x.insumo_id,
                        principalTable: "insumos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_itens_extras_produto_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "precificacoes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    produto_id = table.Column<int>(type: "integer", nullable: false),
                    custo_total_insumos = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    tempo_mao_obra_minutos = table.Column<int>(type: "integer", nullable: true),
                    valor_hora_mao_obra = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    custo_mao_de_obra = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    custo_total_anterior = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    custo_total = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    variacao_custo_percentual = table.Column<decimal>(type: "numeric(8,2)", nullable: true),
                    alerta_variacao_preco = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    margem_sugerida_percentual = table.Column<decimal>(type: "numeric(8,2)", nullable: false, defaultValue: 100m),
                    preco_sugerido = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    preco_venda_final = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    lucro_bruto = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    margem_real_sobre_custo = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    margem_real_sobre_venda = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    data_ultima_atualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_precificacoes", x => x.id);
                    table.ForeignKey(
                        name: "FK_precificacoes_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itens_receita",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    receita_completa_id = table.Column<int>(type: "integer", nullable: true),
                    componente_id = table.Column<int>(type: "integer", nullable: true),
                    insumo_id = table.Column<int>(type: "integer", nullable: false),
                    quantidade = table.Column<decimal>(type: "numeric(12,4)", nullable: false),
                    valor_unitario_no_custo = table.Column<decimal>(type: "numeric(12,6)", nullable: false),
                    custo_item = table.Column<decimal>(type: "numeric(12,6)", nullable: false, computedColumnSql: "quantidade * valor_unitario_no_custo", stored: true),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    data_ultima_alteracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_itens_receita", x => x.id);
                    table.CheckConstraint("ck_itens_receita_destino", "(receita_completa_id IS NULL) <> (componente_id IS NULL)");
                    table.ForeignKey(
                        name: "FK_itens_receita_componentes_componente_id",
                        column: x => x.componente_id,
                        principalTable: "componentes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_itens_receita_insumos_insumo_id",
                        column: x => x.insumo_id,
                        principalTable: "insumos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_itens_receita_receitas_completas_receita_completa_id",
                        column: x => x.receita_completa_id,
                        principalTable: "receitas_completas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "produto_componentes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    produto_id = table.Column<int>(type: "integer", nullable: false),
                    componente_id = table.Column<int>(type: "integer", nullable: true),
                    receita_completa_id = table.Column<int>(type: "integer", nullable: true),
                    ordem = table.Column<int>(type: "integer", nullable: false),
                    data_criacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    data_ultima_alteracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_produto_componentes", x => x.id);
                    table.CheckConstraint("ck_produto_componentes_destino", "(componente_id IS NULL) <> (receita_completa_id IS NULL)");
                    table.ForeignKey(
                        name: "FK_produto_componentes_componentes_componente_id",
                        column: x => x.componente_id,
                        principalTable: "componentes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_produto_componentes_produtos_produto_id",
                        column: x => x.produto_id,
                        principalTable: "produtos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_produto_componentes_receitas_completas_receita_completa_id",
                        column: x => x.receita_completa_id,
                        principalTable: "receitas_completas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_itens_extras_produto_insumo_id",
                table: "itens_extras_produto",
                column: "insumo_id");

            migrationBuilder.CreateIndex(
                name: "IX_itens_extras_produto_produto_id",
                table: "itens_extras_produto",
                column: "produto_id");

            migrationBuilder.CreateIndex(
                name: "IX_itens_receita_componente_id",
                table: "itens_receita",
                column: "componente_id");

            migrationBuilder.CreateIndex(
                name: "IX_itens_receita_insumo_id",
                table: "itens_receita",
                column: "insumo_id");

            migrationBuilder.CreateIndex(
                name: "IX_itens_receita_receita_completa_id",
                table: "itens_receita",
                column: "receita_completa_id");

            migrationBuilder.CreateIndex(
                name: "IX_precificacoes_produto_id",
                table: "precificacoes",
                column: "produto_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_produto_componentes_componente_id",
                table: "produto_componentes",
                column: "componente_id");

            migrationBuilder.CreateIndex(
                name: "IX_produto_componentes_produto_id",
                table: "produto_componentes",
                column: "produto_id");

            migrationBuilder.CreateIndex(
                name: "IX_produto_componentes_receita_completa_id",
                table: "produto_componentes",
                column: "receita_completa_id");

            migrationBuilder.Sql("""
                CREATE OR REPLACE FUNCTION recalcular_precificacao_produto(p_produto_id integer)
                RETURNS void
                LANGUAGE plpgsql
                AS $function$
                DECLARE
                    v_custo_insumos numeric(12,2);
                    v_custo_mao_obra numeric(12,2);
                    v_custo_anterior numeric(12,2);
                    v_custo_total numeric(12,2);
                    v_variacao numeric(8,2);
                    v_alerta boolean;
                    v_minutos integer;
                    v_valor_hora numeric(10,2);
                    v_margem numeric(8,2);
                    v_preco_final numeric(10,2);
                    v_preco_sugerido numeric(10,2);
                    v_lucro numeric(10,2);
                BEGIN
                    SELECT custo_total, alerta_variacao_preco, tempo_mao_obra_minutos,
                           valor_hora_mao_obra, margem_sugerida_percentual, preco_venda_final
                      INTO v_custo_anterior, v_alerta, v_minutos, v_valor_hora, v_margem, v_preco_final
                      FROM precificacoes
                     WHERE produto_id = p_produto_id
                     FOR UPDATE;

                    IF NOT FOUND THEN
                        RETURN;
                    END IF;

                    SELECT COALESCE(SUM(custo_item), 0)
                      INTO v_custo_insumos
                      FROM (
                            SELECT ir.custo_item
                              FROM produto_componentes pc
                              JOIN itens_receita ir ON ir.componente_id = pc.componente_id
                             WHERE pc.produto_id = p_produto_id
                            UNION ALL
                            SELECT ir.custo_item
                              FROM produto_componentes pc
                              JOIN itens_receita ir ON ir.receita_completa_id = pc.receita_completa_id
                             WHERE pc.produto_id = p_produto_id
                            UNION ALL
                            SELECT ie.custo_item
                              FROM itens_extras_produto ie
                             WHERE ie.produto_id = p_produto_id
                      ) itens;

                    v_custo_mao_obra := CASE
                        WHEN v_minutos IS NOT NULL AND v_valor_hora IS NOT NULL
                            THEN ROUND(v_minutos * v_valor_hora / 60, 2)
                        ELSE 0
                    END;
                    v_custo_total := ROUND(v_custo_insumos + v_custo_mao_obra, 2);
                    v_variacao := CASE
                        WHEN v_custo_anterior > 0
                            THEN ROUND((v_custo_total - v_custo_anterior) / v_custo_anterior * 100, 2)
                        ELSE NULL
                    END;
                    v_alerta := COALESCE(v_alerta, false)
                        OR COALESCE(ABS(v_variacao) >= 5, false);
                    v_preco_sugerido := ROUND(v_custo_total * (1 + v_margem / 100), 2);
                    v_lucro := ROUND(v_preco_final - v_custo_total, 2);

                    UPDATE precificacoes
                       SET custo_total_anterior = v_custo_anterior,
                           custo_total_insumos = ROUND(v_custo_insumos, 2),
                           custo_mao_de_obra = CASE WHEN v_minutos IS NULL OR v_valor_hora IS NULL
                               THEN NULL ELSE v_custo_mao_obra END,
                           custo_total = v_custo_total,
                           variacao_custo_percentual = v_variacao,
                           alerta_variacao_preco = v_alerta,
                           preco_sugerido = v_preco_sugerido,
                           lucro_bruto = v_lucro,
                           margem_real_sobre_custo = CASE WHEN v_custo_total = 0
                               THEN 0 ELSE ROUND(v_lucro / v_custo_total * 100, 2) END,
                           margem_real_sobre_venda = CASE WHEN v_preco_final = 0
                               THEN 0 ELSE ROUND(v_lucro / v_preco_final * 100, 2) END,
                           data_ultima_atualizacao = CURRENT_TIMESTAMP
                     WHERE produto_id = p_produto_id;
                END;
                $function$;

                CREATE OR REPLACE FUNCTION atualizar_custos_por_compra()
                RETURNS trigger
                LANGUAGE plpgsql
                AS $function$
                DECLARE
                    v_insumo_id integer;
                    v_custo_unitario numeric(12,6);
                    v_produto_id integer;
                BEGIN
                    IF TG_OP = 'UPDATE' AND OLD.insumo_id IS DISTINCT FROM NEW.insumo_id THEN
                        v_insumo_id := OLD.insumo_id;
                        PERFORM atualizar_snapshots_e_precos(v_insumo_id);
                    END IF;

                    IF TG_OP = 'DELETE' THEN
                        v_insumo_id := OLD.insumo_id;
                    ELSE
                        v_insumo_id := NEW.insumo_id;
                    END IF;

                    PERFORM atualizar_snapshots_e_precos(v_insumo_id);
                    IF TG_OP = 'DELETE' THEN
                        RETURN OLD;
                    END IF;
                    RETURN NEW;
                END;
                $function$;

                CREATE OR REPLACE FUNCTION atualizar_snapshots_e_precos(p_insumo_id integer)
                RETURNS void
                LANGUAGE plpgsql
                AS $function$
                DECLARE
                    v_custo_unitario numeric(12,6);
                    v_produto_id integer;
                BEGIN
                    SELECT valor_unitario
                      INTO v_custo_unitario
                      FROM registros_compra
                     WHERE insumo_id = p_insumo_id
                     ORDER BY data_compra DESC, id DESC
                     LIMIT 1;

                    UPDATE itens_receita
                       SET valor_unitario_no_custo = COALESCE(v_custo_unitario, 0),
                           data_ultima_alteracao = CURRENT_TIMESTAMP
                     WHERE insumo_id = p_insumo_id;
                    UPDATE itens_extras_produto
                       SET valor_unitario = COALESCE(v_custo_unitario, 0),
                           data_ultima_alteracao = CURRENT_TIMESTAMP
                     WHERE insumo_id = p_insumo_id;

                    FOR v_produto_id IN
                        SELECT DISTINCT pc.produto_id
                          FROM produto_componentes pc
                          JOIN itens_receita ir
                            ON ir.componente_id = pc.componente_id
                            OR ir.receita_completa_id = pc.receita_completa_id
                         WHERE ir.insumo_id = p_insumo_id
                        UNION
                        SELECT DISTINCT produto_id
                          FROM itens_extras_produto
                         WHERE insumo_id = p_insumo_id
                    LOOP
                        PERFORM recalcular_precificacao_produto(v_produto_id);
                    END LOOP;
                END;
                $function$;

                CREATE TRIGGER tr_registros_compra_atualizar_precificacao
                AFTER INSERT OR DELETE OR UPDATE OF insumo_id, quantidade, valor_total, data_compra
                ON registros_compra
                FOR EACH ROW
                EXECUTE FUNCTION atualizar_custos_por_compra();
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TRIGGER IF EXISTS tr_registros_compra_atualizar_precificacao ON registros_compra;
                DROP FUNCTION IF EXISTS atualizar_custos_por_compra();
                DROP FUNCTION IF EXISTS atualizar_snapshots_e_precos(integer);
                DROP FUNCTION IF EXISTS recalcular_precificacao_produto(integer);
                """);

            migrationBuilder.DropTable(
                name: "itens_extras_produto");

            migrationBuilder.DropTable(
                name: "itens_receita");

            migrationBuilder.DropTable(
                name: "precificacoes");

            migrationBuilder.DropTable(
                name: "produto_componentes");

            migrationBuilder.DropTable(
                name: "componentes");

            migrationBuilder.DropTable(
                name: "produtos");

            migrationBuilder.DropTable(
                name: "receitas_completas");
        }
    }
}
