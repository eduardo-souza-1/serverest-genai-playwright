# ServeRest: automação de API com GenAI

Projeto em **Playwright + TypeScript**, criado com assistência do **Codex (OpenAI)**. Alvo: https://compassuol.serverest.dev/. Escopo: autenticação, usuários, produtos e carrinhos. O projeto substitui o exemplo anterior da Petstore.

## Executar

Requer Node.js 22 ou superior e npm. A validação da entrega utiliza Node.js 24.

```bash
npm ci
npm run typecheck
npm test
npm run report
```

No PowerShell, se npm.ps1 estiver bloqueado, use `npm.cmd`. Não é necessário baixar navegadores: a suíte usa `APIRequestContext`.

`API_BASE_URL` é opcional; a base padrão é o alvo acima. Não executar contra produção. Os testes criam e excluem somente recursos próprios com nomes e emails UUID/sintéticos. Não há credenciais reais ou token persistido. O token retornado por `/login` já inclui `Bearer`.

## Organização

- `tests/auth.spec.ts`: login, senha inválida/vazia e token inválido/ausente.
- `tests/users.spec.ts`: CRUD, filtro, duplicidade e validações.
- `tests/products.spec.ts`: CRUD, autorização, duplicidade e limites de estoque.
- `tests/cart.spec.ts`: reserva de estoque, cancelamento, conclusão, duplicidade e limites.
- `support/fixtures.ts`: dados, recursos, autenticação e teardown.
- `docs/plano-api.md`: rastreabilidade e resultados esperados.
- `docs/uso-genai-e-ajustes.md`: uso real da IA e revisão crítica.
- `evidence/`: evidências compactas da entrega; relatórios completos são gerados localmente.

Um worker reduz interferência no ambiente compartilhado. Zero retries: falhas não são ocultadas. Cada teste cria sua massa, sem depender da ordem dos arquivos. A limpeza cancela carrinhos, exclui produtos e depois usuários, confirma ausência e anexa IDs sem tokens. Falhas de limpeza falham o teste e não impedem tentativas de remover os demais recursos. Se uma chamada criar um recurso e perder a resposta antes de receber o ID, a recuperação automática não é garantida; investigar os nomes `genai-` dessa execução.

## Relatórios e limites

Execução registrada em 14/10/2026: **24 passaram, 0 falharam, 0 pulados**, em 198,4 segundos; TypeScript aprovado. Detalhes em [evidence/RESULTADOS.md](evidence/RESULTADOS.md). O relatório HTML está em [evidence/report.html](evidence/report.html): baixe o arquivo para abri-lo no navegador (o GitHub exibe o código HTML). O histórico inclui as duas execuções anteriores que orientaram a correção de CRT-04.

`playwright-report/index.html` contém o relatório navegável; `test-results/results.json` contém resultado estruturado. Não versionar tokens, traces, `.env` nem `node_modules`. O PDF da entrega contém evidência consolidada, link do repositório e registro de ajustes.

São 24 testes que cobrem os 18 cenários agrupados do plano aprovado no Tópico 1; o mapeamento está em `docs/rastreabilidade.md`. Isso não representa cobertura integral de todos os parâmetros e combinações. Expiração real do token, concorrência, desempenho, limites numéricos máximos e segurança aprofundada ficam fora do recorte. Validações de campos vazios e estoque são hipóteses de teste verificadas em execução; o esquema publicado não enumera todas essas restrições. O usuário aprovou o plano do Tópico 1; essa aprovação não equivale a aprovação humana independente do código e dos resultados do Tópico 2.

Contrato de referência: https://compassuol.serverest.dev/swagger.json (v3.2.2, consultado em 14/10/2026).
