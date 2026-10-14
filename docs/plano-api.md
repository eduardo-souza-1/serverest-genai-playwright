# Catálogo de testes executáveis - Tópico 2

Versão 1.0, 14/10/2026. Implementação do plano aprovado do Tópico 1 (PDF v2.1); consulte `rastreabilidade.md` para relacionar os IDs API-01 a API-18 aos testes abaixo. Objetivo: validar fluxos essenciais e rejeição de entradas inválidas, incluindo persistência e efeitos no estoque. P1: autenticação, CRUD e ciclo de compra; P2: duplicidades e limites.

| ID | Tipo | Ação e resultado esperado |
|---|---|---|
| AUTH-01 | Positivo/P1 | Login válido: 200, mensagem e token; usar token para criar produto: 201. |
| AUTH-02 | Negativo/P1 | Senha incorreta: 401 e ausência de authorization. |
| AUTH-03 | Limite/P2 | Senha vazia: 400, erro password e sem token. |
| AUTH-04 | Negativo/P1 | Criar produto sem token: 401. |
| AUTH-05 | Negativo/P1 | Criar produto com token inválido: 401. |
| USR-01 | Positivo/P1 | Criar usuário: 201; filtrar e buscar: 200; atualizar: 200; confirmar dados. |
| USR-02 | Negativo/P2 | Repetir email: 400; filtro permanece com um registro. |
| USR-03 | Negativo/P2 | Email malformado: 400 e erro email. |
| USR-04 | Limite/P2 | Nome vazio: 400 e erro nome. |
| USR-05 | Positivo/P1 | Excluir: 200; consultar ID removido: 400 e Usuário não encontrado. |
| PRD-01 | Positivo/P1 | Admin cria: 201; lista, edita e exclui: 200; consulta final: 400. |
| PRD-02 | Negativo/P1 | Usuário comum tenta criar: 403. |
| PRD-03 | Negativo/P2 | Nome duplicado: 400. |
| PRD-04 | Limite/P2 | Estoque zero: 201; confirmar quantidade 0. |
| PRD-05 | Limite/P2 | Estoque -1: 400 e erro quantidade. |
| CRT-01 | Positivo/P1 | Adicionar 2 de estoque 5: 201, saldo 3 e total 50; cancelar: 200, saldo 5, carrinho ausente. |
| CRT-02 | Negativo/P2 | Segundo carrinho do mesmo usuário: 400; saldo não é reduzido novamente. |
| CRT-03 | Negativo/P1 | Pedir 2 com estoque 1: 400; saldo 1 e nenhum carrinho. |
| CRT-04 | Limite/P2 | Quantidade 0 no carrinho: 400; estoque preservado. |
| CRT-05 | Limite/P1 | Pedir estoque exato 1: 201 e saldo 0; concluir: 200, carrinho ausente e saldo 0. |
| CRT-06 | Negativo/P2 | Mesmo produto duas vezes: 400; saldo preservado. |
| CRT-07 | Negativo/P1 | Criar carrinho sem token: 401; saldo preservado. |
| CRT-08 | Negativo/P1 | Excluir usuário com carrinho: 400; usuário e carrinho preservados. |
| CRT-09 | Negativo/P1 | Excluir produto em carrinho: 400; produto e carrinho preservados. |

Pré-condições: API acessível; instalação via npm ci; ambiente confirmado; dados exclusivos por cenário. Os casos com escrita preparam usuários administrativos/comuns e produtos com estoque conhecido. Execução sequencial, sem dados fixos de terceiros. Critério técnico: typecheck aprovado, 24 testes executados, nenhum skip, resultados e limpeza analisados. A aceitação final exige revisão humana específica do código e dos resultados. P1 falhando bloqueia a conclusão; P2 falhando exige análise documentada.

Riscos: instabilidade do servidor público, reset de dados, token expira em 10 minutos, alteração de contrato e perda de resposta durante criação. Massa: emails example.com, nomes UUID e produtos de preço 25. Evidências: HTML/JSON, anexos de limpeza e resumo por caso. Aprovação humana do plano: registrada no Tópico 1; aprovação do código/resultados: pendente.

## Limite do escopo Web

O alvo Web correto é https://compassuolfront.serverest.dev/, conforme o plano aprovado. Sua tela de carrinho estava em construção durante a exploração do Tópico 1. Este projeto testa somente REST; a API de carrinhos está disponível e é exercitada. Não há automação Web nesta entrega.
