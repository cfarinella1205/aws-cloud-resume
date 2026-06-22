---

title: "Running Home Assistant Core on a Generic Android Tablet"
date: 2026-06-01T00:00:00Z
description: "How I turned an old Android 8.1 tablet into a surprisingly capable smart home server using Termux, proot, and Ubuntu."
tags: ["homelab", "home-assistant", "android", "linux"]
draft: false

---



I had a generic Android 8.1 tablet that I had been given. I also wanted to run Home Assistant Core the bare Python version of HA, without buying dedicated hardware. What followed was equal parts documentation archaeology and stubborn terminal work.





## Why not just buy a Raspberry Pi?



Stubborness and cost. A Pi 4 with a case and SD card runs $80–100. The tablet was already taking up space in my desk. This came about primarily because I first thought to use Fully Kiosk to use the tablet as a wall-mounted display. Once I started doing the research and found Home Assistant, I thought the hardware could handle running HA Core and displaying the dashboards.



Running HA Core on a tablet forces you to understand the layers. You're not getting the nice OS wrapper. You're installing Python dependencies, setting up a virtual environment, and figuring out why a Linux process won't start on Android. That's a better education.



## The stack: Termux → proot-distro → Ubuntu → Home Assistant



Android runs Linux under the hood, but it's a locked-down version. No root, no standard package manager, and limited filesystem access. Termux is a terminal emulator that gives you a real shell and its own package ecosystem without needing root. From there, `proot-distro` lets you install a full Linux distro (I used Ubuntu) inside a chroot-like environment. It's not a VM and not a container, it's more like running Linux inside Linux with some filesystem tricks and stubborn Terumux-Boot scripts to make it work and handle power-cycles without intervention.



From inside the Ubuntu environment, everything is normal. `apt install python3`, set up a virtual environment, `pip install homeassistant`, done.



The rough steps:



1\. Install Termux from F-Droid not the Play Store version (honestly it could work but someone online said to avoid it so I did)

2\. `pkg install proot-distro`

3\. `proot-distro install ubuntu`

4\. `proot-distro login ubuntu`

5\. Inside Ubuntu: install Python 3.11+, create a venv, install `homeassistant`

6\. Run `hass` for the first time and wait — first boot takes several minutes as it downloads components



## What actually gave me trouble



The first wall was Python version. Home Assistant Core has a minimum Python version that moves forward regularly. Android 8.1 ships with nothing useful, and Termux's Python may lag behind. I had to build from the Ubuntu side rather than native Termux to get a recent enough version.



The second wall was the `hass` process dying silently on first run. No error, just stops. The fix was a missing system dependency — `libffi-dev` and `libssl-dev` need to be installed in Ubuntu before the pip install, not after.



The third wall was keeping it running. Android aggressively kills background processes to save battery. The first fix is in Android's developer options: disabling battery optimization for Termux specifically, and acquiring a wakelock inside Termux with `termux-wake-lock` before starting the Ubuntu session. Fully Kiosk and the Termux-Boot addon actually do some heavy lifting here too. Termux-Boot starts the ssh service and HA Core if the tablet power-cycles, and Fully Kiosk starts Termux and Termux-Boot on device boot as a failsafe. This set up has been running for weeks with no need for intervention.



## SSH: the part that made it actually useful



Once HA was running, the tablet was sitting in a corner doing its job. But having to physically touch it every time I wanted to check something was annoying. 



Setting up SSH inside the Ubuntu proot environment meant I could manage the whole thing from my main PC. `apt install openssh-server`, configure it, generate a key pair on my main machine, drop the public key into `authorized\_keys` on the tablet, and now I can SSH in from anywhere on the local network without a password.



This was my first SSH setup and it worked first try, which felt significant at the time.



## What it actually runs



Right now the tablet handles:



\- Home Assistant Core with integrations for my smart TVs and lights

\- Automations — mostly lighting schedules and a few condition-based routines

\- The HA API, which I'm slowly learning to query for other projects

\- Fully Kiosk loads the dashboards so the entire thing functions as an AIO smart home control hub.



It runs 24/7 on a standard USB-C charger. The tablet stays plugged in and has consistently handled any accidental restarts.



## Would I recommend this?



For learning: Strongly recommend. You come out the other side understanding Termux, Linux environments, Python virtual environments, SSH, and Home Assistant's architecture — all from one project.



For a production smart home: depends on your tolerance for occasional weirdness. Android's memory management has not posed much issue but the startup scripts can be bested from time to time. The proot environment adds a layer of indirection that can make debugging stranger. If you want rock-solid, buy a Pi or an old thin client and run HA OS. If you can get HA Core to run on an Android tablet in this manner the technical challenge posed by the lack of app support in Home Assistant won't really be an issue.



If you have an old Android device and the time to figure it out, it's a genuinely satisfying build.



---



*This is part of an ongoing series of retroactive posts documenting my homelab build.*

