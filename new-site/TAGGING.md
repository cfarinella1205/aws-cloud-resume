# Blog tagging convention

`tags` in a post's frontmatter (`src/content/blog/*.md`) drives the tag chips on
the blog index and the `/blog/tags/[tag]` filter pages. No schema enforcement —
just follow this by hand when you write a post.

## Structure: 1 type tag + up to 4 topic/tool tags (5 max)

Always list the type tag **first**.

### Type tag — pick exactly one

| Tag | Use for |
|---|---|
| `devlog` | Explaining a project: what you built and how. |
| `reflection` | Reflecting on what you learned — process, leadership, decisions, retrospectives. Not a build walkthrough. |
| `guide` | A focused how-to for one specific problem, written for someone else to follow. Not tied to narrating your own project end-to-end. |

If a post genuinely straddles two, pick the one that describes *most* of the
post's word count, not its subject matter. (E.g. the capstone post is about
building an RBAC server, but it's mostly about leading the team and what that
taught you — `reflection`, not `devlog`.)

### Topic/tool tags — up to 4

Name the actual languages, tools, platforms, or subject areas involved.
Keep them:

- **lowercase, kebab-case**: `home-assistant`, not `Home Assistant` or `homeassistant`
- **canonical slugs for tools**: use the tool's own name/casing convention lowercased (`cloudflare`, `astro`, `aws`), not marketing names or abbreviations you'd have to explain
- **specific over vague**: prefer `rbac` over `security` if RBAC is really the subject; both is fine if both are genuinely central
- **reused, not reinvented**: check the list below before coining a new tag — a smaller, consistent tag vocabulary is more useful for filtering than a precise-but-unique one

## Current tag vocabulary

Type tags: `devlog`, `reflection`, `guide`

Topic/tool tags in use as of 2026-08-19:
`homelab`, `cloudflare`, `networking`, `security`, `home-assistant`, `android`,
`linux`, `leadership`, `capstone`, `rbac`, `go`, `astro`, `aws`, `ci-cd`, `front-end`

Add to this list as new posts introduce genuinely new topics — but check here
first so `frontend` and `front-end` don't both end up as tags.

## Example

```yaml
tags: ["devlog", "homelab", "cloudflare", "networking", "security"]
```
