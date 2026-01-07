# Швидке виправлення помилки "Database schema needs to be updated"

## Крок 1: Відкрийте Supabase Dashboard
Перейдіть на: https://app.supabase.com

## Крок 2: Відкрийте SQL Editor
1. У лівому меню натисніть **"SQL Editor"**
2. Натисніть **"New query"**

## Крок 3: Скопіюйте та виконайте SQL

Скопіюйте весь цей код:

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

-- Видалити стару колонку age
alter table profiles
  drop column if exists age;

-- Додати індекс на username
create index if not exists profiles_username_idx on profiles(username) where username is not null;
```

## Крок 4: Виконайте SQL
1. Вставте код у SQL Editor
2. Натисніть кнопку **"Run"** (або Ctrl+Enter)
3. Переконайтеся, що виконання успішне (має бути повідомлення "Success")

## Крок 5: Перевірте результат
1. Перейдіть в **Table Editor** → `profiles`
2. Перевірте, що з'явилися колонки: `first_name`, `last_name`, `username`, `date_of_birth`, `phone`, `bio`, `location`, `timezone`
3. Переконайтеся, що колонка `age` видалена

## Крок 6: Оновіть сторінку
Натисніть **F5** або **Ctrl+R** (Cmd+R на Mac) для перезавантаження сторінки

## Готово! ✅
Після цього помилка має зникнути, і ви зможете зберігати профіль.

