Preview: https://scsm-ua.github.io/kirtan-mate/

## Run

    npm i

    gulp build

    gulp watch

## Pages deploy setup

Index page specified in [.github/workflows/build_and_deploy.yml](.github/workflows/build_and_deploy.yml):

```
env:
   HOME_URL: https://scsm-ua.github.io/kirtan-mate
```

## Local deploy

Copy `.env.sample` to `.env` with your local root path.