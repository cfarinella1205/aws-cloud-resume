---
title: "Learning Git by Failing (at first) to Merge a Front-End Overhaul"
date: 2026-06-23T02:27:09Z
description: "How a simple Node version bump turned into a multi-hour git disaster involving two machines, a lucky zip file, and accidentally overwriting my own branch."
tags: ["git", "astro", "aws", "devlog", "lessons-learned"]
draft: false
---



I spent several hours today trying to merge a front-end overhaul I built into my main branch. The overhaul itself was done. It looked great locally. The only thing standing between me and a live site was a pull request.

That pull request had conflicts.

Here is what happened.

## The actual problem was simple

My Astro site requires Node 22. My `deploy.yml` was targeting Node 20, which GitHub Actions was quietly deprecating anyway. The fix was changing one line:

```yaml
node-version: '20'
```

to:

```yaml
node-version: '22'
```

That is genuinely it. One line. Five seconds of work. Instead it took most of the day.

## How the work actually got done — and then lost

I built the full Astro overhaul: the layouts, pages, components, blog system, the whole thing. I committed it and pushed it to the `astro-overhaul` branch. It was in the repo. It was real. I then ran out of context with the AI I was working with to figure out a stubborn mobile viewing issue, and switched machines to continue with a local model running on my project PC.

This is where things started to unravel.

On the new machine I pulled the branch and started making changes — tweaking the pipeline, adjusting the Node version, trying to get the PR to merge. The problem is I was not fully tracking what was committed and what was not, what had been pushed and what was still local. I was making changes across sessions, across machines, without a clean mental model of the branch state at any given moment.

Somewhere in that process — and I cannot point to the exact command — I either force-pushed a bad state onto the branch, or a botched rebase rewrote the history in a way that orphaned the earlier commits containing the Astro project files. By the time I was trying to merge the PR, `git ls-files new-site/` showed almost nothing:

```
new-site/src/content/blog/ha-android-tablet.md
```

One markdown file. The `package.json`, `astro.config.mjs`, `tsconfig.json`, all the source files — gone from the branch's current state. Still somewhere in git's object store probably, but not reachable from where I was standing without knowing exactly which commit to dig back to.

## The zip file that saved everything

The night before, for no real reason, I downloaded a zip of the `astro-overhaul` branch directly from GitHub. Not a manual backup of local files — a download of the branch as it existed on GitHub at that point, when the Astro files were still intact and reachable.

That zip turned out to be a snapshot of the branch *before I accidentally overwrote it*. Extracting it and committing those files back to `main` is what finally got the build to pass. Without it I would have been starting the Astro overhaul from scratch, because whatever I did during the multi-machine confusion had wiped out the good history.

The lesson here is not just "commit often." I was committing. The lesson is that `git push --force` or a botched rebase on a branch you are working on across machines can quietly destroy work you thought was safe. A force-push does not warn you that you are overwriting commits that have not been merged anywhere. It just does it.

## The merge conflict spiral

When I opened the pull request, GitHub flagged two conflicting files:

- `.github/workflows/deploy.yml`
- `new-site/src/content/blog/ha-android-tablet.md`

The `deploy.yml` conflict was the Node version. The markdown conflict was a modify/delete — `main` had deleted the file at some point during an earlier messy merge attempt, while `astro-overhaul` still had it.

A clean approach would have been:

1. Rebase `astro-overhaul` onto `main`
2. Resolve both conflicts
3. Force-push the branch
4. Merge the PR

Instead I kept making changes on different machines without pulling first, committing fixes to the wrong branches, and generally losing track of what state anything was in. Every attempted fix created a new problem because I was operating on stale local state.

## The rebase that kept stalling

I eventually ran `git rebase origin/main`, which is the right call. What I did not account for was that the rebase surfaced the modify/delete conflict on `ha-android-tablet.md`, and while I was working through it, there was a second commit in the rebase queue that had its own conflict on `deploy.yml`.

The rebase paused twice. The first pause I resolved. By the time I got through that, `git rebase --continue` kept telling me there were still unresolved files. Running `git diff --diff-filter=U` finally showed me what was left: `deploy.yml` still had conflict markers in it from the second commit.

## The pipeline issues that followed

Even after the project files were restored and the PR merged, the pipeline kept failing. In order:

1. `npm ci` fails without a committed `package-lock.json` → switched to `npm install`
2. Build fails because Node 20 does not meet the `>=22.12.0` engine requirement
3. Node 22 still not loading because `actions/checkout@v3` and `actions/setup-node@v3` are deprecated and being overridden by the runner

The final working config:

```yaml
- name: Checkout Code
  uses: actions/checkout@v4

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'

- name: Install Dependencies
  run: |
    cd new-site
    npm install

- name: Build Astro Site
  run: |
    cd new-site
    npm run build

- name: Deploy to S3
  run: aws s3 sync new-site/dist/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
```

The S3 sync path change from `.` to `new-site/dist/` was also critical — the old config was syncing the entire repository root to S3.

## What I should have done

The path that would have taken five minutes:

1. Open `deploy.yml` on `astro-overhaul`
2. Change `node-version: '20'` to `'22'`, upgrade action versions to v4
3. Fix the S3 sync path to point at `new-site/dist/`
4. Verify with `git status` that nothing unexpected is staged or missing
5. Open PR, merge, done

The multi-machine problem is a solved problem: commit and push before you switch machines, pull before you start working, and treat `--force-with-lease` as the maximum aggression level you ever use on a branch with work you care about. If you must force-push, verify first that you are not pushing a state that has *fewer* commits than what is already on the remote.

## What I actually learned

- `git diff --diff-filter=U` shows you exactly which files still have unresolved conflict markers. Use it instead of guessing.
- `git ls-files <path>` shows you what git actually knows about. If files you expect are not in this list, they are not tracked.
- A force-push or botched rebase can silently remove commits from a branch's reachable history. The objects may still exist in git's internals but good luck finding them without knowing the commit hash.
- `actions/checkout@v3` and `actions/setup-node@v3` are old enough that GitHub Actions runners may override the Node version they request. Use v4.
- Download a zip of important branches occasionally. Not instead of git — in addition to git. It is a snapshot of a known-good state that does not depend on your local branch history being intact.

The site is live. It looks good. It took way longer than it should have, and I would not change it.

---

*This is part of an ongoing series of posts documenting my homelab build and whatever else I manage to break.*