# Налаштування Supabase Storage для медіа профілю

## Крок 1: Створити Storage Bucket

1. Відкрийте Supabase Dashboard: https://app.supabase.com
2. Виберіть ваш проект
3. Перейдіть в **Storage** (ліве меню)
4. Натисніть **"New bucket"**
5. Введіть назву: `profiles`
6. Встановіть **Public bucket** (щоб зображення були доступні)
7. Натисніть **"Create bucket"**

## Крок 2: Налаштувати RLS Policies

1. Відкрийте створений bucket `profiles`
2. Перейдіть в **Policies** (вкладка)
3. Натисніть **"New Policy"**

### Policy 1: Дозволити завантаження файлів

```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Дозволити читання файлів

```sql
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
```

### Policy 3: Дозволити видалення власних файлів

```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Крок 3: Оновити схему бази даних

Виконайте SQL міграцію для додавання полів медіа:

```sql
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists gallery text[];
```

Або виконайте файл: `migrations/add_media_fields.sql`

## Крок 4: Перевірка

1. Перезавантажте додаток
2. Спробуйте завантажити аватар
3. Перевірте, що зображення з'являється в Storage bucket

## Структура файлів в Storage

```
profiles/
├── avatars/
│   └── {user_id}/
│       └── {timestamp}-{random}.{ext}
├── covers/
│   └── {user_id}/
│       └── {timestamp}-{random}.{ext}
└── gallery/
    └── {user_id}/
        └── {timestamp}-{random}.{ext}
```

## Обмеження

- **Аватар**: максимум 5MB
- **Обкладинка**: максимум 10MB
- **Галерея**: максимум 10MB на зображення, до 9 зображень
- **Формати**: JPG, PNG, WebP

