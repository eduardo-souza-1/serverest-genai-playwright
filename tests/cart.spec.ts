import { test, expect, json, auth } from '../support/fixtures';

test('CRT-01 positivo: criar, consultar e cancelar restaura estoque', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin, 5);
  const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 2 }] } }), 201);
  expect(body.message).toBe('Cadastro realizado com sucesso');
  const cart = await json(await request.get(`carrinhos/${body._id}`), 200);
  expect(cart).toMatchObject({ idUsuario: buyer._id, precoTotal: 50, quantidadeTotal: 2 });
  expect(cart.produtos).toEqual([{ idProduto: product._id, quantidade: 2, precoUnitario: 25 }]);
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(3);
  const listing = await json(await request.get('carrinhos', { params: { idUsuario: buyer._id } }), 200);
  expect(listing.quantidade).toBe(1);
  expect(listing.carrinhos[0]._id).toBe(body._id);
  await json(await request.delete('carrinhos/cancelar-compra', { headers: auth(buyer.token) }), 200);
  expect((await json(await request.get(`carrinhos/${body._id}`), 400)).message).toBe('Carrinho não encontrado');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(5);
});
test('CRT-02 negativo: segundo carrinho não altera estoque', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin, 5);
  const options = { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } };
  await json(await request.post('carrinhos', options), 201);
  expect((await json(await request.post('carrinhos', options), 400)).message).toBe('Não é permitido ter mais de 1 carrinho');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(4);
});
test('CRT-03 negativo: estoque insuficiente não cria carrinho', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin, 1);
  const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 2 }] } }), 400);
  expect(body.message).toBe('Produto não possui quantidade suficiente');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(1);
  expect((await json(await request.get('carrinhos', { params: { idUsuario: buyer._id } }), 200)).quantidade).toBe(0);
});
test('CRT-04 limite: quantidade zero é rejeitada', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin, 1);
  const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 0 }] } }), 400);
  // A API agrupa a mensagem em `produtos`; não retorna um objeto aninhado.
  expect(typeof body.produtos).toBe('string');
  expect(body.produtos).toBe('produtos não contém 1 valor obrigatório');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(1);
  expect((await json(await request.get('carrinhos', { params: { idUsuario: buyer._id } }), 200)).quantidade).toBe(0);
});
test('CRT-05 limite: comprar estoque exato e concluir mantém saldo zero', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin, 1);
  const cart = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } }), 201);
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(0);
  expect((await json(await request.delete('carrinhos/concluir-compra', { headers: auth(buyer.token) }), 200)).message).toBe('Registro excluído com sucesso');
  expect((await json(await request.get(`carrinhos/${cart._id}`), 400)).message).toBe('Carrinho não encontrado');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(0);
});
test('CRT-06 negativo: produto repetido no mesmo carrinho', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin);
  const item = { idProduto: product._id, quantidade: 1 };
  const body = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [item, item] } }), 400);
  expect(body.message).toBe('Não é permitido possuir produto duplicado');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(5);
});
test('CRT-07 negativo: sem token não cria carrinho', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const product = await resources.product(admin);
  const body = await json(await request.post('carrinhos', { data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } }), 401);
  expect(body.message).toBe('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  expect((await json(await request.get(`produtos/${product._id}`), 200)).quantidade).toBe(5);
});

test('CRT-08 negativo: impedir exclusão de usuário com carrinho', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin);
  const cart = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } }), 201);
  const body = await json(await request.delete(`usuarios/${buyer._id}`), 400);
  expect(body.message).toBe('Não é permitido excluir usuário com carrinho cadastrado');
  expect((await json(await request.get(`usuarios/${buyer._id}`), 200))._id).toBe(buyer._id);
  expect((await json(await request.get(`carrinhos/${cart._id}`), 200)).idUsuario).toBe(buyer._id);
});

test('CRT-09 negativo: impedir exclusão de produto em carrinho', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const buyer = await resources.user();
  const product = await resources.product(admin);
  const cart = await json(await request.post('carrinhos', { headers: auth(buyer.token), data: { produtos: [{ idProduto: product._id, quantidade: 1 }] } }), 201);
  const body = await json(await request.delete(`produtos/${product._id}`, { headers: auth(admin.token) }), 400);
  expect(body.message).toBe('Não é permitido excluir produto que faz parte de carrinho');
  expect(await json(await request.get(`produtos/${product._id}`), 200)).toMatchObject({ _id: product._id, quantidade: 4 });
  expect((await json(await request.get(`carrinhos/${cart._id}`), 200)).produtos[0].idProduto).toBe(product._id);
});
