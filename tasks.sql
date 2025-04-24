-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text not null default 'Not Started',
  due_date timestamp with time zone not null,
  assignee text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row
  execute function handle_updated_at();

-- Create policies
-- Allow users to select their own tasks
create policy "Users can view their own tasks"
  on public.tasks
  for select
  using (auth.uid() = created_by);

-- Allow users to insert their own tasks
create policy "Users can insert their own tasks"
  on public.tasks
  for insert
  with check (auth.uid() = created_by);

-- Allow users to update their own tasks
create policy "Users can update their own tasks"
  on public.tasks
  for update
  using (auth.uid() = created_by);

-- Allow users to delete their own tasks
create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  using (auth.uid() = created_by); 