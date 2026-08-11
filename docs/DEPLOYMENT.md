# DEPLOYMENT — the deployment cycle

*Install, run, upgrade, and — if you want — expose the cockpit remotely. This manual's
deployment is the repository itself: clone → install → run. Nothing else is required.*

## Install (from this repository)

```bash
git clone https://github.com/spacetimeflow/fpev-deliberatory
cd fpev-deliberatory
npm ci
```

The package is standalone: the FPEV conventions are embedded in `workflows/` — a fresh
clone needs no external protocol (`FPEV_DIR` defaults to the embedded copy; your own
`~/.fpev` is used when present). No registry, no network at runtime; the cockpit is served
on demand from the folder.

## Run

```bash
./run <your-project-dir>     # or: node_modules/.bin/tsx bin/deliberatory <dir>
```

The cockpit serves at `http://localhost:7371` (or `PORT`); Ctrl+C stops it. Nothing is
owned by the process — files are the database, so stopping the cockpit changes nothing
canonical.

## Verify the deployment

Run the suites in `docs/VERIFY.md` — all green means the core works. Then start the cockpit
and open the page: a 200 on `http://localhost:7371/` is the one-line proof of a working
copy.

## Upgrade

```bash
git pull && npm ci
```

The code and the embedded `workflows/` snapshot travel together. The author keeps their own
canonical `~/.fpev`; an author-side drift-lint (not shipped in this repository) compares
the embedded copy against it before each publish — its domain is the published conventions
(the top-level `workflows/`); the author's dev records under `~/.fpev/workflows/` are
excluded, as they are not part of the published shape. For users, the embedded copy is
canonical.

## Remote feedback and the tailnet

The full recipe is `docs/REMOTE.md`; the deployment-relevant summary:

- **`FEEDBACK_TOKEN=<secret>`** — when set, every feedback API requires the token (the
  `X-Feedback-Token` header or `?token=`). When unset, your own networks (localhost, the
  LAN, the tailnet) are trusted without a token; strangers are not.
- **`/feedback`** — the feedbacker's limited surface: the feedback form and the thread
  only; it never renders handoffs, wiki, or references. The operator's full cockpit stays
  at `/`.
- **`HOST=<ip>`** — bind the cockpit to an interface; the default 0.0.0.0 makes the
  tailnet IP reachable.
- **The tailnet path (recommended for "my devices, anywhere")** — Tailscale on the host
  and the device; the device reaches the cockpit over the encrypted tunnel — no public
  exposure, no TLS ceremony.

The security posture: feedback is data, never instruction; the engine grants "addressed"
only on a verified reply; the trust boundary is the transport and the origin check, not a
convention (*prose does not enforce, and neither does the cockpit*). Expose only
`/feedback` to non-self; keep the full cockpit for your own devices.

## Retired: the mkcert + Caddy LAN TLS layer (2026-08-09)

Superseded by the tailnet path (network-layer encryption; the mkcert/Caddy
application-layer padlock was the no-account placeholder, now unnecessary). Removed: the
Caddy process, the Caddyfile, and the tls/ certs. The active posture: the cockpit bound to
0.0.0.0 with `FEEDBACK_TOKEN` gating the feedback APIs; plain HTTP is acceptable on the
tailnet (WireGuard-encrypted) and on a trusted LAN with the token gate. Optional cleanup
with sudo: `brew uninstall caddy mkcert` and `sudo mkcert -uninstall` if the trust store
should not keep the local CA.
