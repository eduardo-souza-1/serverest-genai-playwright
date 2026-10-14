import { test, expect, json, auth, productData } from '../support/fixtures';

test('PRD-01 positivo: criar, listar, atualizar e excluir', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const product = await resources.product(admin);
  const listing = await json(await request.get('produtos', { params: { nome: product.nome } }), 200);
  expect(listing.quantidade).toBe(1);
  expect(listing.produtos).toHaveLength(1);
  expect(listing.produtos[0]).toMatchObject(product);
  const { _id, ...data } = product;
  const update = await json(await request.put(`produtos/${_id}`, { headers: auth(admin.token), data: { ...data, preco: 30, quantidade: 8 } }), 200);
  expect(update.message).toBe('Registro alterado com sucesso');
  expect(await json(await request.get(`produtos/${_id}`), 200)).toMatchObject({ _id, preco: 30, quantidade: 8 });
  expect((await json(await request.delete(`produtos/${_id}`, { headers: auth(admin.token) }), 200)).message).toBe('Registro excluído com sucesso');
  expect((await json(await request.get(`produtos/${_id}`), 400)).message).toBe('Produto não encontrado');
});
test('PRD-02 negativo: usuário comum não cria produto', async ({ request, resources }) => {
  const user = await resources.user();
  const body = await json(await request.post('produtos', { headers: auth(user.token), data: productData() }), 403);
  expect(body.message).toBe('Rota exclusiva para administradores');
});
test('PRD-03 negativo: nome duplicado', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const product = await resources.product(admin);
  const body = await json(await request.post('produtos', { headers: auth(admin.token), data: { ...productData(), nome: product.nome } }), 400);
  expect(body.message).toBe('Já existe produto com esse nome');
});
test('PRD-04 limite: estoque zero é aceito', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const product = await resources.product(admin, 0);
  expect(await json(await request.get(`produtos/${product._id}`), 200)).toMatchObject({ _id: product._id, quantidade: 0 });
});
test('PRD-05 limite: estoque negativo é rejeitado', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const body = await json(await request.post('produtos', { headers: auth(admin.token), data: productData(-1) }), 400);
  expect(body).toHaveProperty('quantidade');
});
