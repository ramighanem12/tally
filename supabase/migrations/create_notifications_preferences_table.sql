create table public.notifications_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    document_request boolean default true,
    notice_review boolean default true,
    new_plan_item boolean default true,
    plan_item_action boolean default true,
    new_deduction boolean default true,
    new_tax_credit boolean default true,
    tax_strategy_update boolean default true,
    new_tax_filing boolean default true,
    meetings boolean default true,
    meeting_notes boolean default true,
    service_updates boolean default true,
    new_service boolean default true,
    new_invoice boolean default true,
    connection_sync boolean default true,
    email_frequency text default 'immediate',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.notifications_preferences enable row level security;

-- Policy for selecting own preferences
create policy "Users can view own notification preferences"
    on notifications_preferences for select
    using (auth.uid() = user_id);

-- Policy for inserting own preferences
create policy "Users can insert own notification preferences"
    on notifications_preferences for insert
    with check (auth.uid() = user_id);

-- Policy for updating own preferences
create policy "Users can update own notification preferences"
    on notifications_preferences for update
    using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger handle_updated_at before update on notifications_preferences
    for each row execute procedure moddatetime (updated_at); 