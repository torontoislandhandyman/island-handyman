# Connect `islandhandyman.vip` to Island Handyman

**Status checked 15 November 2026.** Do not use guessed A/CNAME targets. The custom domain currently serves an older “Full site coming soon” page, not the current application.

## What is live now

- The current Island Handyman application is live at [https://islandhandy-mssnqkgd.manus.space](https://islandhandy-mssnqkgd.manus.space). It returns HTTP 200, includes the Hero, About, Services and Contact form, and its health endpoint returns HTTP 200.
- `https://islandhandyman.vip/` and `https://www.islandhandyman.vip/` also return HTTP 200, but both show the older GitHub Pages landing page. That page says “Full site coming soon” and does not contain the current operational form.
- The domain still uses Porkbun’s nameservers: `salvador.ns.porkbun.com`, `maceio.ns.porkbun.com`, `curitiba.ns.porkbun.com`, and `fortaleza.ns.porkbun.com`.
- The Cloudflare zone is present but **Pending** and paused. Cloudflare assigned these nameservers: `dimitris.ns.cloudflare.com` and `samara.ns.cloudflare.com`. The existing Cloudflare Worker custom-domain API requires an active Cloudflare zone; the zone will not become active until the registrar delegates the domain to Cloudflare.
- Cloudflare’s pending DNS zone currently has the old GitHub Pages web records: apex A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and `www` CNAME to `torontoislandhandyman.github.io`. It also has staged Cloudflare Email Routing MX/SPF/DKIM/DMARC records and an enabled catch-all that forwards mail to `torontoislandhandyman@gmail.com`. Keep the email-routing records; the old web records will be replaced when the Worker custom domains are attached.
- The Cloudflare zone contains Email Routing MX/SPF/DKIM/DMARC records and a configured catch-all forwarding rule, but it will not receive mail for this domain until Cloudflare is authoritative. The current public Porkbun DNS has no MX records.
- Website password/recovery and owner notification emails use Resend separately. A previous safe, no-customer-data test was rejected with HTTP 422. Resend delivery and the sender domain are therefore **not confirmed**; do not assume the outgoing email is ready.

## Finish connecting the website

1. **Switch the nameservers in Porkbun.** Sign in to Porkbun, open **Domain Management**, select `islandhandyman.vip`, then open **Nameservers**. Choose the custom-nameserver option and replace the four Porkbun nameservers with exactly:
   - `dimitris.ns.cloudflare.com`
   - `samara.ns.cloudflare.com`

   Save the change. This makes Cloudflare the authoritative DNS provider. Cloudflare currently has Email Routing set to forward matching addresses to the owner’s Gmail. Do not delete the Cloudflare MX, SPF, DKIM or DMARC records. Porkbun's [official nameserver instructions](https://kb.porkbun.com/article/22-how-to-change-nameservers) show where to make this change. Cloudflare's [official nameserver guide](https://developers.cloudflare.com/dns/nameservers/update-nameservers/) explains why the registrar delegation is needed.

2. **Wait for Cloudflare to mark the zone Active.** The Cloudflare status is currently Pending, so its Worker custom-domain feature cannot be attached yet. Until the Worker is bound, the existing imported GitHub Pages records may continue to show the old landing page.

3. **Attach the Worker custom domains.** The proxy Worker source is `cloudflare/islandhandyman-vip-proxy.mjs`; it is deployed and tested at [https://islandhandyman-vip-proxy.torontoislandhandyman.workers.dev](https://islandhandyman-vip-proxy.torontoislandhandyman.workers.dev). That test address currently serves the current Manus application. Once the zone is Active, attach both `islandhandyman.vip` and `www.islandhandyman.vip` as Worker custom domains. Cloudflare then creates the required DNS records and TLS certificates automatically. Its [Worker Custom Domains guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) confirms that the zone must be Active and that the hostname cannot already have a CNAME. The old `www` CNAME and apex GitHub A records will be removed/replaced as part of this step; do not remove the email records.

4. **Verify the site.** Check `https://islandhandyman.vip/`, `https://www.islandhandyman.vip/`, and `https://islandhandyman.vip/_app/health`. Both home URLs should show the current single-page site, and the health check should return HTTP 200. The contact form should be verified by a safe owner-controlled test only after the sender/email path is confirmed; avoid creating test customer records.

## Verify outgoing Resend email

Cloudflare Email Routing handles **incoming** mail and forwards it to `torontoislandhandyman@gmail.com`. Resend handles **outgoing** password setup, recovery and application emails; it does not provide an inbox.

1. Sign in to [Resend](https://resend.com/) and open **Domains**. Confirm `islandhandyman.vip` is **Verified** for the address configured as `EMAIL_FROM`.
2. If it is not verified, add the domain in Resend and copy Resend’s exact verification records into Cloudflare DNS. The current Cloudflare zone already has one SPF record for Email Routing (`include:_spf.mx.cloudflare.net`). Do not create a second conflicting SPF record or replace DKIM/DMARC values by guesswork; follow Resend’s displayed instructions and use its recommended sending subdomain if needed.
3. After Resend shows Verified, test only to the owner’s own address and check Resend’s Logs/Emails page. The previous safe provider test returned HTTP 422, so delivery still needs confirmation.

The account-reset code defaults to `https://islandhandyman.vip`; no `PUBLIC_APP_URL` runtime secret is currently configured. The website should therefore be reachable on that hostname before account recovery links are tested. Never paste `RESEND_API_KEY` or other credentials into chat.

### Official references

- [Cloudflare: Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare: Update nameservers](https://developers.cloudflare.com/dns/nameservers/update-nameservers/)
- [Porkbun: Change nameservers](https://kb.porkbun.com/article/22-how-to-change-nameservers)
- [Resend: Add a domain](https://resend.com/docs/add-a-domain)
