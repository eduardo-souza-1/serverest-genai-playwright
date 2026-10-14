# Rastreabilidade ao plano aprovado (Tópico 1)

Referência: Planos de Teste ServeRest GenAI, versão 2.1, aprovado por Eduardo Neves de Souza em 14/10/2026 com ressalva relativa ao carrinho **Web** em construção. A API de carrinhos é exercitada nesta entrega.

| Cenário do plano | Testes implementados |
|---|---|
| API-01 Login válido | AUTH-01 |
| API-02 Senha incorreta/vazia | AUTH-02, AUTH-03 |
| API-03 Token ausente/inválido | AUTH-04, AUTH-05 |
| API-04 CRUD e filtro de usuário | USR-01 |
| API-05 Email duplicado | USR-02 |
| API-06 Email inválido/nome vazio | USR-03, USR-04 |
| API-07 Exclusão de usuário | USR-05 |
| API-08 CRUD de produto | PRD-01 |
| API-09 Usuário comum sem permissão | PRD-02 |
| API-10 Produto duplicado | PRD-03 |
| API-11 Estoque zero/negativo | PRD-04, PRD-05 |
| API-12 Criar e consultar carrinho | CRT-01 |
| API-13 Segundo carrinho/produto duplicado | CRT-02, CRT-06 |
| API-14 Estoque insuficiente/quantidade zero | CRT-03, CRT-04 |
| API-15 Cancelar e repor estoque | CRT-01 |
| API-16 Estoque exato e conclusão | CRT-05 |
| API-17 Carrinho sem autenticação | CRT-07 |
| API-18 Bloqueios de exclusão | CRT-08, CRT-09 |

Há 24 testes para 18 cenários agrupados. A cobertura indicada é do recorte funcional do plano, não cobertura de código nem garantia de testar cada combinação do contrato. O catálogo inicial em `plano-api.md` documenta a origem; este mapa referencia os IDs do PDF final aprovado.
