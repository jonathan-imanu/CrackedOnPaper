# CrackedOnPaper — Project Context (Postgres‑Only Matchmaking)

This document updates the project to use **Postgres only** for matchmaking (no Redis/Lua on the hot path), with PDFs stored in **object storage + CDN**. It adds the minimal schema tweaks, indexes, and SQL you need for **millisecond‑class pairing** and safe Elo resolution under concurrency.

---

## Problem

Getting actionable, crowd-sourced feedback on resumes is hard. Discord communities exist where you can ask for reviews, but there’s no engaging way to see how your resume stacks up against others.

**CrackedOnPaper** shows your resume against another candidate’s in a head-to-head “battle” for users to vote on who is more impressive (“cracked”). Resumes are anonymized and matched by **industry** and **years of experience (YOE)**.

---

## Core Features (MVP)

1. **Resume Upload & Anonymization**

   - Upload PDF/image.
   - Automatic removal of PII (name, email, phone, links).
   - Option to hide company names.

2. **Resume Battle Mode**

   - Side-by-side comparison of two anonymized resumes in the same **industry** & **YOE bracket**.
   - User votes for Resume A or Resume B.
   - Optional “Tie / Can’t decide”.

3. **Elo Ranking & Leaderboards**

   - Elo rating per resume.
   - Leaderboards filtered by **industry** + **YOE**.

4. **Feedback**

   - After voting, optional feedback per resume in that match.
   - Owners can see aggregated feedback.

5. **Auth & Accounts**

   - Supabase Auth.
   - Resumes & stats tied to accounts.

---

## Storage of Resume Files (PDFs)

- **Object storage with CDN** (recommended): Supabase Storage (S3‑compatible), Cloudflare R2, or AWS S3 with a CDN in front.
- **Postgres stores only metadata/URLs**, not binary PDFs.
- Public viewing: use a public bucket + CDN. For private: use signed URLs with short TTL.

**Schema additions** (see below): `pdf_url`, `pdf_storage_key`, `pdf_size_bytes`, `pdf_mime`.

---

## Database Schema (updated)

### `users`

| Column         | Type        | Notes         |
| -------------- | ----------- | ------------- |
| id (PK)        | uuid        |               |
| email          | text        | unique        |
| auth\_provider | text        |               |
| created\_at    | timestamptz | default now() |

### `resumes`

| Column            | Type        | Notes                           |
| ----------------- | ----------- | ------------------------------- |
| id (PK)           | uuid        |                                 |
| owner\_user\_id   | uuid (FK)   | -> users.id                     |
| industry          | text        | e.g., "tech", "finance"         |
| yoe\_bucket       | text        | e.g., "entry", "mid", "senior"  |
| current\_elo\_int | int         | default 1000; integer for speed |
| battles\_count    | int         |                                 |
| last\_matched\_at | timestamptz | null initially                  |
| in\_flight        | bool        | default false                   |
| created\_at       | timestamptz | default now()                   |
| is\_active        | bool        | default true                    |
| pdf\_url          | text        | CDN URL to the rendered PDF     |
| pdf\_storage\_key | text        | key/path in object storage      |
| pdf\_size\_bytes  | bigint      | optional                        |
| pdf\_mime         | text        | default 'application/pdf'       |

> Keep your original `current_elo` numeric if needed for analytics; use `current_elo_int` on the hot path.

### `matches`

| Column                | Type        | Notes                        |            |             |
| --------------------- | ----------- | ---------------------------- | ---------- | ----------- |
| id (PK)               | uuid        |                              |            |             |
| resume\_a\_id (FK)    | uuid        | -> resumes.id                |            |             |
| resume\_b\_id (FK)    | uuid        | -> resumes.id                |            |             |
| industry              | text        | denormalized                 |            |             |
| yoe\_bucket           | text        | denormalized                 |            |             |
| created\_at           | timestamptz |                              |            |             |
| resolved\_at          | timestamptz |                              |            |             |
| winner\_resume\_id    | uuid (FK)   | -> resumes.id                |            |             |
| loser\_resume\_id     | uuid (FK)   | -> resumes.id                |            |             |
| decided\_by\_user\_id | uuid (FK)   | -> users.id (nullable)       |            |             |
| k\_factor\_used       | int         |                              |            |             |
| delta\_a              | int         | Elo delta applied to A (int) |            |             |
| delta\_b              | int         | Elo delta applied to B (int) |            |             |
| state                 | text        | 'created'                    | 'resolved' | 'cancelled' |

### `feedback`

| Column             | Type        | Notes                  |
| ------------------ | ----------- | ---------------------- |
| id (PK)            | uuid        |                        |
| match\_id (FK)     | uuid        | -> matches.id          |
| target\_resume\_id | uuid (FK)   | -> resumes.id          |
| author\_user\_id   | uuid (FK)   | -> users.id (nullable) |
| visibility         | text        | 'owner' or 'public'    |
| text               | text        |                        |
| tags               | text[]      |                        |
| created\_at        | timestamptz |                        |

---

## Indexes (hot path)

```sql
-- Candidates available for pairing in a bucket, ordered by Elo
create index if not exists resumes_bucket_elo_ready_idx
  on resumes (industry, yoe_bucket, current_elo_int, id)
  where is_active and not in_flight;

-- Optional: fairness / least recently matched
create index if not exists resumes_bucket_recent_idx
  on resumes (industry, yoe_bucket, last_matched_at desc)
  where is_active;

-- Prevent duplicate in-flight exact pairs
create unique index if not exists matches_open_pair_unique
  on matches (least(resume_a_id,resume_b_id), greatest(resume_a_id,resume_b_id))
  where state='created';

-- Feedback tags search
create index if not exists feedback_tags_gin on feedback using gin (tags);
```

---

## Pairing Algorithm (Postgres‑only)

**Goal:** select two resumes in the same `(industry, yoe_bucket)` with nearest Elo, avoiding double‑serve. Do it in **one short transaction** with `FOR UPDATE SKIP LOCKED`.

```sql
-- $1 = industry, $2 = yoe_bucket
with seed as (
  select id, current_elo_int
  from resumes
  where industry = $1 and yoe_bucket = $2 and is_active and not in_flight
  order by coalesce(last_matched_at, '-infinity') asc
  limit 1
  for update skip locked
)
, down as (
  select id, current_elo_int
  from resumes
  where industry = $1 and yoe_bucket = $2 and is_active and not in_flight
    and id <> (select id from seed)
    and current_elo_int <= (select current_elo_int from seed)
  order by current_elo_int desc, id
  limit 1
  for update skip locked
)
, up as (
  select id, current_elo_int
  from resumes
  where industry = $1 and yoe_bucket = $2 and is_active and not in_flight
    and id <> (select id from seed)
    and current_elo_int >= (select current_elo_int from seed)
  order by current_elo_int asc, id
  limit 1
  for update skip locked
)
select
  (select id from seed) as seed_id,
  (select current_elo_int from seed) as seed_elo,
  (select id from down) as down_id,
  (select current_elo_int from down) as down_elo,
  (select id from up) as up_id,
  (select current_elo_int from up) as up_elo;
```

**App logic in the same transaction:**

1. Choose closer of `down` vs `up` (if one is null, take the other). If both null → no match.
2. `update resumes set in_flight=true where id in (seed, partner);`
3. Insert `matches` row with `state='created'`.
4. Commit.

**Timeout handling:** background job cancels `state='created'` older than N seconds and sets `in_flight=false` on both resumes.

---

## Match Resolution (Elo update)

- Lock both resume rows in **ID order** to avoid deadlocks:

```sql
begin;
select id, current_elo_int from resumes where id in ($a,$b) order by id for update;
-- compute expecteds/deltas in app (ints); choose K based on battles_count
update resumes
  set current_elo_int = current_elo_int + $delta_a,
      battles_count   = battles_count + 1,
      last_matched_at = now(),
      in_flight       = false
  where id = $a;
update resumes
  set current_elo_int = current_elo_int + $delta_b,
      battles_count   = battles_count + 1,
      last_matched_at = now(),
      in_flight       = false
  where id = $b;
update matches
  set resolved_at = now(),
      winner_resume_id = $winner,
      loser_resume_id  = $loser,
      delta_a = $delta_a,
      delta_b = $delta_b,
      k_factor_used = $k,
      state = 'resolved'
  where id = $match_id;
commit;
```

**K‑factor policy:** start 32; for first 10 matches per resume you may use 40‑48 to speed convergence; taper to 24/16 after 50+ battles.

---

## Leaderboards

**Live query:**

```sql
select id, owner_user_id, current_elo_int, battles_count
from resumes
where industry = $1 and yoe_bucket = $2 and is_active
order by current_elo_int desc, id
limit 100;
```

**Optional materialized view** (refresh periodically or after batches):

```sql
create materialized view if not exists leaderboard as
select industry, yoe_bucket, id as resume_id, current_elo_int, battles_count
from resumes
where is_active
with no data;
create index if not exists leaderboard_bucket_rank_idx
  on leaderboard (industry, yoe_bucket, current_elo_int desc, resume_id);
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
```

---

## API Sketch

- `POST /resumes` → upload; store to object storage; insert row with `pdf_url`.
- `POST /matchmaking?industry=tech&yoe=mid` → returns two resume IDs + URLs; creates `matches(state='created')` and sets `in_flight=true`.
- `POST /matches/{id}/resolve` → body `{winner_resume_id}`; runs transaction above.
- `GET /leaderboards?industry=&yoe=` → top N qu
