-- --------------------- START OF RESUME RELATED QUERIES ----------------------------------------

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
  image_key_prefix, page_count, image_ready
) values (
  $1, $2, $3, $4, $5,
  $6, $7, coalesce($8, 'application/pdf'),
  $9, coalesce($10, 1), coalesce($11, false)
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

-- --------------------- END OF RESUME RELATED QUERIES ----------------------------------------