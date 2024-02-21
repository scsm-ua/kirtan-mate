Live site: https://kirtan.site

## Run

    pnpm i

    gulp build

    gulp watch

## Update songbook version

Update required commit hash to `dependencies` section in [package.json](package.json) and push coomit:

    "gaudiya-gitanjali-ua": "github:scsm-ua/gaudiya-gitanjali-ua#<REQUIRED COMMIT HASH>",

Example:

    "gaudiya-gitanjali-ua": "github:scsm-ua/gaudiya-gitanjali-ua#369e9f1b5b758080f31edd690e33721402a1443e",

In case when no commit specified, use `pnpm update` in CLI to refresh lock file.

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
