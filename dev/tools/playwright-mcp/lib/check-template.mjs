// Modelo de check e2e. Copie para <projeto>/e2e/<nome>.mjs e troque as
// asserções. O runner (check.mjs) já cuidou de navegador, sessão, contexto,
// contagem e exit code — aqui só entra o que é específico deste fluxo.
//
//   node check.mjs <projeto> <nome>

export const meta = {
  description: 'o que este check prova, em uma linha',
  // 'required' = aborta com instrução de login se não houver sessão salva
  // 'none'     = o próprio check faz login / não precisa de sessão
  auth: 'required',
};

export default async function ({ page, check, waitForText, waitForVisible, baseURL, hasFlag }) {
  await page.goto(`${baseURL}/alguma-rota`, { waitUntil: 'networkidle' });
  check('a tela carregou', await page.getByText('Título da tela').first().isVisible());

  // Asserte o status HTTP da ação que importa, não só o que a tela mostra.
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/proxy/recurso') && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Salvar' }).click(),
  ]);
  check('POST responde 201', response.status() === 201, `status ${response.status()}`);

  // waitForText faz polling: ler uma vez logo após a resposta é corrida com o
  // re-render que só acontece depois de o React Query invalidar e refazer o GET.
  const row = page.getByRole('row', { name: /valor esperado/ });
  check('a linha aparece na tabela', await waitForVisible(row));
  check('o valor atualizado aparece', await waitForText(row, 'valor esperado'));

  // Limpe o que você criou, a menos que --keep peça o contrário.
  if (!hasFlag('keep')) {
    // ... desfazer
  }
}
