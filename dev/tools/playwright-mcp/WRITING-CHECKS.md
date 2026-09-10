# Escrevendo um check e2e

Um check vive em `<projeto>/e2e/<nome>.mjs` e prova **uma coisa**: que o fluxo que você acabou de implementar funciona, e que o que já funcionava continua funcionando.

O runner (`check.mjs`) é dono de navegador, contexto, sessão salva, contagem de asserções e exit code. O arquivo do check só faz as asserções — não repita essa infraestrutura.

## Começando

```
cp lib/check-template.mjs monitoring-frontend/e2e/minha-feature.mjs
node check.mjs monitoring-frontend minha-feature --headed
```

`--headed` na primeira execução vale a pena: você vê onde o seletor não pegou.

## O contrato

```js
export const meta = {
  description: 'o que este check prova, em uma linha',
  auth: 'required',   // ou 'none'; omitido = usa a sessão se existir
  viewport: { width: 1440, height: 900 },   // opcional
};

export default async function ({ page, check, waitForText, waitForVisible, baseURL, context, browser, flag, hasFlag }) {
  // asserções aqui
}
```

| campo | efeito |
|---|---|
| `auth: 'required'` | sem `<projeto>/.auth.json`, o check falha na hora com a instrução de rodar `login.mjs` — em vez de quebrar num seletor de tela de login |
| `auth: 'none'` | o contexto abre **sem** `storageState`. Use quando o próprio check faz login (ex.: `foxe-ai/e2e/auth-refresh.mjs`) |
| `auth` omitido | usa a sessão se o arquivo existir, ignora se não |

O que o runner injeta:

| nome | o que é |
|---|---|
| `check(nome, condição, detalhe?)` | registra uma asserção, imprime `OK`/`FALHA` na hora e devolve o booleano — dá para usar em `if` e abortar cedo |
| `waitForText(locator, texto)` | espera o texto aparecer, com polling |
| `waitForVisible(locator)` | espera o elemento ficar visível |
| `page`, `context`, `browser` | Playwright cru, quando precisar |
| `baseURL` | `http://localhost:<porta do target.json>`, já com `--port` aplicado |
| `flag(nome, padrão)`, `hasFlag(nome)` | flags próprios do check (ex.: `--keep`) |

## As quatro regras que evitam check mentiroso

**1. Asserte o status HTTP da ação, não só o que a tela mostra.** Uma tela pode parecer certa e a requisição ter voltado 200 quando devia ser 201, ou 405 quando devia ser 201. É a diferença entre "a tela não explodiu" e "o contrato está certo".

```js
const [response] = await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/proxy/recurso') && r.request().method() === 'POST'),
  page.getByRole('button', { name: 'Salvar' }).click(),
]);
check('POST responde 201, não 405', response.status() === 201, `status ${response.status()}`);
```

**2. Nunca leia a tela uma vez logo após a resposta HTTP.** A resposta chega **antes** de o React Query invalidar, refazer o GET e re-renderizar: ler ali é corrida, e o check falha de forma intermitente. Use `waitForText`/`waitForVisible`, que fazem polling até o timeout.

**3. Limpe o que você criou, a menos que `--keep` diga o contrário.** Um check que deixa lixo no banco muda o resultado da próxima execução — e do próximo check.

**4. Uma asserção, uma linha de `check()`.** É o que faz a saída legível e o `report` útil. Não junte três verificações numa condição só.

## Exemplos no repo

| arquivo | o que ele mostra |
|---|---|
| `monitoring-frontend/e2e/boletador-parameters.mjs` | fluxo CRUD completo com sessão salva, asserção de status, `--keep`, e limpeza no final |
| `foxe-ai/e2e/auth-refresh.mjs` | `auth: 'none'` com login próprio, manipulação de cookie, duas abas em paralelo, e abortar cedo com `if (!check(...)) return` |

## Quando NÃO escrever aqui

Se o projeto **já tem** Playwright/E2E próprio, o teste vai lá dentro, na suíte e no CI dele. Aqui é para projeto que não tem — e o motivo de não instalar Playwright no repo só por causa de um check é que isso é dependência e padrão novos no projeto (num repo FinPec, decisão de Gate 2).

Teste de componente e teste unitário sempre pertencem ao repo, nunca aqui.
