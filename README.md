# Supabase Auth Project

React додаток з авторизацією та управлінням профілями користувачів, побудований на Supabase.

## Технології

- **React 19** — UI бібліотека
- **TypeScript** — типізація
- **Vite** — збірка та dev server
- **Supabase** — backend (авторизація, база даних)
- **Tailwind CSS** — стилізація
- **Vitest** — тестування
- **React Testing Library** — тестування компонентів

## Функціональність

### Авторизація
- Реєстрація через email та пароль
- Вхід через email та пароль
- Авторизація через Google OAuth
- Вихід з акаунту
- Автоматичне збереження сесії

### Профіль користувача
- Перегляд профілю
- Редагування віку
- Автоматичне створення профілю при реєстрації
- Збереження даних в Supabase

## Структура проекту

```
src/
├── app/              # Головний компонент додатку
├── features/         # Бізнес-логіка
│   ├── auth/         # Авторизація
│   │   ├── auth.api.ts      # API виклики для auth
│   │   ├── auth.types.ts    # Типи для auth
│   │   └── useAuth.ts       # React хук для auth
│   └── profiles/     # Профілі користувачів
│       ├── profiles.api.ts  # API виклики для профілів
│       ├── profiles.types.ts # Типи для профілів
├── lib/              # Утиліти
│   ├── supabase.ts   # Клієнт Supabase
│   └── utils.ts      # Допоміжні функції
├── pages/            # Сторінки
│   ├── LoginPage.tsx # Сторінка логіну/реєстрації
│   └── ProfilePage.tsx # Сторінка профілю
├── shared/           # Спільні компоненти
│   └── ui/           # UI компоненти
│       ├── Button.tsx
│       └── Input.tsx
└── test/             # Налаштування тестів
    └── setup.ts
```

## Налаштування

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Змінні оточення

Створіть файл `.env.local` в корені проєкту:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Отримайте ці значення з панелі Supabase: **Settings → API**.

### 3. Налаштування бази даних

Створіть таблицю `profiles` в Supabase:

```sql
create table profiles (
  user_id uuid references auth.users primary key,
  email text not null,
  age integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4. Налаштування Google OAuth

1. **Supabase Dashboard:**
   - Authentication → URL Configuration
   - Додайте redirect URLs: `http://localhost:5173` та `http://localhost:5173/**`
   - Authentication → Providers → Google
   - Увімкніть Google провайдер

2. **Google Cloud Console:**
   - Створіть OAuth 2.0 Client ID
   - Додайте Authorized JavaScript origins: `http://localhost:5173`
   - Додайте Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Скопіюйте Client ID та Client Secret в Supabase

## Запуск

### Розробка

```bash
npm run dev
```

Додаток буде доступний на `http://localhost:5173`.

### Збірка

```bash
npm run build
```

### Прев'ю збірки

```bash
npm run preview
```

## Тестування

### Запуск тестів

```bash
# Режим watch
npm test

# Одноразовий запуск
npm run test:run

# UI для перегляду результатів
npm run test:ui
```

### Покриття тестами

- **utils.ts** — тести для функції об'єднання класів
- **Button.tsx** — тести для кнопки (рендеринг, кліки, disabled)
- **Input.tsx** — тести для інпуту (рендеринг, onChange, типи)
- **auth.api.ts** — тести для API авторизації (моки Supabase)

Всього: **27 тестів**

## Лінтинг

```bash
npm run lint
```

## Coding Guidelines

Дивіться [docs/rules/coding-guidelines.md](docs/rules/coding-guidelines.md) для повних правил кодування та кращих практик проекту.

## Основні принципи

- **Простота** — мінімальні залежності, чистий код
- **Типізація** — повна підтримка TypeScript
- **Тестування** — покриття основних функцій
- **Компонентна архітектура** — перевикористання компонентів
- **Feature-based структура** — організація за функціональністю
