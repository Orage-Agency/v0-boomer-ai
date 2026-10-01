# Boomer AI

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/team-8378s-projects/v0-boomer-ai)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/n7kvS59CQYN)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/team-8378s-projects/v0-boomer-ai](https://vercel.com/team-8378s-projects/v0-boomer-ai)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/n7kvS59CQYN](https://v0.app/chat/projects/n7kvS59CQYN)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local image provider testing

The image creator supports an experimental OpenAI Codex test provider while the Next.js server runs in development mode. Set `OPENAI_CODEX_ACCESS_TOKEN` to an OAuth access token authorized for ChatGPT plan usage through Sign in with ChatGPT. The provider sends image requests through the public Responses API and keeps the token on the server. The current default model is `gpt-5.5`; set `OPENAI_CODEX_MODEL` to a different model available to that account if needed.

This does not accept an OpenAI API key or a token copied from Codex CLI credentials. ChatGPT plan usage in a hosted or commercial app requires OpenAI's applicable integration approval. Keep the test provider on a local development server; it is intentionally unavailable in production.
