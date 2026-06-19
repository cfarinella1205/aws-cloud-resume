---

title: "Running Home Assistant Core on a $40 Android Tablet"
date: 2026-06-01T00:00:00Z
description: "How I turned an old Android 8.1 tablet into a surprisingly capable smart home server using Termux, proot, and Ubuntu — and why it actually works."
tags: ["homelab", "home-assistant", "android", "linux"]
draft: false

---



There's a certain type of homelab project that starts with "I have this old device lying around" and ends three hours later with something that probably shouldn't work but does. This is one of those.



I had a generic Android 8.1 tablet that wasn't doing anything useful. I also wanted to run Home Assistant Core — the bare Python version of HA, without the full OS — without buying dedicated hardware. What followed was equal parts documentation archaeology and stubborn terminal work.



Here's how it went.



\## Why not just buy a Raspberry Pi?



Supply issues and cost, mostly. A Pi 4 with a case and SD card runs $80–100 when you can find one. The tablet was already in my drawer. And honestly, there was a more interesting reason: I wanted to understand what I was running, not just flash an image and call it done.



Running HA Core on a tablet forces you to understand the layers. You're not getting the nice OS wrapper. You're installing Python dependencies, setting up a virtual environment, and figuring out why a Linux process won't start on Android. That's a better education.



\## The stack: Termux → proot-distro → Ubuntu → Home Assistant



Android runs Linux under the hood, but it's a locked-down version — no root, no standard package manager, limited filesystem access. Termux is a terminal emulator that gives you a real shell and its own package ecosystem without needing root. From there, `proot-distro` lets you install a full Linux distro (I used Ubuntu) inside a chroot-like environment. It's not a VM, not a container — it's more like running Linux inside Linux with some filesystem tricks to make it work.



From inside the Ubuntu environment, everything is normal. `apt install python3`, set up a virtual environment, `pip install homeassistant`, done.



The rough steps:



1\. Install Termux from F-Droid (not the Play Store version — it's outdated)

2\. `pkg install proot-distro`

3\. `proot-distro install ubuntu`

4\. `proot-distro login ubuntu`

5\. Inside Ubuntu: install Python 3.11+, create a venv, install `homeassistant`

6\. Run `hass` for the first time and wait — first boot takes several minutes as it downloads components



\## What actually gave me trouble



The first wall was Python version. Home Assistant Core has a minimum Python version that moves forward regularly. Android 8.1 ships with nothing useful, and Termux's Python may lag behind. I had to build from the Ubuntu side rather than native Termux to get a recent enough version.



The second wall was the `hass` process dying silently on first run. No error, just stops. The fix was a missing system dependency — `libffi-dev` and `libssl-dev` need to be installed in Ubuntu before the pip install, not after.



The third wall was keeping it running. Android aggressively kills background processes to save battery. The fix is buried in Android's developer options: disabling battery optimization for Termux specifically, and acquiring a wakelock inside Termux with `termux-wake-lock` before starting the Ubuntu session.



\## SSH: the part that made it actually useful



Once HA was running, the tablet was sitting in a corner doing its job. But having to physically touch it every time I wanted to check something was annoying. 



Setting up SSH inside the Ubuntu proot environment meant I could manage the whole thing from my main PC. `apt install openssh-server`, configure it, generate a key pair on my main machine, drop the public key into `authorized\_keys` on the tablet, and now I can SSH in from anywhere on the local network without a password.



This was my first real SSH setup and it worked first try, which felt significant at the time.



\## What it actually runs



Right now the tablet handles:



\- Home Assistant Core with integrations for my smart TVs and lights

\- Automations — mostly lighting schedules and a few condition-based routines

\- The HA API, which I'm slowly learning to query for other projects



It runs 24/7 on a standard USB-C charger. Tablet stays plugged in, screen off, and has been stable for months without a restart.



\## Would I recommend this?



For learning: yes, strongly. You come out the other side understanding Termux, Linux environments, Python virtual environments, SSH, and Home Assistant's architecture — all from one project.



For a production smart home: depends on your tolerance for occasional weirdness. Android's memory management will occasionally get ornery. The proot environment adds a layer of indirection that can make debugging stranger. If you want rock-solid, buy a Pi or an old thin client and run HA OS.



But if you have an old Android device and the time to figure it out, it's a genuinely satisfying build.



\---



\*This is part of an ongoing series documenting my homelab build. Next up: setting up the network foundation and getting a Cloudflare tunnel running on my project PC.\*

