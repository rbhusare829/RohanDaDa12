# db/ — the data tier

The website keeps its content in a relational database. Two choices, the same code and the same tables for both:

| | SQLite | MySQL / MariaDB |
|---|---|---|
| For | development, small installs | production |
| Setup | none — a file at `backend/data/rohan.sqlite` is created on first start | a server (below) |
| Backup | automatic nightly copy in production (`backend/backups`) | `mysqldump` or your host's backups |

## MySQL on your computer (Docker)

```bash
docker compose -f db/docker-compose.yml up -d     # MySQL 8.4 on 127.0.0.1:3306, data in the "mysql-data" volume
```

In `backend/.env`:

```
DB_DIALECT=mysql
DATABASE_URL=mysql://rohan:rohan-local-password@localhost:3306/rohan
```

Then `npm run dev`. The tables are created by the migrations at start (`AUTO_MIGRATE=true`); on a new empty database run
`npm run seed` once to load the website content and create the first admin account.

Change the passwords in `docker-compose.yml` (or set `DB_PASSWORD` / `DB_ROOT_PASSWORD` in your shell) for anything that is not your own computer.

## MySQL in production

Any MySQL 8 / MariaDB 10.6+ with `utf8mb4` works (Marathi text and emoji need it). Create an empty database and a user, then set

```
NODE_ENV=production
DB_DIALECT=mysql
DATABASE_URL=mysql://user:password@host:3306/rohan      # or DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
DB_SSL=true                                              # for hosted databases that require TLS
```

and start the backend. Migrations run by themselves at start; `npm run migrate` runs them on demand.

## Backups

```bash
mysqldump --single-transaction --default-character-set=utf8mb4 -u user -p rohan > rohan-$(date +%F).sql
```

Photos and PDFs are not in the database: back up `backend/uploads` (or your S3 bucket) as well.

## Testing against MySQL

The backend's whole test suite can run on MySQL / MariaDB instead of SQLite; every test server gets its own fresh database and drops it afterwards:

```bash
TEST_MYSQL_URL=mysql://root@127.0.0.1:3306 npm test
```
