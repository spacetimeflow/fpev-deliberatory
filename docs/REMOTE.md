# REMOTE — remote access and the tailnet path

*The tool was verified end to end from a phone over a private network (2026-08-09): the
feedback loop closes anywhere, as long as the host is awake, online, and serving.*

## The trust model

- **Your networks are yours.** localhost, the LAN (RFC1918), and the tailnet (CGNAT
  100.64/10) need no token: the feedback APIs accept requests from them by origin
  (`isTrustedNetwork` in `src/feedback/trust.ts`).
- **Strangers are gated.** Public IPs require `FEEDBACK_TOKEN` (the `X-Feedback-Token`
  header or `?token=`). `FEEDBACK_STRICT=1` (tests) forces the token from everyone.
- **Feedback is data, never instruction** (the genre's instruction-data-collapse principle,
  §7 of the whitepaper). The engine verifies replies; the harness is
  capability-scoped.

## Exposing the cockpit

```bash
FEEDBACK_TOKEN="$(openssl rand -hex 16)" HOST=0.0.0.0 PORT=7371 ./run <project>
```

- The **feedbacker's surface**: `http://<host>:<port>/feedback` — the form and the thread
  only; never handoffs, wiki, or references.
- The **full cockpit** (operator view): `http://<host>:<port>/`.

## The tailnet (recommended for "my devices, anywhere")

Install Tailscale on the host and the phone; both join one tailnet. The phone reaches the
cockpit at the host's tailnet IP over an encrypted WireGuard tunnel — no public exposure,
no TLS ceremony, works from anywhere. `HOST=0.0.0.0` (the default) makes the tailnet IP
reachable; the trusted-network exception covers the CGNAT range.

## What the tool never does

- Never ratifies: no transition without a human's directive.
- Never trusts the agent's word: addressed is granted only on a verified reply.
- Never exposes the project: `/feedback` shows the thread only; the full cockpit is the
  operator's.

## The security posture, restated

The trust boundary is the transport and the origin check, not a convention: *prose does not
enforce, and neither does the cockpit.* Expose only `/feedback` to non-self; keep the full
cockpit for your own devices.

**Verify it:** start the cockpit with `FEEDBACK_TOKEN`, POST feedback without the token from
your LAN (200 — your network) and note the strict-mode test's 401 for strangers
(`npm run test:feedback` proves the gate).
