/**
 * trust.ts — the trusted-network exception for the feedback token gate (2026-08-09).
 *
 * FEEDBACK_TOKEN protects the feedback APIs from strangers. Your own networks should not
 * need the dance: localhost, the home LAN (private ranges), and the tailnet (CGNAT
 * 100.64.0.0/10) are trusted by origin, so the researcher's phone works over the tailnet
 * and the LAN without a token. Anything else (a public IP, a misconfigured port-forward)
 * still requires the token.
 */

/** True when the client's IP is on a trusted network (localhost · private LAN · tailnet). */
export function isTrustedNetwork(ip: string | undefined): boolean {
  if (!ip) return false;
  const v = ip.replace(/^::ffff:/, ""); // IPv4-mapped IPv6
  if (v === "::1" || v === "127.0.0.1") return true;
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return (
    a === 10 || // RFC1918 10/8
    (a === 172 && b >= 16 && b <= 31) || // RFC1918 172.16/12
    (a === 192 && b === 168) || // RFC1918 192.168/16
    (a === 100 && b >= 64 && b <= 127) // CGNAT 100.64/10 — the tailnet
  );
}
