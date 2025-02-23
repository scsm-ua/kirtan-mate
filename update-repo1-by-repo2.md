1. **Analysis**
- We have 2 repos: `project1` (dependent) and `project2` (dependency)
- Need to set up automation when `project2` changes
  
2. **Steps needed**
   - Configure workflow in `project2` to notify
   - Configure workflow in `project1` to receive and build
   - Set up authentication between repos

3. **Implementation order**
   1. First in `project2`: Create dispatch event
   2. Then in `project1`: Create build trigger
   3. Finally: Configure PAT token

Here are the implementations:

In `project2` repository:

```yaml
name: Notify Dependencies

on:
  push:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - '.gitignore'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger project1 build
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.PROJECT1_PAT }}
          repository: your-username/project1
          event-type: dependency-updated
```

In `project1` repository:

```yaml
name: Build

on:
  push:
    branches: [ main ]
  repository_dispatch:
    types: [dependency-updated]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Checkout project2
        uses: actions/checkout@v3
        with:
          repository: your-username/project2
          path: ./project2
          token: ${{ secrets.PROJECT2_TOKEN }}
      
      - name: Setup and Build
        run: |
          npm install
          npm run build
```

Required setup steps:
1. Generate PAT with `repo` scope
2. Add as secret `PROJECT1_PAT` in `project2`
3. Add as secret `PROJECT2_TOKEN` in `project1`
