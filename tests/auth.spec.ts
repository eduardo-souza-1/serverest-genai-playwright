import { test, expect, json, auth, productData } from '../support/fixtures';

test('AUTH-01 positivo: login e uso do token', async ({ request, resources }) => {
  const admin = await resources.user(true);
  const body = await json(await request.post('login', { data: { email: admin.email, password: admin.password } }), 200);
  expect(body.message).toBe('Login realizado com sucesso');
  expect(typeof body.authorization === 'string' && body.authorization.startsWith('Bearer ')).toBe(true);
  await resources.product({ ...admin, token: body.authorization });
});
test('AUTH-02 negativo: senha incorreta', async ({ request, resources }) => {
  const user = await resources.user();
  const body = await json(await request.post('login', { data: { email: user.email, password: 'senha-incorreta' } }), 401);
  expect(body.message).toBe('Email e/ou senha inválidos');
  expect(body).not.toHaveProperty('authorization');
});
test('AUTH-03 limite: senha vazia', async ({ request, resources }) => {
  const user = await resources.user();
  const body = await json(await request.post('login', { data: { email: user.email, password: '' } }), 400);
  expect(body).toHaveProperty('password');
  expect(body).not.toHaveProperty('authorization');
});
for (const [id, token] of [['AUTH-04', ''], ['AUTH-05', 'Bearer invalido']]) {
  test(`${id} negativo: token ${token ? 'inválido' : 'ausente'}`, async ({ request }) => {
    const body = await json(await request.post('produtos', { headers: token ? auth(token) : {}, data: productData() }), 401);
    expect(body.message).toBe('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });
}
