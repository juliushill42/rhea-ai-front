# RHEA — JujuLabz

A clear, mobile-ready interface to the existing RHEA Python gateway.

## One command

    ./bootstrap.sh

Tests run before launch. Opens locally at http://127.0.0.1:4173. Node.js 20+; no paid API, npm installation or Docker required to run the frontend.

## What actually works

- Ask RHEA: sends real requests to the existing `/query` route, shows real responses and errors.
- Give work: sends a request for a plan. The gateway does not execute computer tasks; the UI does not claim otherwise.
- Helpers: list and save helper blueprints (`/blueprints`, `/spawn`). Creating a blueprint does not start a worker.
- Knowledge: save text to RHEA document memory (`/ingest`).
- History: this browser's recent operations only, stored in localStorage.
- Settings: check backend `/health` and `/nodes`; explicit connection status.
- Offline: all controls remain understandable; no simulated replies, completion or fake metrics.

## Connect the real server

Set these only on the host running the frontend/API (never in HTML):

    RHEA_GATEWAY_URL=https://your-rhea-server.example
    RHEA_ACCESS_KEY=<random 32+-character secret>

The existing RHEA gateway has no built-in authorization. Do not expose the gateway directly to the public internet. Keep it behind a private network or authenticated HTTPS proxy. The web API requires the private access key for all connected actions and does not write it to browser storage beyond sessionStorage for the active tab.

Optional `RHEA_UPSTREAM_TOKEN` forwards a bearer token to your secured gateway.

## Test

    ./bootstrap.sh test

Checks the frontend's offline truthfulness, and runs a temporary local mock RHEA server to prove authenticated chat, health, document storage and helper endpoints really forward and return results.

## Scope

This interface connects to the actual `/query`, `/nodes`, `/blueprints`, `/spawn`, `/ingest`, `/health` API in `juliushill42/rhea-ai`.
It does not pretend to run the separate Python Orchestra or Go services. Those need real integration and runtime tests.

Owner: Titan Universal AI LLC. Watermark: `":"`.
