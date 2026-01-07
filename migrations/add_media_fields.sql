-- Migration: Add media fields to profiles table
-- Run this in Supabase SQL Editor

-- Add media columns to profiles table
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists gallery text[];

