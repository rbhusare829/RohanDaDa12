# Rohan Subhash Deshmukh — Official Website

The official website of Rohan Subhash Deshmukh (Solapur, Maharashtra) **and** the admin panel that edits it.
One repository, three tiers:

```
  Browser
     │
     ▼
┌───────────────────┐   REST API (JSON)   ┌───────────────────┐    SQL     ┌─────────────────┐
│    frontend/      │ ──────────────────▶ │     backend/      │ ─────────▶ │      db/        │
│ website + admin   │ ◀────────────────── │ Express + API +   │            │ SQLite (dev)    │
│ React 19 + Vite   │                     │ admin sign-in     │            │ MySQL (prod)    │
└───────────────────┘                     └───────────────────┘            └─────────────────┘
 presentation tier                         application tier                  data tier
```

| Tier | Folder | Technology |
|---|---|---|
| Presentation | `frontend/` | React 19 · Vite · Tailwind CSS v4 (CSS-first `@theme` in `src/index.css`) · React Router v7 · React Hook Form · Axios · motion · lucide-react · react-helmet-async · TipTap (the admin's text editor) |
| Application | `backend/` | Node.js (ESM) · Express 4 · Sequelize 6 · JWT + bcrypt (httpOnly cookie) · multer + sharp (uploads) · express-validator · express-rate-limit · helmet + cors + cookie-parser · nodemailer · node-cron · `@aws-sdk/client-s3` |
| Data | `db/`, `backend/data/` | SQLite for local development (one file, nothing to install) · MySQL / MariaDB (`mysql2`) for production. `db/docker-compose.yml` starts a local MySQL. |

The website is **English only** for now. Every text field also stores a Marathi (मराठी) version in the database (the admin
has an *English | मराठी* switch), so a Marathi site (`/mr`) can be switched on later without migrating any content.

**Contents**
[1 Quick start](#1-quick-start) ·
[2 Project layout](#2-project-layout) ·
[3 How it works](#3-how-it-works) ·
[4 Content model](#4-content-model) ·
[5 The admin panel](#5-the-admin-panel) ·
[6 The public website](#6-the-public-website) ·
[7 REST API](#7-rest-api) ·
[8 Configuration](#8-configuration-env-files) ·
[9 Database](#9-database) ·
[10 Uploaded files](#10-uploaded-files) ·
[11 Security](#11-security) ·
[12 Accessibility & performance](#12-accessibility--performance) ·
[13 Testing](#13-testing) ·
[14 Going live](#14-going-live) ·
[15 Maintenance & troubleshooting](#15-maintenance--troubleshooting) ·
[16 Coming from the old (Payload) site](#16-coming-from-the-old-payload-site) ·
[17 What changed in 2.0](#17-what-changed-in-20)

---

## 1. Quick start

**You need:** Node.js 20.9 or newer (22 LTS recommended). Nothing else — no database to install.

On Windows double-click one of:

| File | What it does |
|---|---|
| `start-dev.bat` | Development: the website reloads and the backend restarts when you change code |
| `start-website.bat` | Production mode: builds the website once and serves site + admin + API from one address |

Or from a terminal (any system):

```bash
npm install
npm run dev        # development  — website http://localhost:3000, API http://localhost:3001/api
npm run preview    # production   — everything on http://localhost:3000
```

The first start does everything for you: it creates `backend/.env` and `frontend/.env` from the `.env.example` files (with a fresh
random `JWT_SECRET`), loads the website content into the empty database (a few seconds) and creates the first admin account.

| | |
|---|---|
| Website | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin |
| API | http://localhost:3001/api (`npm run dev`) or http://localhost:3000/api (`npm run preview`) |
| First admin | `admin@rohandeshmukh.in` / `ChangeMe@123` — **change it** under *My account* after the first sign-in |

In production the backend refuses to create the first admin with that example password: set `ADMIN_PASSWORD` first (section 14).

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Backend (3001) with restart-on-change + website with hot reload (3000) |
| `npm run preview` | Builds the website when the code changed, then serves site + admin + API from the backend on 3000 (`NODE_ENV=production`) |
| `npm run build` | Type-checks and builds the website into `frontend/dist` |
| `npm start` | Starts only the backend (it also serves `frontend/dist` when that folder exists) |
| `npm run seed` | Loads the bundled website content into an **empty** database and creates the first admin |
| `npm run seed:fresh` | Deletes **all content** (not the users) and loads the bundled content again |
| `npm run migrate` | Runs database migrations (they also run at every start while `AUTO_MIGRATE=true`) |
| `npm run admin -- --email you@example.com` | Sets a new admin password (or creates a super admin) — for a lost password, see section 15 |
| `npm run import:payload -- …` | Brings over content from the OLD Payload site, see section 16 |
| `npm test` | The backend test suite (139 tests, about 30 s). With `TEST_MYSQL_URL=mysql://root@127.0.0.1:3306` it runs on MySQL instead of SQLite |
| `npm run e2e` | Browser tests of the running site and admin (`e2e/README.md`); start `npm run preview` first |
| `npm run lint` / `npm run typecheck` | ESLint (both tiers) / TypeScript (frontend) |

---

## 2. Project layout

```
backend/
  src/
    schema/          THE CONTENT MODEL, declared once (collections, globals, page blocks, home blocks).
                     The database tables, the API validation, the access rules AND the admin forms are all built from it.
    lib/             documents.js  create / find / update / delete with drafts, versions, languages, population
                     query.js      the where / sort query language (SQL where possible, JavaScript for the rest)
                     uploads.js    real file-type detection, WebP conversion and sizes (sharp);  storage.js  disk or S3
                     auth.js, access.js, mail.js, seo.js, sanitize.js, csv.js, localize.js, util.js
    routes/          content (REST) · forms (contact) · users (sign-in, reset) · admin (schema + dashboard) · site (SEO, SPA)
    middleware/      core.js (session, caching headers, errors) · security.js (CSP, CORS, CSRF guard, rate limits)
    db/              Sequelize models + Umzug migrations — the same code for SQLite and MySQL
    jobs/            node-cron: the nightly SQLite backup
    seed/            the bundled content (JSON + 171 photos), the seed / admin commands, the Payload converter
  scripts/           import-from-payload.mjs
  test/              node:test suites (auth, content, forms, seed, site, units, uploads)
frontend/
  src/
    pages/           the public pages (Home, Blog, BlogPost, Events, SocialWork, Initiative, Foundation, Family, Media, Contact, CmsPage)
    components/      layout (header, footer, banner, SEO) · home sections · page blocks · blog · forms · UI pieces
    lib/             api.ts (Axios client with a 60 s cache), layout loader, i18n helper, SEO helpers, analytics, captcha
    i18n/messages/   en.json, mr.json — the fixed texts of the site (buttons, labels, errors)
    admin/           the admin panel (loaded only at /admin): layout, schema-driven forms, list view, editors, media picker
  public/            favicons and the self-hosted Tiro Devanagari Marathi font
db/                  docker-compose.yml (MySQL) + notes
e2e/                 end-to-end tests in a real browser (Playwright)
scripts/dev.mjs      the one-command starter behind `npm run dev` / `npm run preview`
start-dev.bat, start-website.bat   Windows double-click starters
```

---

## 3. How it works

* **One schema drives everything.** `backend/src/schema` describes each collection (fields, who may read / write, drafts, versions).
  From it the backend builds the database tables, validates and cleans every write, resolves languages and relations, and sends a JSON
  description to the admin (`GET /api/admin/schema`) which renders the forms and lists. Add a field in the schema and it appears in the
  database, the API and the admin form.
* **Documents.** Each collection is a table with a few real columns (the ones used for filtering and sorting, e.g. `slug`, `_status`,
  `publishedAt`) and a JSON `data` column for everything else. Rich text is stored as clean HTML.
* **Languages.** A localized field is stored as `{ "en": …, "mr": … }`. A public request asks for one language (`?locale=en`); when that
  text is empty the other language is used, so a half-translated page never shows holes. The admin asks for `locale=all`.
* **Drafts, scheduling, versions.** Pages, initiatives and posts have a *Draft* / *Published* status; a post with a future publish date is
  *Scheduled* and appears by itself on that date. Every save of a page, initiative, post and of the homepage keeps a version (the last 20)
  that can be restored into the form.
* **What a visitor sees.** Visitors only get published content. The public website sends `X-Public-View: 1` with every read, so even an
  editor who is signed in sees exactly what a visitor sees while browsing the site (the admin keeps its own full view).
* **Caching.** The website keeps API answers for 60 seconds in memory. Visitors' API responses may be cached by the browser for 30 s;
  a signed-in editor never gets a cacheable answer, so a change shows at once. Saving in the admin also clears the website's own cache.
* **Search engines.** The site is a single-page app, so the backend fills each page's `<title>`, description, canonical address,
  Open Graph / Twitter tags and JSON-LD into the HTML before sending it. Unknown addresses answer a real `404`; old addresses answer a
  `301`. `sitemap.xml` and `robots.txt` are generated from the content.
* **Photos.** Every upload is checked by its content, converted to WebP (max 2400 px) and gets three smaller copies
  (`thumb` 480, `card` 960, `hero` 1920 px). The website picks the right size with `srcset` and honours the *focal point* chosen in the admin.

---

## 4. Content model

### Collections (lists of items)

| Collection (slug) | Used for | Read | Write | Status / versions |
|---|---|---|---|---|
| Pages (`pages`) | Content pages with a URL of their own: Biography, Introduction, Vision, Appeal, Political Career, Lokmangal Parivar, Foundation, Privacy, Terms, Disclaimer … built from blocks (below) | visitors: published | editors | draft + 20 versions |
| Initiatives (`initiatives`) | Social work projects: counters, gallery, videos, related posts | published | editors | draft + 20 versions |
| Events (`events`) | Recurring events with year-wise galleries | everyone | editors | — |
| Posts (`posts`) | Blog articles: rich text, cover, categories, tags, author | published (and not scheduled for later) | editors | draft + schedule + 20 versions |
| Categories (`categories`) | Blog categories | everyone | editors | — |
| Albums (`albums`) | Photo Gallery albums | everyone | editors, media uploaders | — |
| Videos (`videos`) | Video Gallery (YouTube) with playlists | everyone | editors, media uploaders | — |
| Offices (`offices`) | Offices shown on Contact, with the e-mail addresses that receive messages | everyone | editors | — |
| Media (`media`) | The photo library | team | editors, media uploaders (delete: editors) | — |
| Documents (`documents`) | PDFs (profile, reports, e-books) | team | editors, media uploaders | — |
| Contact messages (`contact-messages`) | The inbox: messages from the Contact page, status + internal notes | editors | the website (create), editors (status / notes) | — |
| Users (`users`) | Admin accounts | self / super admin | super admin | — |

Also kept in the database but hidden from the admin menu (still reachable by address, e.g. `/admin/collections/quotes`):
Quotes, Meetings with leaders, Awards, Official photos, Career openings, Media folders, Grievances, Job applications, Form uploads.

### Globals (one set of settings each)

| Global | What it holds |
|---|---|
| Homepage (`home`) | The homepage sections in order, with SEO (20 versions) |
| Menu (`header`) | The 3-level mega menu |
| Footer (`footer`) | Footer columns, legal links, copyright |
| Site settings (`site-settings`) | Name, tagline, logos, phone, e-mail, social links, default recipients for form e-mails, SEO defaults |
| Site popup (`popup`) | An optional announcement popup (on / off, text, image, link) |

### Page blocks (what a CMS page is made of)

`content` (rich text) · `mediaText` (photo + text) · `stats` (counters) · `cards` (photo / text cards) · `gallery` · `faq` · `video` ·
`quote` · `downloads` (PDFs) · `cta` (call to action).

### Homepage sections

`heroSlider` · `quickLinks` · `aboutIntro` · `homeJourney` · `biography` · `featuredVideo` · `workHighlights` · `initiativesShowcase` ·
`family` · `homeParivar` · `homeHighlights` · `homeEvents` · `homeVision` · `homeGallery` · `homeStats` · `homeFaq` · `latestBlog` ·
`socialFeeds` (Instagram reels) · `appealBand`. Each can be hidden, duplicated and re-ordered in the admin.

**The hero** (`heroSlider`) puts one photo of Rohan behind the words of every slide. The first button of a slide is the main call to action
(orange), the second an outline. Under *Homepage → Hero*:

* **Hero style** — *With a photo and buttons* (the default) or *Text only (navy band, no buttons)*. Switching is manual and the site does not split
  visitors by itself: run each style for a while and compare the Contact form's `generate_lead` events and visits to `/contact`. With the photo
  style every click on a hero button is also sent to Google Analytics as `hero_cta_click` (label, link, slide number, main or second button);
  analytics only runs once `VITE_GA_ID` is set.
* **Photo** (wide screens — Rohan on the right, the left side is darkened for the words) and **Photo for phones** (portrait). Click the face in the
  photo library to set the focal point; a phone shows the part around it. The bundled content already has both; a site that was set up
  earlier keeps its text-only hero until a Photo is chosen here.
* The slideshow has a **Pause / Play** button. It also holds while the pointer or keyboard focus is on it and while the tab is hidden. Visitors
  whose device asks for reduced motion get no autoplay until they press Play.

---

## 5. The admin panel

Open `/admin` and sign in. It works on desktop and phone.

### What you can do

* **Dashboard** — shortcuts to the common jobs, the counts, and the latest inbox messages.
* **Edit anything** — homepage sections (drag to reorder, hide, duplicate), the menu, footer, popup, site settings, pages, initiatives,
  events, posts, albums, videos, offices, categories, photos, PDFs and users.
* **Languages** — the *English | मराठी* switch at the top of every form changes which language the text fields show; both are saved together.
* **Publishing** — *Save draft*, *Publish*, *Update*, *Switch to draft*; set a future *Published at* date and the button becomes *Schedule*.
  *View on website* opens the live page. **Ctrl+S** (⌘S) saves.
* **History** — every save is kept (last 20). *History* lists them; *Restore* puts an old version into the form — it only goes live when you save.
* **Text editor** — headings, bold / italic / underline / strike, lists, quotes, links, divider, photos from the library. The server cleans the HTML again on save.
* **Photo library** — drop many photos at once; click the photo to set its *focal point* (the part kept when it is cropped); replace a file, add alt text.
* **Lists** — search (finds English and Marathi text), sort by clicking a column, filter by status / category, page through, select several and delete.
* **Inbox** — messages from the Contact page with status (new / in progress / resolved / spam), internal notes and **Export CSV**.
* **Safety** — the server validates everything and the form scrolls to the field that needs attention; leaving a form with unsaved changes asks first.
* **My account** — your name and password. A lost password: *Forgot password?* on the sign-in page (needs e-mail, section 8) or `npm run admin`.

### Roles

| | Super admin | Editor | Media uploader |
|---|:--:|:--:|:--:|
| Pages, initiatives, events, posts, categories, offices | ✔ | ✔ | — |
| Albums, videos, photos, PDFs (create / edit) | ✔ | ✔ | ✔ |
| Delete photos, PDFs, albums, videos | ✔ | ✔ | — |
| Homepage, menu, footer, settings, popup | ✔ | ✔ | — |
| Inbox (read, status, notes, export, delete) | ✔ | ✔ | — |
| Users (add, change role, delete) | ✔ | — (can change own name / password) | — |

Five wrong passwords lock an account for 10 minutes. Sessions last 8 hours (`JWT_EXPIRES_HOURS`) and end when the password changes.

---

## 6. The public website

| Address | Page |
|---|---|
| `/` | Home (sections from the Homepage global) |
| `/about/family` · `/lokmangal/foundation` | Family; Lokmangal Foundation (projects explorer, events, photos) |
| `/social-work` · `/social-work/:slug` | Initiatives with category filter and search; one initiative |
| `/events` · `/events/:slug` | Events; one event with year tabs |
| `/blog` · `/blog/:slug` | Articles (search, category, tag filters); one article with key points, share buttons, related posts |
| `/media/photos` · `/media/photos/:slug` · `/media/videos` | Photo albums (lightbox); video gallery |
| `/contact` | Contact form + offices |
| any address of a CMS page | `/about/biography`, `/about/introduction`, `/vision`, `/appeal`, `/political-career`, `/lokmangal/parivar`, `/privacy-policy`, `/terms`, `/disclaimer` … |

* Old addresses answer a `301`: `/en/…` → `/…`, `/about/achievements` → `/about/biography`, `/about/party-organisation` → `/political-career`,
  `/about/thoughts` → `/blog`, `/about/leaders` → `/about/biography`, `/lokmangal/vishwamangal` → `/lokmangal/foundation`,
  `/media/downloads` → `/media/photos`, `/grievance` and `/careers` → `/contact`, `/search` → `/`; a trailing `/` is removed.
* The **contact form** is checked in the browser and again on the server (error codes the form translates), protected by a hidden
  honeypot field, a rate limit (5 messages / 10 min per address) and — when keys are set — Google reCAPTCHA v3. The message is saved in the
  inbox and e-mailed to the chosen office (its *notify e-mails*), or to the default recipients in Site settings. An attachment (the form offers PDF, JPG, PNG and WebP;
  the server also accepts Word files; up to 5 MB) is checked by its real content and stored privately.
* **Analytics** (Google Analytics) and **reCAPTCHA** load only when `VITE_GA_ID` / the reCAPTCHA keys are set.

---

## 7. REST API

Base address `/api`. JSON in, JSON out. The shape follows the previous site's (Payload) API, so existing clients keep working.

| Request | |
|---|---|
| `GET /api/:collection` | list — `?where[…]&sort=&limit=&page=&depth=&locale=` |
| `GET /api/:collection/count` | `{ totalDocs }` |
| `GET /api/:collection/:id` | one item (`?depth=&locale=`) |
| `POST /api/:collection` | create (`multipart/form-data` with a `file` and a `_payload` JSON field for photos / PDFs) |
| `PATCH /api/:collection/:id` | update |
| `DELETE /api/:collection/:id` | delete |
| `GET /api/:collection/export` | CSV of an inbox (editors) |
| `GET /api/:collection/:id/versions`, `…/versions/:versionId` | version history (signed in) |
| `GET /api/globals/:slug`, `POST /api/globals/:slug`, `GET /api/globals/:slug/versions[/:id]` | settings pages |
| `POST /api/forms/contact` | the Contact page form |
| `POST /api/users/login` · `logout` · `forgot-password` · `reset-password` · `change-password`, `GET /api/users/me` | sign-in |
| `GET /api/admin/schema`, `GET /api/admin/dashboard` | what the admin is built from (signed in) |
| `GET /api/health` | `{ "status": "ok" }` |
| `GET /sitemap.xml`, `/robots.txt` | generated |

**Query language**

```
GET /api/posts?where[categories][contains]=3&where[_status][equals]=published&sort=-publishedAt&limit=6&depth=1&locale=en
GET /api/initiatives?where[and][0][featured][equals]=true&where[and][1][category][in]=health,education
GET /api/contact-messages?where[or][0][name][like]=sharma&where[or][1][mobile][like]=98765     (editors)
```

Operators: `equals`, `not_equals`, `in`, `not_in`, `contains`, `like`, `exists`, `greater_than`, `greater_than_equal`, `less_than`,
`less_than_equal`; combine with `and` / `or` (nesting up to 6 levels). `sort=-field,field2`. `limit` up to 500 (`0` = 500), `depth` 0–3 fills
in related photos and items. `locale` is `en`, `mr` or `all`. Conditions on fields with their own database column run in SQL, the rest are
checked in JavaScript on the rows SQL returns; items that tie on every sort key follow the direction of the sort (newest first = newer first).

**Signing in from code** — `POST /api/users/login` sets the `rd_token` httpOnly cookie. Every write that uses the cookie must also send the
header `X-Requested-With: XMLHttpRequest` (and, if the browser adds one, an `Origin` that is the site's). Scripts can instead send
`Authorization: JWT <token>`.

---

## 8. Configuration (`.env` files)

`npm run dev` creates both files from the examples. Every variable is explained inside `backend/.env.example` and `frontend/.env.example`.

### `backend/.env`

| Variable | Default | |
|---|---|---|
| `NODE_ENV` | `development` | `production` switches on secure cookies, strict checks and the nightly SQLite backup |
| `PORT` | `3001` | |
| `PUBLIC_URL` | `http://localhost:3000` | the website's address (links, e-mails, sitemap, share tags, allowed origin) — set it to `https://your-domain` |
| `JWT_SECRET` | made for you | signs sign-in cookies; **32+ random characters in production** (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `JWT_EXPIRES_HOURS` | `8` | session length |
| `COOKIE_NAME`, `COOKIE_SECURE`, `COOKIE_SAMESITE` | `rd_token`, auto (true on `https://`), `lax` | |
| `TRUST_PROXY` | off | number of proxies in front (usually `1`) so the real visitor address is used for rate limits |
| `CORS_ORIGINS` | — | extra allowed origins, comma separated (only when the website is hosted separately) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | `admin@rohandeshmukh.in`, `ChangeMe@123` | the first admin, created by `npm run seed` when there are no users (the example password is refused in production) |
| `DB_DIALECT` | `sqlite` | `sqlite`, `mysql` or `postgres` (worked out from `DATABASE_URL` when it starts with `mysql://` / `postgres://`) |
| `SQLITE_PATH` | `data/rohan.sqlite` | |
| `DATABASE_URL` or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | — | MySQL connection (`mysql://user:pass@host:3306/name`); `DB_SSL=true` for hosted databases that need TLS |
| `AUTO_MIGRATE` | `true` | run migrations at every start |
| `STORAGE_DRIVER` | `local` | `local` (`UPLOAD_DIR`, default `uploads`) or `s3` |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | — | required for `s3`; optional `S3_ENDPOINT` (R2, Spaces, MinIO), `S3_PREFIX`, `S3_PUBLIC_URL` (CDN), `S3_FORCE_PATH_STYLE` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | empty | e-mail for form notifications and password reset; without `SMTP_HOST` messages are only written to the log |
| `RECAPTCHA_SECRET_KEY` | empty | Google reCAPTCHA v3 secret (empty = off) |
| `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_TOKEN` | empty | the Facebook Page and its access token — the home page shows the Page's latest posts when both are set (see below); optional `FACEBOOK_GRAPH_VERSION` (default `v25.0`) |
| `BACKUP_CRON`, `BACKUP_DIR`, `BACKUP_KEEP` | `30 2 * * *` (production, SQLite), `backups`, `14` | nightly copy of the SQLite file; empty `BACKUP_CRON` = off |
| `SERVE_FRONTEND`, `FRONTEND_DIST` | auto (on when `frontend/dist` exists) | let the backend serve the built website |
| `LOG_REQUESTS`, `RATE_LIMIT_DISABLED` | on in development, off | |

### `frontend/.env` (only `VITE_…` variables reach the browser)

| Variable | |
|---|---|
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key for the Contact form (empty = off) |
| `VITE_GA_ID` | Google Analytics measurement id, e.g. `G-XXXXXXXXXX` (empty = no analytics) |
| `VITE_API_URL` | only when the website is hosted separately from the backend: the backend's address (also add it to `CORS_ORIGINS`) |
| `BACKEND_URL` *(shell variable)* | where `npm run dev` forwards `/api`, `/uploads`, `sitemap.xml` and `robots.txt` (default `http://localhost:3001`) |

### Facebook posts on the home page

Facebook no longer lets a Page's posts be embedded on other sites (its plugin shows only the Page's name and a Follow button), so the
home page's **Stay Connected** section reads them on the server with the Graph API and the Page's access token. The backend answers
`GET /api/facebook/posts`, keeps the result for 10 minutes and the token never reaches the browser. Until the two variables below are set
(or if Facebook does not answer) the section shows a plain "Visit our Facebook page" button — never made-up posts.

1. At [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create app** (use case *Other*, type *Business*). You must be an admin of the Facebook Page.
2. **Tools → Graph API Explorer** → pick your app → **Get User Access Token** with the permissions `pages_show_list` and `pages_read_engagement`.
3. Make it long-lived: **Tools → Access Token Debugger → Extend Access Token**, paste that long token back into the Explorer and run `GET me/accounts`.
   The entry for your Page has its `id` and an `access_token` — a Page token made from a long-lived user token does not expire.
4. Put them in `backend/.env` (on Vercel: *Project → Settings → Environment Variables*) and restart:
   `FACEBOOK_PAGE_ID=<id>` and `FACEBOOK_PAGE_TOKEN=<access_token>`.

If the posts disappear later, the backend log says `[facebook] could not read the Page's posts: …`. The usual causes: the token's owner changed
their password, lost admin rights on the Page, or removed the app — make a new token the same way.

---

## 9. Database

SQLite and MySQL / MariaDB use the same models and the same migrations (`backend/src/db/migrations`).

```bash
# local MySQL with Docker (see db/README.md for the details)
docker compose -f db/docker-compose.yml up -d
# backend/.env:  DB_DIALECT=mysql   DATABASE_URL=mysql://rohan:rohan-local-password@localhost:3306/rohan
npm run seed        # only on a new, empty database
npm run dev
```

* **Migrations** run at every start (`AUTO_MIGRATE`) or with `npm run migrate`. Use `utf8mb4` for MySQL (Marathi text and emoji need it).
* **Backups** — SQLite: automatic nightly copy in production to `backend/backups` (newest 14 kept). MySQL: `mysqldump --single-transaction --default-character-set=utf8mb4 …`.
  Photos and PDFs are **not** in the database: back up `backend/uploads` (or your bucket) as well.
* **Seed** — `backend/src/seed/data` + `backend/src/seed/media` hold the content of the website as it was handed over (235 documents, 171 photos).

---

## 10. Uploaded files

| | Photos (`media`) | PDFs (`documents`) | Form attachments (private) |
|---|---|---|---|
| Accepted | JPEG, PNG, WebP, GIF, AVIF (not SVG) | PDF | PDF, JPG, PNG, WebP, DOC, DOCX |
| Largest | 15 MB | 15 MB | 5 MB |
| Stored as | WebP up to 2400 px + `thumb` / `card` / `hero` copies | as uploaded | as uploaded, in a private folder |
| Served | `/uploads/…` (cached for a year) | `/uploads/documents/…` | only to editors, always as a download |

The real file type is read from the file's first bytes — a renamed file is refused. Names are cleaned, so a path in a file name cannot escape the folder.

**S3** — set `STORAGE_DRIVER=s3` and the `S3_*` variables. Files are then stored with `@aws-sdk/client-s3`, their public addresses point at the
bucket (or `S3_PUBLIC_URL`), and the content-security-policy allows that address automatically. Uploads pass through `multer` into memory first because
every photo is checked, converted to WebP and resized before it is stored — which is why `multer-s3` (it streams the original straight to the bucket) is not used.

---

## 11. Security

* **Sign-in:** bcrypt (cost 12); the cookie is `httpOnly`, `SameSite=Lax` (`Secure` on https) and tied to the password, so changing it ends every session; 5 wrong passwords lock the account for 10 minutes (HTTP 423); a wrong e-mail or password gives the same message.
* **CSRF:** a write made with the session cookie must carry `X-Requested-With: XMLHttpRequest` and a matching `Origin`.
* **Rate limits (per address):** reads 1200 / minute, writes 300 / 15 minutes, failed sign-ins 10 / 15 minutes, Contact form 5 / 10 minutes.
* **Headers:** helmet with a content-security-policy that allows only the site itself plus YouTube, Instagram, Facebook, Google Maps, reCAPTCHA and Google Analytics; HSTS on https; `X-Frame-Options`, `nosniff`, `Referrer-Policy`.
* **Content:** rich text is cleaned with `sanitize-html` on the server; the Contact form e-mail escapes every value; JSON-LD in the page head is escaped.
* **Uploads:** content-based type detection, WebP re-encoding, size limits, private folder that is never served.
* **Query safety:** only fields that exist (and that the user may read) can be queried or sorted; `LIKE` patterns are neutralised.
* **Errors:** no stack traces or internals in responses.
* The backend test-suite covers each of these (`npm test`).

---

## 12. Accessibility & performance

Checked with axe-core (WCAG 2.0/2.1 A + AA + best practices) on all public page types and the admin, on desktop and phone widths: **no violations**.
What that took: the orange used behind white text is `#c9500b` (white on it is 4.5:1; the old `#f26b1d` was 3.0:1) — change `--color-saffron-600`,
`--color-saffron-700`, `--color-btn`, `--color-btn-hover` and `--color-btn-active` in `frontend/src/index.css` to restyle it; heading levels that follow the page structure;
visible text contained in every control's name; labelled form fields, editor and landmarks in the admin; keyboard support (Esc closes dialogs and the phone menu).

A second pass looked at touch, edges, colour and motion (all tokens live in `@theme` at the top of `frontend/src/index.css`):

* **Edges you can see** — the border of form fields, checkboxes, filter chips and share buttons is `--color-field` `#8b93a1` (3.1:1 on white, WCAG 1.4.11);
  the pale `--color-line` is for dividers only. Fields get a 2 px dark-orange ring while typing; errors use `--color-danger` and are tied to their field with `aria-describedby`.
* **Touch targets** — on phones links, chips, tabs, share and pagination buttons and the footer links are at least 44 px high (`min-h-11`; the `.tap-pad`
  class gives a small text link a 44 px touch area without moving anything). The consent checkbox is a 24 px custom box (`.check`) inside a 44 px-high label.
* **Colour with a job** — the bright `#f26b1d` is only for lines, dots and glows, never behind text or a button; buttons are `#c9500b` (hover `#a8430a`, pressed `#8f3a08`).
  Meaning colours: `--color-success #1f7a3a`, `--color-warning #a84a06`, `--color-danger #b42318`, `--color-info #1d4ed8`, each with a `-soft` background
  (4.5:1 or better on white and on its own soft background; `warning` is a little darker than the usual amber `#b45309`, which is 4.46:1 on the admin page background).
  Impact numbers are green. The cream sections use `#fff8f0`. The admin uses the same tokens for status pills, toasts and errors.
* **Focus ring** — 3 px dark orange on light backgrounds, light saffron on navy and on the hero photo.
* **Motion** — the hero's first slide is on screen from the first paint (the heading is the largest text at once); slides fade, nothing slides sideways. Both auto-advancing
  sliders (hero, featured initiatives) have a Pause / Play button (WCAG 2.2.2). With "reduce motion" on nothing moves — no sliding, growing or bouncing, entrances
  become plain fades — and the sliders do not play until the visitor presses Play.
* **Rows that scroll sideways** (filter chips, tabs) fade at the edge where more is waiting and keep the current item in view; the filter chips wrap into rows on wider screens.
* The words on the hero photo were measured against the actual pixels behind them (the worst 5 % of each text box, all four slides, ten screen sizes from a 360 px phone to a 1920 px desktop): all at or above 4.5:1 (3:1 for large text).

Measured on the production build: layout shift 0.000 on every main page; about 198 kB (gzip) of JavaScript for the public site (the admin loads
separately, only at `/admin`); the animation features and the contact form load only when needed; two self-hosted font files (122 kB in all); API answers in a few milliseconds.

---

## 13. Testing

| | How | What it covers |
|---|---|---|
| Backend | `npm test` (140 tests, about 40 s) | sign-in and roles, lock-out, CSRF, password reset; every collection's access rules and the query language; drafts, scheduling and versions; uploads (types, sizes, traversal, replace, delete); Contact form (validation, honeypot, e-mail, attachments); seed completeness; SEO tags, sitemap, redirects, 404; units (query, languages, sanitising, CSV, Payload converter) |
| Backend on MySQL | `TEST_MYSQL_URL=mysql://root@127.0.0.1:3306 npm test` | the same suite on MySQL / MariaDB, a fresh database for every test server (verified on MariaDB 11.4) |
| Browser | `npm run e2e` (start `npm run preview` first) | every address in the sitemap (no console errors, broken images, sideways scroll), real 404s, the Contact form into the inbox; the admin from sign-in through creating, publishing, editing, history, search, bulk delete, photo upload and sign-out — see `e2e/README.md` |
| Static | `npm run lint`, `npm run typecheck` | ESLint (incl. React hooks rules) for both tiers; strict TypeScript for the frontend |

---

## 14. Going live

1. **Database.** MySQL 8 / MariaDB 10.6+ with `utf8mb4` (section 9).
2. **Settings.** In `backend/.env`:
   ```
   NODE_ENV=production
   PUBLIC_URL=https://rohandeshmukh.in
   JWT_SECRET=<48+ random characters>
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=<a password of your own>
   DB_DIALECT=mysql
   DATABASE_URL=mysql://user:password@host:3306/rohan
   TRUST_PROXY=1
   SMTP_HOST=…  SMTP_USER=…  SMTP_PASS=…  EMAIL_FROM=…     # form e-mails + password reset
   ```
   and, if you use them, `RECAPTCHA_SECRET_KEY` (+ `VITE_RECAPTCHA_SITE_KEY` in `frontend/.env` **before building**) and `VITE_GA_ID`.
3. **Build and start**
   ```bash
   npm ci
   npm run build                        # the website → frontend/dist
   NODE_ENV=production npm run seed     # only on a new, empty database: loads the content, creates the first admin
   NODE_ENV=production npm start        # API + website + admin on PORT (default 3001)
   ```
   (On Windows set the variable first, or put `NODE_ENV=production` in `backend/.env`.) Keep the process running with pm2, systemd, your host's Node panel, or a Docker image of your own.
4. **HTTPS and the domain** — put nginx, Caddy or your host's proxy in front, forward everything to the backend, and set `TRUST_PROXY=1`. An nginx example (not part of the tests):
   ```nginx
   server {
     listen 443 ssl http2;
     server_name rohandeshmukh.in;
     client_max_body_size 20m;                       # photo uploads
     location / {
       proxy_pass http://127.0.0.1:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   ```
5. **Check:** `GET /api/health`, open the site, sign in at `/admin`, open `/sitemap.xml`, send a test message from Contact and see it in the inbox.
6. **Updating:** `git pull`, `npm ci`, `npm run build`, restart. Migrations run by themselves. Back up the database and the uploads first.

One address does it all: the backend serves the built website, the admin, the API, `/uploads`, `sitemap.xml` and `robots.txt`.
(Hosting the website on a separate static host is possible too: build with `VITE_API_URL=https://api…`, add the website's address to `CORS_ORIGINS`
and use `COOKIE_SAMESITE=none` with https — but then the search-engine tags are no longer filled in by the backend, so the single-address setup is recommended.)

---

### Deploying Backend on AWS EC2 & Frontend on AWS Amplify

The architecture separates the frontend SPA and the backend API:

#### 1. Backend on AWS EC2
* **Server Setup**: Run `backend/ec2-setup.sh` on your Ubuntu or Amazon Linux EC2 instance to configure Node.js, PM2, and directory permissions.
* **Process Management**: Start with PM2 using `pm2 start backend/ecosystem.config.cjs` (auto-restarts on reboot / crash).
* **Reverse Proxy**: Copy `backend/nginx.conf.example` to `/etc/nginx/sites-available/` to route traffic to port 3001, handle SSL (Let's Encrypt), and enable Gzip & 50MB upload limits.
* **Storage**: Store files locally or use AWS S3 (`STORAGE_DRIVER=s3`, `S3_BUCKET=...`). When an IAM role is attached to the EC2 instance, no AWS credentials in `.env` are required!
* **Environment (`backend/.env`)**: Set `PUBLIC_URL` to your frontend Amplify URL, `CORS_ORIGINS` to allow your frontend, `TRUST_PROXY=1`, and `JWT_SECRET`.

#### 2. Frontend on AWS Amplify
* **Build Settings**: Framework: React / Vite. Build command: `npm run build`, Output directory: `dist` (or `frontend/dist`).
* **Environment Variable**: Set `VITE_API_URL` to your EC2 backend domain (e.g. `https://api.rohandeshmukh.in`).

## 15. Maintenance & troubleshooting

| Problem | What to do |
|---|---|
| **Lost admin password**, no e-mail set up | `npm run admin -- --email you@example.com` prints a new random password (or `--password '…'`); an unknown e-mail is created as a super admin. It also lifts a lock-out and ends old sessions. |
| "Forgot password?" sends nothing | `SMTP_HOST` is empty — the message is only in the backend log. Fill the `SMTP_*` variables. |
| Port 3000 / 3001 busy | Stop the other program (`npm run dev` checks and tells you); or run the backend on another `PORT`. |
| Signed in but every save says *Blocked: this request did not come from the website* | The address in the browser is not `PUBLIC_URL` (or in `CORS_ORIGINS`). Fix `PUBLIC_URL`, restart. |
| Sign-in works on http but not behind HTTPS | Set `PUBLIC_URL=https://…` (the cookie becomes `Secure`) and `TRUST_PROXY=1`, and forward `X-Forwarded-Proto`. |
| A YouTube / Instagram / map embed shows blank | The content-security-policy allows YouTube, Instagram, Facebook, Google Maps and reCAPTCHA; another site must be added in `backend/src/middleware/security.js`. |
| The home page shows "Visit our Facebook page" instead of posts | `FACEBOOK_PAGE_ID` / `FACEBOOK_PAGE_TOKEN` are not set, or the token is no longer valid — see *Facebook posts on the home page* in section 8 and the backend log. |
| Photo upload says the type is not accepted | Only real JPEG, PNG, WebP, GIF, AVIF (photos) and PDF (documents) are accepted; SVG is refused on purpose. Keep nginx's `client_max_body_size` above 15 MB. |
| Content looks old on the live site | The website caches API answers for 60 seconds; the admin clears its own cache on save. Visitors' browsers may keep answers for 30 s. |
| Start fresh | `npm run seed:fresh` deletes **all content** (not users) and loads the bundled content again. Back up first. |
| Add a page | *Pages → New page*: give it a title and an address (e.g. `/about/awards`), add blocks, *Publish*. The menu is edited under *Menu (header)*. |
| Change the logo, phone, e-mail, social links | *Site settings*. |

---

## 16. Coming from the old (Payload) site

The previous site was Next.js + Payload CMS + PostgreSQL. The bundled seed already holds a snapshot of it — every page, post, category, initiative,
event, album, video, office, photo, PDF, the menu, footer, settings, popup and homepage, in both languages, with the same ids, and rich text converted to HTML.

To bring over the **live** content of the old CMS instead of the snapshot:

```bash
cd backend
npm run import:payload -- --url https://cms.rohandeshmukh.in --email you@example.com --password '…'
npm run import:payload -- --from-dir ./dump --media-dir ./old-media      # from JSON dumps of the old API and its photo folder
npm run import:payload -- --help                                         # all options: --snapshot, --fresh, --out
```

**Does not come across:** user accounts (passwords cannot be exported — add the people again under *Users*) and the contact inbox of the old site.

---

## 17. What changed in 2.0

* **New stack:** Next.js + Payload + PostgreSQL → React 19 + Vite frontend, Express + Sequelize backend, SQLite / MySQL; a custom admin panel replaces Payload's.
* **Same site, same content:** the pages, texts, photos and addresses were compared route by route against the old site (text, SEO tags, structure and pixels) — see git history for the details.
* **English only** for now (Marathi texts are kept in the database).
* **Fixes found on the way:** the card slider no longer jumps after a resize when "reduce motion" is on; posts with the same date are ordered newest-first; an editor browsing the site sees a change at once; a server error no longer blocks the next save; empty vs. invalid e-mail on the Contact form; no first admin with the example password in production.
* **Accessibility:** WCAG AA contrast, headings, labels and landmarks (section 12) — the brand orange behind white text is a little darker.
* **New:** version history and restore, scheduled posts, bulk upload with focal point, search in both languages, CSV export, `npm run admin`, MySQL support verified by the test suite, end-to-end browser tests.

# RohanDaDa12
