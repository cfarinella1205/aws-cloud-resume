---
title: "Leading a Capstone Team to Ship & Showcase a Real RBAC Server"
date: 2026-07-23T11:15:05Z
description: "Leading a five-person capstone team through five sprints of real Scrum, and owning the security-critical piece."
tags: ["leadership","capstone","devlog","rbac","go"]
draft: false
---

## What the assignment was, and why leadership mattered here

My IT capstone team was assigned to design and build a centralized Role-Based Access Control and Identity Management server: infrastructure that lets administrators define roles, assign permissions to those roles, and have every other service in a system check against that single source of truth before granting access to anything. It's normally something companies buy or inherit from a cloud provider. We built it from the ground up, as a team of five, over five two-week sprints.

I led the team and served as Scrum Master. That meant setting the technical direction early, running the process that kept five people moving on the same deadline, and owning the parts of the system where getting it wrong would have sunk the whole project, which to my mind were identity and security. Good leadership on a technical team isn't just running meetings. It's knowing which pieces are load-bearing and making sure those pieces get the right level of attention, whether that's yours or someone else's.

## Leading the team and running Scrum for real

Five people, five overlapping course loads, one deadline. The first leadership decision was organizational: split the project into clear domains — identity and security, backend API logic, systems integration, database and data architecture, DevSecOps and infrastructure — and give each person ownership of one instead of letting work blur across the team. I took identity and security as my own lane, because it was the highest-stakes piece: if the auth layer is wrong, nothing else in the system can be trusted, no matter how well everything else is built.

Running the program's Scrum structure for real, not the classroom version of it, was its own project on top of the build itself: five two-week sprints, each with sprint planning, a committed backlog of user stories, ten daily standups, a sprint review, and a retrospective. I owned that infrastructure end to end: wrote the sprint goals, broke stories into tasks with clear owners and point estimates, and kept the team's shared documentation organized so nobody had to rediscover where things stood at the start of a sprint. I consider the final drive folder containing all Scum documentation and required meeting minutes a portfolio piece by itself.

The clearest test of whether that process was actually working came during rehearsal, not during a sprint. We ran a full 75-minute dry run before showcase day: cold-start the stack from a clean state and time it, walk through health checks, have every teammate deliver their piece and field a hostile follow-up question, then deliberately break things. Kill a container mid-demo, tamper a token to force a 401, simulate someone freezing mid-sentence and practice recovering out loud. A demo that only ever shows the best path doesn't prove a team can handle the room. Building in failure drills on purpose, before the day it counted, is the kind of process work that doesn't show up in the code but decides whether the code gets shown well.

## Making the security layer defensible, not decorative

It's easy for a student project to fake the security-critical parts. Mock the auth checks, focus polish on the UI, and hope nobody looks too closely. We weren't willing to hand in something that only looked correct, so I went deep on that piece personally rather than spread it thin across the team.

The system is two services. An auth server checks a submitted password against a bcrypt hash in Postgres, and if it's correct, mints a signed JWT carrying that user's roles and permissions. A second service — the downstream — never trusts a token on its own. It forwards the token to the auth server's validate endpoint and only acts on what comes back: present the required permission, get a 200; hold a valid token but lack the permission, get a 403; show up with a bad or missing token, get a 401. That delegation is a real network call on every single request, which is slower than checking a token locally; I chose it anyway because it means what a permission *means* can change in one place, instead of every downstream service needing its own update whenever the rules shift.

Tokens are signed with RS256, an asymmetric algorithm, instead of the simpler HS256 with a shared secret. With a shared secret, anything that can verify a token can also forge one. Splitting the keypair keeps those genuinely separate: the auth server holds the private key and mints, everything else holds only the public key and can only check. For a system where only one service ever verifies tokens, HS256 would honestly have been simpler, and I'd rather say that than pretend the choice was free. A keypair is something you have to generate, mount, and eventually rotate, versus one environment variable.

Permissions aren't baked into the token at login and left stale until it expires. They're pulled live through two many-to-many binding tables, one linking users to roles, one linking roles to permissions. So, a user can hold multiple roles, a role can carry multiple permissions, and nothing is hardcoded onto a user row. The database itself sits on its own isolated Docker network with no route from the downstream service, and it's declared without a host port binding at all, so it isn't reachable from outside the container network under any circumstance. Getting that isolation *actually* correct, and proving it rather than assuming Docker Compose would do the right thing by default, was the hardest part of the whole build.

## Proving it works, live

A demo only means something if it shows failure alongside success. The showcase page is a static HTML file that talks to both services directly so the whole flow runs in a browser with nothing hidden. Log in as a demo admin account and hit the protected resource: access granted, a green 200, with a structured `[AUDIT]` line printing in real time in the server logs showing exactly which permission check passed. Log out, log back in as a read-only demo account, hit the same resource: access denied, a red 403, its own audit line showing what was missing. Same server, same code path, two outcomes, entirely dependent on what the database says about that account's role.

The part that actually proves the signature is real, is tampering with a token on purpose. Flipping one character in it and retrying the same request. That fails differently than a missing-permission denial: it comes back 401, because the signature check itself fails before the server ever looks at what permissions the token claims to carry. A forged or altered token doesn't get denied for lacking access. It gets rejected for not being trustworthy in the first place, which is the actual distinction the whole RS256 decision was for.

## What's deliberately not in scope

There's no token refresh or early revocation, which means a stolen valid token works until it expires. A real and named cost of the chosen design. There's no rate limiting on login, so bcrypt's built-in slowness is currently the only friction against credential stuffing. There's no automated test suite, because five sprints went into real cryptography and real network isolation instead of coverage, and that trade gets stated out loud rather than hidden. In a regularly paced spring or fall semester, these feautures would have been implemented by sprint 7. A production version of this needs TLS, tightened CORS, persistent key material with a rotation policy, and the auth server running as replicas instead of a single point of failure. Knowing exactly where a system's edges are, and being able to say so without hedging, is most of what separates a demo from a plan for a real one.

## Thank you

This was a challenging course, packed into a short and busy summer semester of senior year. Thank you to my team for the consistency and hard work across all five sprints. And thank you, Professor Sadjadi — the [Capstone Showcase Site](https://capstone.cs.fiu.edu/about) he built and maintains was genuinely useful for keeping this project on track, and turning the showcase into a real chance to meet industry professionals instead of just a grade requirement is well above what the course requires of a professor. Thank you to everyone else who supported the Capstone and Showcase process this summer.