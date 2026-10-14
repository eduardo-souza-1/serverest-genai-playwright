import { test as base, expect, APIRequestContext, APIResponse } from '@playwright/test';
import { randomUUID } from 'node:crypto';

export const unique = () => `genai-${randomUUID()}`;
export const userData = (admin = false) => ({ nome: unique(), email: `${unique()}@example.com`, password: 'Sintetica123!', administrador: String(admin) });
export const productData = (quantidade = 5) => ({ nome: unique(), preco: 25, descricao: 'Produto sintético de automação', quantidade });
export const auth = (token: string) => ({ Authorization: token });
export async function json(response: APIResponse, status: number) {
  expect(response.status(), `HTTP ${response.url()}`).toBe(status);
  expect(response.headers()['content-type']).toContain('application/json');
  return response.json();
}
type User = ReturnType<typeof userData> & { _id: string; token: string };
type Product = ReturnType<typeof productData> & { _id: string };

class Resources {
  users: User[] = [];
  products: { id: string; token: string }[] = [];
  constructor(readonly request: APIRequestContext) {}
  async user(admin = false): Promise<User> {
    const data = userData(admin);
    const response = await this.request.post('usuarios', { data });
    const body = await response.json();
    const user = { ...data, _id: body._id as string, token: '' };
    // Registrar antes das asserções e do login para permitir teardown após falhas.
    if (typeof body._id === 'string') this.users.push(user);
    expect(response.status()).toBe(201);
    expect(body.message).toBe('Cadastro realizado com sucesso');
    expect(typeof user._id).toBe('string');
    const login = await json(await this.request.post('login', { data: { email: data.email, password: data.password } }), 200);
    expect(typeof login.authorization === 'string' && login.authorization.startsWith('Bearer ')).toBe(true);
    user.token = login.authorization;
    return user;
  }
  async product(admin: User, quantidade = 5): Promise<Product> {
    const data = productData(quantidade);
    const response = await this.request.post('produtos', { headers: auth(admin.token), data });
    const body = await response.json();
    if (typeof body._id === 'string') this.products.push({ id: body._id, token: admin.token });
    expect(response.status()).toBe(201);
    expect(body.message).toBe('Cadastro realizado com sucesso');
    expect(typeof body._id).toBe('string');
    return { ...data, _id: body._id };
  }
  async cleanup() {
    const failures: string[] = [];
    const attempt = async (label: string, action: () => Promise<void>) => {
      try { await action(); } catch { failures.push(label); }
    };
    // Somente recursos criados por este teste: carrinhos -> produtos -> usuários.
    for (const user of this.users) if (user.token) await attempt(`carrinho do usuário ${user._id}`, async () => {
      const body = await json(await this.request.delete('carrinhos/cancelar-compra', { headers: auth(user.token) }), 200);
      expect(['Registro excluído com sucesso. Estoque dos produtos reabastecido', 'Não foi encontrado carrinho para esse usuário']).toContain(body.message);
      const remaining = await json(await this.request.get('carrinhos', { params: { idUsuario: user._id } }), 200);
      expect(remaining.quantidade).toBe(0);
    });
    for (const product of this.products) await attempt(`produto ${product.id}`, async () => {
      await json(await this.request.delete(`produtos/${product.id}`, { headers: auth(product.token) }), 200);
      const body = await json(await this.request.get(`produtos/${product.id}`), 400);
      expect(body.message).toBe('Produto não encontrado');
    });
    for (const user of this.users) await attempt(`usuário ${user._id}`, async () => {
      await json(await this.request.delete(`usuarios/${user._id}`), 200);
      const body = await json(await this.request.get(`usuarios/${user._id}`), 400);
      expect(body.message).toBe('Usuário não encontrado');
    });
    return failures;
  }
}
export const test = base.extend<{ resources: Resources }>({
  resources: async ({ request }, use, info) => {
    const resources = new Resources(request);
    try { await use(resources); }
    finally {
      const failures = await resources.cleanup();
      await info.attach('limpeza', { body: JSON.stringify({ users: resources.users.map(u => u._id), products: resources.products.map(p => p.id), failures }), contentType: 'application/json' });
      expect(failures, 'Falha de limpeza: verificar os IDs no anexo').toEqual([]);
    }
  }
});
export { expect };
