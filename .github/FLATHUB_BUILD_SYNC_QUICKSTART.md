# Flathub Build & Sync — Detailed Quick Start

A step-by-step guide to generate `generated-sources.json`, sync it to your Flathub fork (**TARGET_REPO**), update the Flatpak manifest with the latest commit from your **SOURCE_REPO**, and open a Pull Request to upstream — all via **one GitHub Actions workflow**.

---

## Terminology

- **SOURCE_REPO** — Your application repository that contains this workflow.
- **TARGET_REPO** — Your fork of the Flathub repo (`rocks.poopjournal.librelinkupdesktop`) where the workflow will push updates.
- **Upstream** — `flathub/rocks.poopjournal.librelinkupdesktop`.

---

## 1) Fork upstream once

Fork `https://github.com/flathub/rocks.poopjournal.librelinkupdesktop` to **your account/org**.  
This fork is your **`TARGET_REPO`** (example notation: `<you>/rocks.poopjournal.librelinkupdesktop`).

> If your fork’s default branch is `main`, update the workflow’s `ref:` values accordingly.

---

## 2) Add a secret in your SOURCE_REPO

Create a repository secret named **`TARGET_REPO_TOKEN`** that can **push to `TARGET_REPO`** (e.g., a bot/service token with minimal required permissions).

- Go to **SOURCE_REPO → Settings → Secrets and variables → Actions → New repository secret**
- **Name:** `TARGET_REPO_TOKEN`
- **Value:** a token that can push to your fork (**TARGET_REPO**)

Also set **Settings → Actions → General → Workflow permissions** to **Read and write**.

> The built-in `GITHUB_TOKEN` will handle commits back to **SOURCE_REPO**.  
> `TARGET_REPO_TOKEN` is only used to push to your fork (**TARGET_REPO**).

---

## 3) Run the workflow

Trigger the action by either:
- **Run workflow** (`workflow_dispatch`)
- **Create/Edit a Release**
- **Push a tag** matching `flathubbuild-*`, for example:
  ```bash
  git tag flathubbuild-$(date +%Y%m%d-%H%M%S)
  git push origin --tags
  ```

---

## 4) What the workflow does (at a glance)

1. **Installs Flatpak & tooling** (SDK 23.08, Node 20 extension, Builder).
2. **Runs `npm install`** to ensure a valid lockfile and dependency graph.
3. **Generates `generated-sources.json`** via `flatpak-node-generator`.
4. **Commits to SOURCE_REPO** if `generated-sources.json` changed (also uploaded as an artifact).
5. **Checks out TARGET_REPO** (your fork) and copies `generated-sources.json` into it.
6. **Updates the Flatpak manifest** (`rocks.poopjournal.librelinkupdesktop.yml`) so the `librelinkupdesktop` module’s `git` source:
   - **url** → `https://github.com/${SOURCE_REPO}.git`
   - **commit** → latest commit SHA from SOURCE_REPO
7. **Commits & pushes** those changes to your fork (**TARGET_REPO**).

---

## 5) Open the PR

After a successful run, open a Pull Request **from your fork (`TARGET_REPO`)** to **`flathub/rocks.poopjournal.librelinkupdesktop`** (usually **`master → master`**).

**Via GitHub UI:**
- Go to your fork → **Compare & pull request**
- Base: `flathub/rocks.poopjournal.librelinkupdesktop@master`
- Head: `<you>/rocks.poopjournal.librelinkupdesktop@master`

**Via CLI:**
```bash
gh pr create \
  --repo flathub/rocks.poopjournal.librelinkupdesktop \
  --head <your-username>:master \
  --base master \
  --title "Update generated-sources.json and manifest to latest SOURCE_REPO" \
  --body "Automated update via Build & Sync workflow."
```

---
