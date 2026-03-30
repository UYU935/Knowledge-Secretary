-- ============================================
-- 経験知識帳 Supabase スキーマ
-- Supabase SQL Editorで実行してください
-- ============================================

-- genres テーブル
create table if not exists genres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- entries テーブル
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  genre_id uuid references genres(id) on delete set null,
  title text not null,
  category text check (category in ('成功','失敗','気づき','その他')),
  summary text,
  lesson text,
  book_note text,
  tags text[],
  raw_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at
  before update on entries
  for each row execute function update_updated_at();

-- full-text search インデックス（日本語）
create index if not exists entries_fts
  on entries using gin(
    to_tsvector('simple',
      coalesce(title, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(lesson, '') || ' ' ||
      coalesce(book_note, '')
    )
  );

-- tags 用の GIN インデックス（配列検索）
create index if not exists entries_tags
  on entries using gin(tags);

-- genres 初期データ
insert into genres (name, slug, icon, sort_order) values
  ('医療', 'medical', '🏥', 1),
  ('投資', 'investment', '📈', 2),
  ('IT', 'it', '💻', 3),
  ('株式会社', 'startup', '🏢', 4),
  ('学び', 'learning', '📚', 5),
  ('人間関係', 'relationship', '🤝', 6),
  ('家庭', 'family', '🏠', 7)
on conflict (slug) do nothing;

-- RLS（Row Level Security）を無効化（個人用のため）
-- 必要に応じて有効化してください
alter table genres disable row level security;
alter table entries disable row level security;
