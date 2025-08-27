create schema if not exists app;

-- minimal stub for Supabase users table so FK works
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key
);

create table if not exists app.resumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  industry text not null,
  yoe_bucket text not null,
  current_elo_int integer not null default 1000,
  battles_count integer not null default 0,
  last_matched_at timestamptz,
  in_flight boolean not null default false,
  created_at timestamptz not null default now(),
  pdf_storage_key text,
  pdf_size_bytes bigint,
  pdf_mime text not null default 'application/pdf',
  image_key_prefix text,
  page_count smallint not null default 1 check (page_count between 1 and 2),
  image_ready boolean not null default false,
  slot smallint not null check (slot between 1 and 3),
  constraint resumes_industry_nonempty check (length(trim(industry)) > 0),
  constraint resumes_yoe_nonempty check (length(trim(yoe_bucket)) > 0)
);

create table if not exists app.matches (
  id uuid primary key default gen_random_uuid(),
  resume_a_id uuid not null references app.resumes(id) on delete cascade,
  resume_b_id uuid not null references app.resumes(id) on delete cascade,
  industry text not null,
  yoe_bucket text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  winner_resume_id uuid references app.resumes(id),
  loser_resume_id uuid references app.resumes(id),
  decided_by_user_id uuid references auth.users(id),
  k_factor_used integer,
  delta_a integer,
  delta_b integer,
  state text not null default 'created' check (state in ('created', 'resolved', 'cancelled')),

  constraint matches_different_resumes check (resume_a_id != resume_b_id),
  constraint matches_winner_is_participant check (
    winner_resume_id is null or
    winner_resume_id = resume_a_id or
    winner_resume_id = resume_b_id
  ),
  constraint matches_loser_is_participant check (
    loser_resume_id is null or
    loser_resume_id = resume_a_id or
    loser_resume_id = resume_b_id
  ),
  constraint matches_resolved_logic check (
    (state = 'resolved' and resolved_at is not null and winner_resume_id is not null and loser_resume_id is not null) or
    (state != 'resolved')
  )
);

create table if not exists app.feedback (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references app.matches(id) on delete cascade,
  target_resume_id uuid not null references app.resumes(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete set null,
  visibility text not null default 'owner' check (visibility in ('owner', 'public')),
  text text not null,
  tags text[] default '{}',
  created_at timestamptz not null default now(),

  constraint feedback_text_not_empty check (length(trim(text)) > 0)
  -- Note: feedback_target_in_match constraint removed due to PostgreSQL subquery limitation
  -- This validation should be handled in application code
);

create index if not exists resumes_bucket_elo_ready_idx
  on app.resumes (industry, yoe_bucket, current_elo_int, id)
  where in_flight = false;

create index if not exists resumes_bucket_recent_idx
  on app.resumes (industry, yoe_bucket, last_matched_at desc nulls last)
  where in_flight = false;

create unique index if not exists matches_open_pair_unique
  on app.matches (least(resume_a_id, resume_b_id), greatest(resume_a_id, resume_b_id))
  where state = 'created';

create index if not exists matches_state_created_idx
  on app.matches (state, created_at)
  where state = 'created';

create index if not exists matches_resume_history_idx
  on app.matches (resume_a_id, resume_b_id, resolved_at);

create index if not exists feedback_match_idx
  on app.feedback (match_id);

create index if not exists feedback_target_resume_idx
  on app.feedback (target_resume_id);

create index if not exists feedback_tags_gin
  on app.feedback using gin (tags);
