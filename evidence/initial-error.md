# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cart.spec.ts >> CRT-04 limite: quantidade zero é rejeitada
- Location: tests\cart.spec.ts:38:5

# Error details

```
Error: expect(received).toHaveProperty(path)

Expected path: "produtos[0].quantidade"
Received path: "produtos.0"

Received value: "p"
```

# Test source

```ts
  1  | import { test, expect, json, auth } from '../support/fixtures';
  2  |
  3  | test('CRT-01 positivo: criar, consultar e cancelar restaura estoque', async ({ request, resources }) => {
  4  |   const admin = await resources.user(true);
  5  |   const buyer = await resources.user();
  6  |   const product = await resources.product(admin, 5);
  7  |   const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 2 }] } }), 201);
  8  |   expect(body.message).toBe('Cadastro realizado com sucesso');
  9  |   const cart = await json(await request.get(`carrinhos/${body._id}`), 200);
  10 |   expect(cart).toMatchObject({ idUsuario: buyer._id, precoTotal: 50, quantidadeTotal: 2 });
  11 |   expect(cart.produtos).toEqual([{ idProduto: product._id, quantidade: 2, precoUnitario: 25 }]);
  12 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(3);
  13 |   const listing = await json(await request.get('carrinhos', { params: { idUsuario: buyer._id } }), 200);
  14 |   expect(listing.quantidade).toBe(1);
  15 |   expect(listing.carrinhos[0]._id).toBe(body._id);
  16 |   await json(await request.delete('carrinhos/cancelar-compra', { headers: auth(buyer.token) }), 200);
  17 |   expect((await json(await request.get(`carrinhos/${body._id}`), 400)).message).toBe('Carrinho não encontrado');
  18 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(5);
  19 | });
  20 | test('CRT-02 negativo: segundo carrinho não altera estoque', async ({ request, resources }) => {
  21 |   const admin = await resources.user(true);
  22 |   const buyer = await resources.user();
  23 |   const product = await resources.product(admin, 5);
  24 |   const options = { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } };
  25 |   await json(await request.post('carrinhos', options), 201);
  26 |   expect((await json(await request.post('carrinhos', options), 400)).message).toBe('Não é permitido ter mais de 1 carrinho');
  27 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(4);
  28 | });
  29 | test('CRT-03 negativo: estoque insuficiente não cria carrinho', async ({ request, resources }) => {
  30 |   const admin = await resources.user(true);
  31 |   const buyer = await resources.user();
  32 |   const product = await resources.product(admin, 1);
  33 |   const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 2 }] } }), 400);
  34 |   expect(body.message).toBe('Produto não possui quantidade suficiente');
  35 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(1);
  36 |   expect((await json(await request.get('carrinhos', { params: { idUsuario: buyer._id } }), 200)).quantidade).toBe(0);
  37 | });
  38 | test('CRT-04 limite: quantidade zero é rejeitada', async ({ request, resources }) => {
  39 |   const admin = await resources.user(true);
  40 |   const buyer = await resources.user();
  41 |   const product = await resources.product(admin, 1);
  42 |   const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 0 }] } }), 400);
> 43 |   expect(body).toHaveProperty('produtos[0].quantidade');
     |                ^ Error: expect(received).toHaveProperty(path)
  44 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(1);
  45 | });
  46 | test('CRT-05 limite: comprar estoque exato e concluir mantém saldo zero', async ({ request, resources }) => {
  47 |   const admin = await resources.user(true);
  48 |   const buyer = await resources.user();
  49 |   const product = await resources.product(admin, 1);
  50 |   const cart = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } }), 201);
  51 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(0);
  52 |   expect((await json(await request.delete('carrinhos/concluir-compra', { headers: auth(buyer.token) }), 200)).message).toBe('Registro excluído com sucesso');
  53 |   expect((await json(await request.get(`carrinhos/${cart._id}`), 400)).message).toBe('Carrinho não encontrado');
  54 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(0);
  55 | });
  56 | test('CRT-06 negativo: produto repetido no mesmo carrinho', async ({ request, resources }) => {
  57 |   const admin = await resources.user(true);
  58 |   const buyer = await resources.user();
  59 |   const product = await resources.product(admin);
  60 |   const item = { idProduto: product._id, quantidade: 1 };
  61 |   const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [item, item] } }), 400);
  62 |   expect(body.message).toBe('Não é permitido possuir produto duplicado');
  63 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(5);
  64 | });
  65 | test('CRT-07 negativo: sem token não cria carrinho', async ({ request, resources }) => {
  66 |   const admin = await resources.user(true);
  67 |   const product = await resources.product(admin);
  68 |   const body = await json(await request.post('carrinhos', { data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } }), 401);
  69 |   expect(body.message).toBe('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  70 |   expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(5);
  71 | });
  72 |
```
