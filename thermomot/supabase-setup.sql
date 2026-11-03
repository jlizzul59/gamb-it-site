-- Thermomot : base des parties par joueur.
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».

create table if not exists public.games (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  day        text        not null check (day ~ '^\d{4}-\d{2}-\d{2}$'),
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Chaque joueur ne voit et ne modifie que ses propres parties.
alter table public.games enable row level security;

drop policy if exists "lire ses parties" on public.games;
create policy "lire ses parties" on public.games
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "ajouter ses parties" on public.games;
create policy "ajouter ses parties" on public.games
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "modifier ses parties" on public.games;
create policy "modifier ses parties" on public.games
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "supprimer ses parties" on public.games;
create policy "supprimer ses parties" on public.games
  for delete to authenticated using (auth.uid() = user_id);
