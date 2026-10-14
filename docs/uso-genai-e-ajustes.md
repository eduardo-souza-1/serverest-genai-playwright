# Uso de GenAI e registro de ajustes

Ferramenta efetivamente utilizada: Codex, assistente de código da OpenAI. O usuário escolheu o alvo ServeRest e autorizou a publicação. A IA realizou planejamento, leitura de contrato, geração dos scripts, refatoração de fixtures, execução, investigação de erros, revisão de cobertura e documentação. Não houve uso declarado de Copilot, Cursor ou outro assistente.

## Registro de elaboração

1. Reinterpretar as instruções adicionais: trocar Petstore por ServeRest; entregar um único PDF com repositório, evidências e histórico de ajustes.
2. Consultar o Swagger do alvo e mapear autenticação, usuários, produtos e carrinhos.
3. Gerar inicialmente 22 testes positivos, negativos e de limite, com dados e limpeza reutilizáveis; adicionar dois testes para cobrir API-18 do plano aprovado, totalizando 24.
4. Executar tsc e Playwright contra o servidor real; investigar falhas antes de decidir alterações.
5. Revisar cobertura e limitações; documentar evidência sem afirmar aprovação humana.

## Ajustes críticos aplicados durante elaboração

| Ajuste | Motivo | Validação |
|---|---|---|
| Base URL e recursos trocados para ServeRest | Petstore não atende ao alvo final do enunciado | Todos os testes usam a nova base |
| `administrador` enviado como string | Contrato usa true/false como texto | Criação de usuários e teste de permissão |
| Authorization recebe token completo | Login já retorna o prefixo Bearer | AUTH-01 usa token em rota protegida |
| Produtos do carrinho enviados como lista | Esquema declara objeto, mas exemplo e operação usam lista | CRT-01 e CRT-05 |
| Consulta de recurso removido espera 400 | ServeRest não segue a expectativa genérica 404 nesse caso | USR-05, PRD-01 e testes de carrinho |
| Cancelamento e conclusão separados | Cancelar repõe estoque; concluir não repõe | CRT-01 e CRT-05 |
| Fixture com teardown e dados UUID | Evitar dependência entre testes e registros fixos | Anexos de limpeza e buscas após exclusão |
| Registro de recursos antes de validar/login | Permitir limpeza mesmo após falha intermediária | Revisão do fluxo da fixture; falha induzida não executada |
| Asserções de conteúdo, total e estoque | Status HTTP sozinho não prova regra de negócio | Suite verifica efeitos das operações |
| Limites separados de contrato explícito | Esquema não informa todas as validações de entrada | Casos de campo vazio e estoque marcados como hipóteses verificadas |

Os itens acima são decisões de elaboração/revisão da IA, não um histórico inventado de defeitos observados. Não houve aprovação humana do código ou das evidências até a entrega.

## Falha real e correção após execução

A primeira execução teve 21 aprovações e uma falha em CRT-04. A requisição retornou HTTP 400 corretamente, mas a asserção gerada `toHaveProperty('produtos[0].quantidade')` interpretava o nome como caminho aninhado. A resposta agrupa a descrição da validação no campo textual `produtos`.

Uma segunda tentativa validou que `body.produtos` continha `quantidade`, mas também falhou: a mensagem real é `produtos não contém 1 valor obrigatório`. Foram novamente 21 aprovações e uma falha. Essa tentativa está preservada em `evidence/intermediate-results.json`.

Correção final: comparar a mensagem real completa em `body.produtos`, preservando HTTP 400 e a consulta que exige estoque igual a 1; adicionar consulta que confirma ausência de carrinho. Não foi aceito outro status nem alterado o resultado de negócio esperado. O texto observado é um comportamento da versão consultada, não uma regra inventada do Swagger. A primeira execução está em `evidence/initial-results.json` e `evidence/initial-error.md`; a execução final está em `evidence/final-results.json`.

Resultado final em 14/10/2026, 14:41:02 (UTC-03:00): 24 testes passaram, zero falhas, zero pulados e zero flaky; duração de 198,4 segundos. Foram produzidos 20 anexos de limpeza sem falhas; quatro testes não usam a fixture de recursos. TypeScript verificado sem erros. Os relatórios preservam as duas execuções anteriores com falha e a execução final corrigida.

Revisão de cobertura: foram adicionados CRT-08 e CRT-09 para cobrir o bloqueio de exclusão de usuário/produto com carrinho (API-18). A aprovação humana de Eduardo Neves de Souza aplica-se ao plano do Tópico 1, não à execução do Tópico 2.

## Prompts de reprodução (síntese, não transcrição literal)

- Gere um plano de testes REST para a ServeRest com autenticação, usuários, produtos e carrinhos; inclua cenários positivos, negativos e limites.
- Implemente com Playwright e TypeScript, dados exclusivos, fixtures e teardown. Valide status, conteúdo e efeitos no estoque.
- Compare o código com o contrato; procure chamadas inválidas, asserções frágeis, vazamento de token e lacunas de cobertura. Corrija com base em evidências.
- Produza documentação de instalação, relatório rastreável e registro honesto de limitações e aprovação humana pendente.
