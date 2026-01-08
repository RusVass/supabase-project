-- RLS Policies for profiles table
-- Run this in Supabase SQL Editor
-- This enables Row Level Security and creates policies for SELECT, INSERT, UPDATE, and DELETE

-- Step 1: Enable RLS on profiles table
alter table profiles enable row level security;

-- Step 2: Policy for SELECT - Users can view their own profile
create policy "Users can view their own profile"
on profiles
for select
to authenticated
using (auth.uid() = user_id);

-- Step 3: Policy for INSERT - Users can create their own profile
create policy "Users can insert their own profile"
on profiles
for insert
to authenticated
with check (auth.uid() = user_id);

-- Step 4: Policy for UPDATE - Users can update their own profile
create policy "Users can update their own profile"
on profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Step 5: Policy for DELETE - Users can delete their own profile
create policy "Users can delete their own profile"
on profiles
for delete
to authenticated
using (auth.uid() = user_id);

