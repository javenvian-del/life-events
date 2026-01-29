-- 创建 events 表
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  event_date date not null,
  description text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index events_user_id_idx on public.events(user_id);
create index events_event_date_idx on public.events(event_date);

-- 启用行级安全策略 (RLS)
alter table public.events enable row level security;

-- 用户只能查看自己的事件
create policy "Users can view their own events"
  on public.events for select
  using (auth.uid() = user_id);

-- 用户只能插入自己的事件
create policy "Users can insert their own events"
  on public.events for insert
  with check (auth.uid() = user_id);

-- 用户只能更新自己的事件
create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id);

-- 用户只能删除自己的事件
create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- 创建存储桶用于照片
insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true);

-- 设置存储桶策略：用户只能上传自己的照片
create policy "Users can upload their own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'event-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 用户只能查看自己的照片
create policy "Users can view their own photos"
  on storage.objects for select
  using (
    bucket_id = 'event-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 用户只能删除自己的照片
create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'event-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
