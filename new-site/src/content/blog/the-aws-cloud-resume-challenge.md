---
title: "The AWS Cloud Resume Challenge"
date: 2026-08-30T18:42:24Z
description: "Taking the initial plunge into AWS. The problems I faced, what they taught me, and where it has led."
tags: ["aws","IaC","devlog","networking","serverless"]
draft: false
---

I built what I consider to be my first real project in March. It was the [AWS Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/aws/), and what actually went live was one page: my resume, styled with CSS myself. The styling was unpolished and the content was half-baked. There was no homepage, no blog, no gallery, no way to print anything that would survive an ATS. Just a resume, and one I was not happy with.

I'm writing about it now because everything else on this site exists because that resume went live. Here's what the challenge consists of, and how it went for me.

## What the challenge actually makes you build

The Cloud Resume Challenge doesn't let you stop at a static site. Step one is HTML, CSS, and JavaScript on Amazon S3, served through CloudFront so it's on HTTPS with a real domain from Route 53. That part is close to a normal web deploy.

Then it has you add a visitor counter, which means a small backend: a Python Lambda function that does an atomic increment against a DynamoDB table, exposed through API Gateway as a /visitor endpoint. Once that's working, the challenge doesn't let you leave it clicked together in the console either. The last stretch has you redo the whole thing as two separate repositories, one for the frontend and one for the backend, each with its own GitHub Actions pipeline, with the backend infrastructure defined entirely in a template.yaml file through AWS SAM instead of anything created by hand.

So the actual order was: build it once by hand to prove it works, then go back and rebuild the infrastructure piece as code. Nothing about the repo split or the IaC was my idea. It's just what the challenge asks for. Actually doing it is where things broke.

## IAM, CORS, and a 403 that wasn't what it looked like

Moving the backend into a SAM template put CloudFormation in the pipeline, and the IAM user running the GitHub Actions deploy didn't have permission to use it. The pipeline failed with AccessDenied: User is not authorized to perform cloudformation:DescribeStacks. The fix was straightforward once I found it: a dedicated IAM user with a scoped policy that could build, update, and describe the stack, and manage the Lambda and IAM resources SAM needed to create. Nothing broader than that.

CORS was the one that actually got to me. The visitor counter on the frontend just said "Unavailable," while testing the same endpoint directly returned a normal response. The browser console was blocking the request and my testing tool wasn't, which meant the API was fine and something in how the browser talked to it wasn't. Fixing it took two separate changes for one problem: Access-Control-Allow-Origin headers added directly in the Lambda's Python response, and a separate CORS configuration in the SAM template's Globals section to handle the preflight OPTIONS request API Gateway sends before the real one. Skip either half and it breaks again in a way that looks identical from the frontend.

The last one looked worse than it was. Hitting the API from the frontend returned {"message": "Missing Authentication Token"}, which reads like an auth problem. It wasn't. The frontend was calling the root URL instead of the /visitor path defined in the SAM template. Pointing the fetch() call at the right path made the 403 go away. I'd spent longer than I want to admit assuming it was IAM again before I actually looked at the URL.

## What shipped, and what it started

What went live was still just a resume. Bad theming, half-baked content, no homepage, no blog, nothing behind it but the visitor counter. But it was live end to end, built and deployed through two pipelines instead of by hand, and I understood every piece of it because I'd broken and fixed every piece of it.

The moment it was up, I started thinking about what else could live on the same domain: a homepage, a gallery, eventually a blog, and putting a Cloudflare Tunnel with auth in front of some other things I run at home so I could reach them without exposing anything directly. None of that existed yet. But the resume proved the pattern, static frontend, real pipeline, actual infrastructure, and everything I've added since has been a variation on it.

Most of what I've actually learned has been about git hygiene and version control, working through Astro, and the tradeoff between adding a feature and keeping the thing simple enough that I can still maintain it. The site is still live (as you can tell if you are reading this), and it has been continously imroved upon which was really the main point of the challenge.



---



*This is part of an ongoing series of retroactive posts documenting my homelab build.*