# Інструкція по оновленню бази даних

## Проблема
Якщо ви не бачите нові поля профілю (ім'я, прізвище, username, тощо), це означає, що схема бази даних не оновлена.

## Рішення

### Крок 1: Відкрийте Supabase Dashboard
1. Перейдіть на https://app.supabase.com
2. Виберіть ваш проект
3. Відкрийте **SQL Editor** в лівому меню

### Крок 2: Виконайте міграцію
Скопіюйте та виконайте цей SQL код:

```sql
-- Додати нові колонки
alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists username text unique,
  add column if not exists date_of_birth date,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists location text,
  add column if not exists timezone text;

-- Видалити стару колонку age (вік тепер обчислюється з дати народження)
alter table profiles
  drop column if exists age;

-- Додати індекс на username
create index if not exists profiles_username_idx on profiles(username) where username is not null;
```

### Крок 3: Перевірте результат
1. Перейдіть в **Table Editor** → `profiles`
2. Переконайтеся, що з'явилися нові колонки:
   - `first_name`
   - `last_name`
   - `username`
   - `date_of_birth`
   - `phone`
   - `bio`
   - `location`
   - `timezone`
3. Переконайтеся, що колонка `age` видалена

### Крок 4: Оновіть додаток
1. Перезавантажте сторінку в браузері (Ctrl+R або Cmd+R)
2. Або перезапустіть dev сервер: `npm run dev`

## Альтернативний спосіб (через Table Editor)

Якщо SQL Editor не працює, ви можете додати колонки вручну:

1. Відкрийте **Table Editor** → `profiles`
2. Натисніть на іконку **"..."** біля назви таблиці
3. Виберіть **"Add Column"**
4. Додайте кожну колонку:
   - `first_name` (text, nullable)
   - `last_name` (text, nullable)
   - `username` (text, nullable, unique)
   - `date_of_birth` (date, nullable)
   - `phone` (text, nullable)
   - `bio` (text, nullable)
   - `location` (text, nullable)
   - `timezone` (text, nullable)
5. Видаліть колонку `age` (якщо вона є)

## Перевірка помилок

Якщо після оновлення бази все ще є проблеми:
1. Відкрийте DevTools (F12) → Console
2. Перевірте, чи є помилки
3. Переконайтеся, що всі колонки додані правильно
4. Перезавантажте сторінку

