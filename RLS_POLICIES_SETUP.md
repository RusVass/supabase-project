# Налаштування RLS політик для таблиці profiles

## Що таке RLS (Row Level Security)?

RLS - це механізм безпеки в Supabase, який дозволяє контролювати доступ до даних на рівні рядків. Кожен користувач може бачити та змінювати тільки свої власні дані.

## Крок 1: Відкрийте Supabase Dashboard

1. Перейдіть на https://app.supabase.com
2. Виберіть ваш проект
3. Відкрийте **SQL Editor** в лівому меню
4. Натисніть **"New query"**

## Крок 2: Виконайте SQL для створення політик

Скопіюйте та виконайте весь код з файлу `migrations/rls_policies.sql`:

```sql
-- RLS Policies for profiles table
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
```

## Крок 3: Перевірка

1. Натисніть **"Run"** (або Ctrl+Enter)
2. Переконайтеся, що виконання успішне (має бути повідомлення "Success")
3. Перейдіть в **Authentication** → **Policies** → виберіть таблицю `profiles`
4. Перевірте, що з'явилися 4 політики:
   - Users can view their own profile (SELECT)
   - Users can insert their own profile (INSERT)
   - Users can update their own profile (UPDATE)
   - Users can delete their own profile (DELETE)

## Що роблять ці політики?

### SELECT (читання)
- Користувачі можуть бачити тільки свій власний профіль
- `auth.uid() = user_id` перевіряє, що ID поточного користувача збігається з user_id в профілі

### INSERT (створення)
- Користувачі можуть створювати тільки свій власний профіль
- `with check` гарантує, що user_id в новому профілі = ID поточного користувача

### UPDATE (оновлення)
- Користувачі можуть оновлювати тільки свій власний профіль
- `using` перевіряє доступ до існуючого рядка
- `with check` перевіряє, що після оновлення user_id залишається правильним

### DELETE (видалення)
- Користувачі можуть видаляти тільки свій власний профіль
- `using` перевіряє, що user_id профілю = ID поточного користувача

## Важливо!

- **RLS має бути увімкнено** для таблиці profiles
- Без цих політик користувачі не зможуть працювати зі своїми профілями
- Якщо політики вже існують, ви можете отримати помилку - в такому випадку спочатку видаліть старі політики

## Як видалити старі політики (якщо потрібно)

```sql
-- Видалити всі політики для таблиці profiles
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can delete their own profile" on profiles;
```

## Альтернативний спосіб (через Dashboard)

1. Перейдіть в **Table Editor** → виберіть таблицю `profiles`
2. Натисніть на вкладку **"Policies"**
3. Натисніть **"New Policy"**
4. Виберіть тип операції (SELECT, INSERT, UPDATE, DELETE)
5. Введіть назву політики
6. В полі "Policy definition" введіть:
   - Для SELECT, UPDATE, DELETE: `auth.uid() = user_id`
   - Для INSERT: `auth.uid() = user_id` (в полі "WITH CHECK")
7. Натисніть **"Save"**

Повторіть для кожної операції (SELECT, INSERT, UPDATE, DELETE).

