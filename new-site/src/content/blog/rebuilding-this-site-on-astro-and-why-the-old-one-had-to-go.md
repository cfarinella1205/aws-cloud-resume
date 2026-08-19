---
title: "Rebuilding This Site on Astro, and Why the Old One Had to Go"
date: 2026-07-22T23:13:05Z
description: "Retiring a hand-rolled static site for a proper build pipeline, and what it actually took to get the new one live."
tags: ["devlog","astro","aws","ci-cd","front-end"]
draft: false
---

The first version of this site was plain HTML and CSS, written by hand, with no templating and no build step. It worked. It also meant every new page was copy-paste-and-edit: the nav, the footer, the fonts, all duplicated across every file, all one typo away from drifting out of sync. Adding a blog meant either building a second hand-rolled system just for posts, or admitting the first system had reached its limit. I picked the second option.

## Why Astro

I wanted to keep static output, the site still needed to live cheaply (for free) on S3 behind CloudFront, the same infrastructure from the original Cloud Resume Challenge build. I didn't want to trade "cheap static hosting" for "now I need a server running somewhere."

Astro fit that constraint exactly: components and layouts at author-time, plain HTML and CSS at build time, zero JavaScript shipped to the browser unless a component explicitly asks for it. Content collections turned the blog from "a problem I have to solve" into a folder of markdown files with frontmatter which is the entire reason a blog exists on this site at all now, instead of being a someday-project.

## The stack: markdown → Astro build → S3 → CloudFront

The old deploy process was one step: upload the changed files. The new one needed an actual build stage in front of it, since there's now a compile step between what I wrote and what a browser gets.

```yaml
# before: deploy.yml just synced source files directly
- name: Deploy
  run: aws s3 sync ./site s3://<bucket-name> --delete

# after: build first, deploy the output
- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Deploy
  run: aws s3 sync ./dist s3://<bucket-name> --delete
```

Small difference, but it's the difference between deploying source and deploying a build artifact.

## The one merge that didn't go cleanly

Partway through the rebuild, I'd been working on the same overhaul from two different machines and ended up with a branch on one of them that had diverged from what I'd pushed everywhere else. Reconciling it took longer than it should have, and at one point I was recovering work from a local backup rather than from git history. The actual cause was smaller than the mess it created, I hadn't pushed before switching machines. But it's the reason I'm more disciplined now about finishing a sync on one machine before touching the same branch on another.

## What's actually better now

Adding a new page used to mean duplicating an HTML file and editing every reference by hand. Now it's a component with props. Blog posts are markdown files with frontmatter instead of hand-written HTML, this post included. The nav's active-page state, which used to require manually adding a class to whichever page's link happened to be "current," is now derived from the route automatically. The resume page's print stylesheet got fixed in the same pass (I tried my best with printing from Edge but please, just use Chrome if you need to print my resume from this site...) and a mobile responsiveness review across every page caught a handful of layout issues the old site had been quietly shipping for a while. I still want to tidy up the mobile view but Capstone work has made it difficult to find time to squash these minor yet persistent issues.

Nothing to write home about, but I am not writing home, just this post. But the site now takes new content in minutes instead of a small ceremony each time, and that's the actual point of doing this at all.
