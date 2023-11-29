Preview: https://scsm-ua.github.io/kirtan-mate/

## Run

    npm i

    gulp build

    gulp watch

## GH Pages deploy setup

Used deploy script: [.github/workflows/build_and_deploy.yml](.github/workflows/build_and_deploy.yml):

### HOME_URL

Setup `HOME_URL`: 

`Repository` > `Settings` > `Secrets and variables` > `Actions` > `Variables` > `New repository variable`:

`HOME_URL` = `https://scsm-ua.github.io/kirtan-mate`

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

Copy `.env.sample` to `.env` with your local root path for `HOME_URL`.
