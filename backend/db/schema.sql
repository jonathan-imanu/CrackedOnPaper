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