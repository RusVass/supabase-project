-- Migration: Add new fields to profiles table
-- Run this in Supabase SQL Editor

-- Add new columns to profiles table
alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists username text unique,
  add column if not exists date_of_birth date,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists timezone text;

-- Remove old age column (age will be calculated from date_of_birth)
alter table profiles
  drop column if exists age;

-- Add index on username for faster lookups
create index if not exists profiles_username_idx on profiles(username) where username is not null;

