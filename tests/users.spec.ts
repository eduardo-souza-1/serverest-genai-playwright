import { test, expect, json, userData } from '../support/fixtures';

test('USR-01 positivo: criar, filtrar, consultar e atualizar', async ({ request, resources }) => {
  const user = await resources.user();
  const listing = await json(await request.get('usuarios', { params: { email: user.email } }), 200);
  expect(listing.quantidade).toBe(1);
  expect(listing.usuarios).toHaveLength(1);
  expect(listing.usuarios[0]).toMatchObject({ _id: user._id, email: user.email, administrador: 'false' });
  const data = { nome: `${user.nome}-editado`, email: user.email, password: user.password, administrador: user.administrador };
  const update = await json(await request.put(`usuarios/${user._id}`, { data }), 200);
  expect(update.message).toBe('Registro alterado com sucesso');
  const read = await json(await request.get(`usuarios/${user._id}`), 200);
  expect(read).toMatchObject({ _id: user._id, nome: data.nome, email: data.email });
});
test('USR-02 negativo: email duplicado', async ({ request, resources }) => {
  const user = await resources.user();
  const body = await json(await request.post('usuarios', { data: { ...userData(), email: user.email } }), 400);
  expect(body.message).toBe('Este email já está sendo usado');
  const listing = await json(await request.get('usuarios', { params: { email: user.email } }), 200);
  expect(listing.quantidade).toBe(1);
});
test('USR-03 negativo: email malformado', async ({ request }) => {
  const body = await json(await request.post('usuarios', { data: { ...userData(), email: 'sem-arroba' } }), 400);
  expect(body).toHaveProperty('email');
});
test('USR-04 limite: nome vazio', async ({ request }) => {
  const body = await json(await request.post('usuarios', { data: { ...userData(), nome: '' } }), 400);
  expect(body).toHaveProperty('nome');
});
test('USR-05 positivo: excluir usuário e confirmar ausência', async ({ request, resources }) => {
  const user = await resources.user();
  const body = await json(await request.delete(`usuarios/${user._id}`), 200);
  expect(body.message).toBe('Registro excluído com sucesso');
  user.token = ''; // O token deixa de ser válido após exclusão; não há carrinho neste teste.
  expect((await json(await request.get(`usuarios/${user._id}`), 400)).message).toBe('Usuário não encontrado');
});
