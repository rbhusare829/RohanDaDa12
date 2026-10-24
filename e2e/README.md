# e2e/ — end-to-end tests in a real browser

Two scripts drive the running site with Playwright (`playwright-core`, installed with `npm install`; it uses the Chrome / Edge
already on your computer, no browser download).

| Command | What it checks |
|---|---|
| `npm run e2e:site` | every address in `/sitemap.xml` opens without console errors, failed requests, broken images or sideways scrolling (desktop, and the main pages on a phone); unknown addresses answer a real 404; the contact form validates, sends, and the message reaches the admin inbox |
| `npm run e2e:admin` | sign in; creating a post (validation → draft → publish) and seeing it on the website; editing; version history and restore; the unsaved-changes guard; search in English and Marathi; bulk delete; photo upload and focal point; editing a homepage block; sign out |
| `npm run e2e` | both |

Start the site first, in another terminal: `npm run preview` (production mode — the 404 checks need it) or `npm run dev`.

Both tests clean up after themselves (the test post, photo and message are deleted; the homepage edit is undone).
Screenshots of the admin run are saved in `e2e/.shots` (not committed).

Settings (environment variables): `E2E_URL` (default `http://localhost:3000`), `E2E_EMAIL` / `E2E_PASSWORD` (the admin account; default the
example one), `E2E_CHANNEL` (`chrome`, `msedge`, or `chromium` after `npx playwright-core install chromium`).
