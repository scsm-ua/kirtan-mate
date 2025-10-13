Live site: https://kirtan.site

## Run

    npm i

    npm run build

    npm run dev

## Update songbooks list

Update file `./songbooks.json`:

```
[
    "git+https://github.com/scsm-ua/kirtan-guide-en.git#branch",
]
```

Use npm package dependencies syntax.

Run `npm i` after changes.

## GH Pages deploy setup

Used deploy script: [.github/workflows/build_and_deploy.yml](.github/workflows/build_and_deploy.yml):

### HOME_BASE_URL

Setup `HOME_BASE_URL`: 

`Repository` > `Settings` > `Secrets and variables` > `Actions` > `Variables` > `New repository variable`:

`HOME_BASE_URL` = `https://scsm-ua.github.io/kirtan-mate`

### GH_TOKEN

Setup `secrets.GH_TOKEN`: 

`User icon` > `Settings` > `Developer Settings` > `Personal Access Tokens` > `Fine-grained tokens` > `Generate new token`.

**Resource owner**: `current repositiry`.

**Repository access**: `Only select repositories` = `current repositiry`.

**Permissions**: `Repository permissions` > `Contents` = `Read and write`.

### Pages setup

Setup github pages for repository.

`Repository` > `Settings` > `Pages` > `Build and deployment`:

**Source**: `Deploy from a branch`.

**Branch**: `gh-pages` `/root` > Click `Save`.

## Local deploy

Copy `.env.sample` to `.env` with your local root path for `HOME_BASE_URL`.

To use with local filesystem use `EXPLICIT_INDEX=1` to build home path with  `.../index.html`.

## Debug local songbooks

    pnpm link ../gaudiya-gitanjali-lv
    pnpm link ../gaudiya-gitanjali-ru
    pnpm link ../gaudiya-gitanjali-ua
    pnpm link ../kirtan-guide-en
    pnpm link ../kirtan-guide-es
    pnpm link ../kirtan-guide-pt
    pnpm link ../kirtan-guide-pocket-edition
