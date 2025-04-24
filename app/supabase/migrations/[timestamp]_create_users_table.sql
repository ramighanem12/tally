-- Create users table
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('Admin', 'Editor', 'Viewer')),
  client_id uuid references clients(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table users enable row level security;

-- Users policies
create policy "Users are viewable by authenticated users"
  on users for select
  to authenticated
  using (true);

create policy "Users can be created by authenticated users"
  on users for insert
  to authenticated
  with check (true);

create policy "Users can be deleted by authenticated users"
  on users for delete
  to authenticated
  using (true);

-- Create indexes
create index users_email_idx on users(email);
create index users_client_id_idx on users(client_id); 