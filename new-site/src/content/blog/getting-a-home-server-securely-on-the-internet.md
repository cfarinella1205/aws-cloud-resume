---
title: "Getting a Home Server Onto the Internet Without Opening a Single Port"
date: 2026-06-20T14:31:41Z
description: "How I made a spare gaming PC reachable from anywhere in the world without forwarding a single port on my router."
tags: ["devlog", "homelab", "cloudflare", "networking", "security"]
draft: false
---

I wanted to reach a few things running on my home server from outside the house: a password manager, home automation hub, web UI manager for a game server. The traditional answer is port forwarding, I wanted to take a more modern approach.

## Why not just forward a port

Port forwarding works. It's also the first thing anyone scanning the internet for open ports finds. Forward a port and you've told the entire internet "there is a service here, come knock." Every service you expose is a new thing that has to be patched, monitored, and defended on its own. I have one home network and no interest in babysitting a firewall rule for every container I spin up.

## The stack: Cloudflare Tunnel → Zero Trust Access

The alternative is a tunnel that runs *outbound* from the server to Cloudflare, instead of a port that listens *inbound* on the router. The server calls out, Cloudflare holds the other end, and the router never has to accept a connection it didn't ask for. As far as my router is concerned, nothing is listening. Zero forwarded ports, before or after any of this was set up.

On top of the tunnel sits Zero Trust Access: a policy layer that checks who you are before you ever reach the service behind it. A subdomain isn't just "public but obscure", it's public and gated. One policy I run is scoped and covers two of the self-hosted apps behind it; anyone outside those scoped accounts doesn't get an identity challenge to fail, they get nothing. Reaching a login page for something behind this setup means passing that identity check first. If you don't pass, you don't even get to see that a login page exists.

## Setting it up

The tunnel connector runs as a Windows system service on the server rather than something I have to remember to start. Install it once, point it at the local services, and it comes back up on its own after a reboot without me touching it. That was the actual setup: install the connector, authenticate it to my Cloudflare account, and add a route for each service pointing at its local address and port. No inbound firewall rule, no changed router settings, no dynamic DNS hacks to work around an IP that changes.

One thing I'm aware is still a gap rather than a solved problem: the server's local IP has held steady for months, through restarts and long power-off stretches, but that's luck, not a DHCP reservation actually pinning it. If the router ever hands out a different address, every route in the tunnel breaks until I update it. It's on the list to fix properly rather than keep trusting that it happens to stay put. But, on a managed network (common where I live) there are some extra steps that I have not yet had the time to take.

Each service gets its own subdomain and its own route on the same tunnel, all funneling through one connector. Access policies stack on top per-application, so different services can have different rules. The game server can be open to a short list of friends. The password manager is locked to one account: mine.

## What this actually buys me

Nothing I run at home listens on an open port. The router's port forwarding table is empty and stays that way. If someone port-scans my public IP, they find nothing to connect to, the only way in is through Cloudflare's edge, and Cloudflare won't hand a request through to my server until an Access policy says it's allowed to.

It also means adding something new to the setup is a small task instead of a new decision every time. Wiring up the fourth service onto this tunnel was a route added to an existing connector and a policy copied from one of the other three — no new firewall rule, no new exposure to reason about from scratch, no "is this actually safe to put on the internet" spiral. The identity check and the outbound-only tunnel are already doing the hard part. Everything after that is configuration, not risk.