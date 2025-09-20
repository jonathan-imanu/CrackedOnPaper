-- --------------------- START OF RESUME RELATED QUERIES -----------------------------------

-- Allocate a free slot (1..3) for an owner -------------------------------
-- name: FindFreeSlotForOwner :one
with slots as (select unnest(array[1,2,3])::smallint as slot)
select s.slot
from slots s
left join app.resumes r
  on r.owner_user_id = $1 and r.slot = s.slot
where r.id is null
order by s.slot
limit 1;

-- Create ----------------------------------------------------------------
-- name: CreateResumeWithSlot :one
insert into app.resumes (
  owner_user_id, slot, name, industry, yoe_bucket,
  pdf_storage_key, pdf_size_bytes, pdf_mime,
  image_key_prefix, page_count, image_ready, in_flight
) values (
  $1, $2, $3, $4, $5,
  $6, $7, coalesce($8, 'application/pdf'),
  $9, coalesce($10, 1), coalesce($11, false),
  '1970-01-01 00:00:00+00'::timestamptz
)
returning *;

-- Read ------------------------------------------------------------------
-- name: GetResumeByID :one
select *
from app.resumes
where id = $1;

-- name: GetResumeByIDForOwner :one
select *
from app.resumes
where id = $1 and owner_user_id = $2;

-- name: ListResumesByOwner :many
select *
from app.resumes
where owner_user_id = $1
order by created_at desc, id
limit $2 offset $3;

-- Update ---------------------------------------------------------------
-- name: UpdateResumeName :one
update app.resumes
set name = $3
where id = $1 and owner_user_id = $2
returning *;

-- name: UpdateResumeBuckets :one
update app.resumes
set industry = $3,
    yoe_bucket = $4
where id = $1 and owner_user_id = $2
returning *;

-- name: UpdateResumePdfMeta :one
update app.resumes
set pdf_storage_key = $3,
    pdf_size_bytes = $4,
    pdf_mime = coalesce($5, pdf_mime)
where id = $1 and owner_user_id = $2
returning *;

-- name: UpdateResumeImageMeta :one
update app.resumes
set image_key_prefix = $3,
    image_ready = coalesce($4, image_ready)
where id = $1 and owner_user_id = $2
returning *;

-- name: SetResumeInFlight :exec
update app.resumes
set in_flight = $3
where id = $1 and owner_user_id = $2;

-- Delete ---------------------------------------------------------------
-- name: DeleteResumeByIDForOwner :exec
delete from app.resumes
where id = $1 and owner_user_id = $2;

-- Convenience ----------------------------------------------------------
-- name: ListOwnerSlots :many
select slot
from app.resumes
where owner_user_id = $1
order by slot;

-- --------------------- END OF RESUME RELATED QUERIES -----------------------------------

-- --------------------- START OF MATCHMAKING RELATED QUERIES ----------------------------

-- Advanced ELO pairing algorithm  
-- name: FindMatchPair :one
with available_count as (
  select count(*) as cnt
  from app.resumes r
  where r.industry = $1 and r.yoe_bucket = $2 and r.in_flight < now() and r.image_ready = true
    and r.id not in (
      select distinct resume_a_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
      union
      select distinct resume_b_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
    )
),
seed as (
  select r.id, r.current_elo_int
  from app.resumes r
  where r.industry = $1 and r.yoe_bucket = $2 and r.in_flight < now() and r.image_ready = true
    and r.id not in (
      select distinct resume_a_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
      union
      select distinct resume_b_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
    )
  order by coalesce(r.last_matched_at, '-infinity'::timestamptz) asc
  limit 1
  for update skip locked
),
down as (
  select r.id, r.current_elo_int
  from app.resumes r
  where r.industry = $1 and r.yoe_bucket = $2 and r.in_flight < now() and r.image_ready = true
    and r.id != (select id from seed)
    and r.current_elo_int <= (select current_elo_int from seed)
    and r.id not in (
      select distinct resume_a_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
      union
      select distinct resume_b_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
    )
  order by r.current_elo_int desc, r.id
  limit 1
  for update skip locked
),
up as (
  select r.id, r.current_elo_int
  from app.resumes r
  where r.industry = $1 and r.yoe_bucket = $2 and r.in_flight < now() and r.image_ready = true
    and r.id != (select id from seed)
    and r.current_elo_int > (select current_elo_int from seed)
    and r.id not in (
      select distinct resume_a_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
      union
      select distinct resume_b_id from app.matches 
      where state = 'created' and skipped = false and created_at > now() - interval '5 minutes'
    )
  order by r.current_elo_int asc, r.id
  limit 1
  for update skip locked
)
select
  case when (select cnt from available_count) >= 2 then (select id from seed) else null end as seed_id,
  case when (select cnt from available_count) >= 2 then (select current_elo_int from seed) else null end as seed_elo,
  case when (select cnt from available_count) >= 2 then (select id from down) else null end as down_id,
  case when (select cnt from available_count) >= 2 then (select current_elo_int from down) else null end as down_elo,
  case when (select cnt from available_count) >= 2 then (select id from up) else null end as up_id,
  case when (select cnt from available_count) >= 2 then (select current_elo_int from up) else null end as up_elo;

-- Mark resumes as in-flight
-- name: SetResumesInFlight :exec
update app.resumes
set in_flight = $2
where id = any($1::uuid[]);

-- Create a new match
-- name: CreateMatch :one
insert into app.matches (
  resume_a_id, resume_b_id, industry, yoe_bucket, state, skipped
) values (
  $1, $2, $3, $4, 'created', false
)
returning *;

-- Get match by ID with resume details (always fetches current stats)
-- name: GetMatchWithResumes :one
select
  m.id as match_id,
  m.resume_a_id,
  m.resume_b_id,
  m.industry,
  m.yoe_bucket,
  m.created_at as match_created_at,
  m.state,
  ra.name as resume_a_name,
  ra.image_key_prefix as resume_a_image_prefix,
  ra.current_elo_int as resume_a_elo,
  ra.battles_count as resume_a_battles,
  rb.name as resume_b_name,
  rb.image_key_prefix as resume_b_image_prefix,
  rb.current_elo_int as resume_b_elo,
  rb.battles_count as resume_b_battles
from app.matches m
join app.resumes ra on m.resume_a_id = ra.id
join app.resumes rb on m.resume_b_id = rb.id
where m.id = $1;

-- Resolve match with Elo updates
-- name: ResolveMatch :one
update app.matches
set resolved_at = now(),
    winner_resume_id = $2,
    loser_resume_id = $3,
    decided_by_user_id = $4,
    delta_a = $5,
    delta_b = $6,
    k_factor_used = $7,
    state = 'resolved'
where id = $1
returning *;

-- Update resume Elo and stats
-- name: UpdateResumeEloStats :exec
update app.resumes
set current_elo_int = $2,
    last_matched_at = now(),
    in_flight = '1970-01-01 00:00:00+00'::timestamptz
where id = $1;

-- Increment battles count for both resumes in a match
-- name: IncrementBattlesForMatch :exec
update app.resumes
set battles_count = battles_count + 1
where id = any($1::uuid[]);

-- Get resumes for Elo calculation (with locking)
-- name: GetResumesForEloUpdate :many
select id, current_elo_int, battles_count
from app.resumes
where id = any($1::uuid[])
order by id
for update;

-- Leaderboard query
-- name: GetLeaderboard :many
select id, name, owner_user_id, industry, yoe_bucket, current_elo_int, battles_count
from app.resumes
where ($1 = '' or industry = $1)
  and ($2 = '' or yoe_bucket = $2)
  and battles_count >= $3
order by current_elo_int desc, id
limit $4 offset $5;

-- Cleanup expired matches
-- name: CancelExpiredMatches :many
update app.matches
set state = 'cancelled'
where state = 'created'
  and created_at < $1
returning resume_a_id, resume_b_id;

-- Skip match
-- name: SkipMatch :exec
update app.matches
set skipped = true
where id = $1;

-- Reset in_flight status for cancelled matches
-- name: ResetInFlightStatus :exec
update app.resumes
set in_flight = '1970-01-01 00:00:00+00'::timestamptz
where id = any($1::uuid[]);

-- Add feedback
-- name: CreateFeedback :one
insert into app.feedback (
  match_id, target_resume_id, author_user_id, visibility, text, tags
) values (
  $1, $2, $3, $4, $5, $6
)
returning *;

-- Get feedback for resume
-- name: GetFeedbackForResume :many
select f.*, m.industry, m.yoe_bucket
from app.feedback f
join app.matches m on f.match_id = m.id
where f.target_resume_id = $1
  and (f.visibility = 'public' or f.author_user_id = $2)
order by f.created_at desc
limit $3 offset $4;

-- --------------------- END OF MATCHMAKING RELATED QUERIES --------------------------