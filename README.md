# Heistly

Marketing site for Heistly, an AI trading crew. Five roles work a plan you wrote. You read the night in a morning debrief.

**Your crew works the market while you sleep.**

- Domain: [heistlyai.com](https://heistlyai.com)
- X: [@heistlyai](https://x.com/heistlyai)
- Token: `$HEIST` on Robinhood Chain. The contract address stays empty in `js/config.js` until the real one is published. The site shows “Coming soon” and does not invent an address.

This is a static site. No framework, no build step.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/crew/` | `crew/index.html` |
| `/how-it-works/` | `how-it-works/index.html` |
| `/safehouse/` | `safehouse/index.html` |
| `/token/` | `token/index.html` |
| `/faq/` | `faq/index.html` |
| any unknown path | `404.html` |

## Run locally

From the repository root:

```bash
python3 -m http.server 47221
```

Open [http://127.0.0.1:47221](http://127.0.0.1:47221).

## Config

`js/config.js` holds the public links.

- `token.contractAddress` — leave `""` until the real Robinhood Chain contract is published.
- `githubUrl` — leave `""` to hide the footer GitHub link.
- `appUrl` — `"#"` keeps “Assemble your crew” on this site. The app is not open yet.

## Deploy

Pushes to `main` run `.github/workflows/pages.yml`, which uploads the repository root with `actions/upload-pages-artifact@v3` and deploys it with `actions/deploy-pages@v4`. `CNAME` is `heistlyai.com`. `.nojekyll` is included so GitHub Pages serves the files as-is.

## Fonts

Self-hosted, SIL Open Font License:

- Big Shoulders Display — display type. License: `fonts/OFL-BigShouldersDisplay.txt`
- IBM Plex Mono — dossier type. License: `fonts/OFL-IBMPlexMono.txt`

## Note

Demo token names and numbers on the site are illustrative. Not financial advice.
