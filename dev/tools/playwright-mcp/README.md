# playwright-mcp

Playwright avulso, fora dos projetos. Serve qualquer coisa que responda numa URL HTTP — front local, homologação, produção, painel de terceiro. Faz duas coisas:

- **foto** de tela, em três breakpoints, para olhar o resultado de uma mudança de CSS/layout ou comparar antes × depois de um redesign;
- **check e2e**, para confirmar que uma implementação funciona e não quebrou o que já funcionava, em projeto que **não tem** suíte Playwright própria.

Os navegadores ficam no cache compartilhado (`~/.cache/ms-playwright`), então qualquer outro projeto da máquina que instalar Playwright reaproveita o download.

## Estrutura

```
lib/            máquina compartilhada: navegador, sessão, harness de check, args
shot.mjs        foto de rotas em mobile/tablet/desktop
login.mjs       login na mão, salva a sessão do projeto
check.mjs       roda os checks e2e de um projeto
mobile-shot.mjs foto da tela do emulador Android via adb
init.mjs        cria a pasta de um projeto novo

<projeto>/
  target.json   cwd, comando de dev, porta e rotas DESTE projeto
  .auth.json    sessão salva (gitignored — tem token de verdade)
  shots/        fotos, por label
  e2e/          os checks deste projeto
```

**Um projeto é uma pasta com `target.json` dentro.** A pasta é o índice: não existe arquivo central de alvos, então adicionar projeto é criar pasta (`init.mjs` faz isso) e nada mais precisa ser editado.

**A raiz é versionada; as pastas de projeto não.** Elas são locais de propósito — configuração, sessão, fotos e checks de projeto ficam só nesta máquina. Se precisar levar um check para outra máquina, copie na mão.

## Uso

Suba o dev server do projeto no terminal dele:

```
cd ~/dev/plataforma-monitoramento/frontend-monitoring && npm run dev
```

Depois, daqui:

```
node shot.mjs                                    # lista os projetos
node shot.mjs monitoring-frontend                # fotografa as rotas do target.json
node shot.mjs monitoring-frontend --label antes  # nomeia a leva
node shot.mjs monitoring-frontend --routes /,/login
node shot.mjs monitoring-frontend --port 3001
node shot.mjs monitoring-frontend --headed       # ver o navegador trabalhando
node shot.mjs https://app.exemplo.com            # URL direta, sai em _urls/<host>/
```

Sai em `<projeto>/shots/<label>/<rota>@<breakpoint>.png`, nos breakpoints mobile (390), tablet (768) e desktop (1440), página inteira.

## Telas com login

```
node login.mjs monitoring-frontend   # abre o navegador, você loga, ENTER pra salvar
node shot.mjs monitoring-frontend    # agora alcança as rotas autenticadas
```

A sessão fica em `<projeto>/.auth.json`. Rode `login.mjs` de novo quando expirar.

## Checks e2e

```
node check.mjs                                             # lista os projetos
node check.mjs monitoring-frontend                         # TODOS os checks do projeto
node check.mjs monitoring-frontend boletador-parameters    # um check
node check.mjs monitoring-frontend --headed --keep
```

`node check.mjs <projeto>` sem nome de check é a passada de "não quebrei nada". Exit code 1 se qualquer verificação falhar, então dá para usar em script.

Para escrever um check novo: [`WRITING-CHECKS.md`](WRITING-CHECKS.md).

## Projeto novo

```
node init.mjs originacao-frontend --cwd ~/dev/originacao/frontend --dev "npm run dev" --port 3000 --routes /,/login
```

Cria `target.json`, `e2e/` (com `_template.mjs`) e `shots/`.

## Mobile (Android, via adb)

`mobile-shot.mjs` fotografa a tela do emulador/device. **Não navega sozinho** — fotografa o que estiver na tela.

```
~/Android/Sdk/emulator/emulator -avd pixel6_api35 -no-window &
node mobile-shot.mjs monitoring-mobile-web --label antes
```

Precisa do grupo `kvm` (uma vez, e reabrir o WSL): `sudo usermod -aG kvm $USER`. Sessão já aberta não enxerga o grupo novo, mas `sg kvm -c "<comando>"` funciona sem reiniciar.

Atalho sem emulador: `mobile-monitoring` tem `react-native-web`, então o projeto `monitoring-mobile-web` cobre as telas pelo navegador. Renderiza parecido, **não idêntico** ao nativo — fonte, sombra e safe-area divergem.

App nativo puro (`frontend-app`, React Native sem Expo) não é alcançável pelo Playwright: não fala HTTP.

## Redesign

1. Antes de mexer: `node shot.mjs <projeto> --label antes`
2. Redesenha.
3. `node shot.mjs <projeto> --label depois`
4. Comparar as duas pastas lado a lado.

O passo 1 é o que as pessoas pulam e depois sentem falta.

## Máquina nova

```
npm ci
npx playwright install chromium    # se ~/.cache/ms-playwright estiver vazio
```

Nem `node_modules` nem o cache de navegador são versionados. Projetos também não: crie os que precisar com `init.mjs`.

## Ambiente WSL (verificado)

Headless **e** headed funcionam sem `sudo apt` nenhum — as libs já existiam; headed abre janela via WSLg (`DISPLAY=:0`). Com `networkingMode=mirrored` no `.wslconfig`, o Chrome do Windows alcança serviços do WSL por `localhost`; o mesmo espelhamento faz o servidor adb do Windows disputar a porta 5037 com o do WSL — matar um antes de usar o outro (`adb.exe kill-server`).
