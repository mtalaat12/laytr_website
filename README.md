# laytr_website

The published **laytr.app** website. Every file here is generated.

**Do not edit anything in this repository.** Your change would be silently
overwritten the next time the site is published, and the live site would not
match its source.

## Where this comes from

| | |
|---|---|
| Source of truth | `mtalaat12/laytr` (private), directory `website/` |
| Published by | `python3 website/tools/publish.py`, run in that repository |
| Host | Sevalla static site — branch `main`, no build command, publish directory root |
| Domain | `laytr.app`, with `www.laytr.app` permanently redirecting to it |

To change the website, edit `website/` in `mtalaat12/laytr`, rebuild, commit,
and run the publish script. The full maintenance manual is `website/README.md`
in that repository.

## What is in here

Five pages — `/`, `/privacy`, `/terms`, `/support`, `/welcome` — plus a 404, a
sitemap, `robots.txt`, a web manifest, and the `_headers` and `_redirects` files
Sevalla reads from the published root.

Three of those pages are load-bearing rather than decorative: `/privacy` and
`/terms` are compiled into the iOS app, and `/welcome` is the URL the app's
onboarding opens the share sheet on. If they stop serving, links inside the
shipped app break and App Store submission is blocked.

## Verifying a deploy

Every page carries a `laytr-build` fingerprint. In the source repository:

```bash
python3 website/tools/verify.py
```

That checks DNS for both hosts, reads the certificate off the live socket,
confirms the redirect topology, and compares the fingerprint the live site is
serving against the one the source builds. A push is not a deploy.
