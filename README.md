# StarDrop — Telegram Gifts Case Opening

Сайт кейсов (как MusorDrop / 1GIFT) для Telegram-подарков, звёзд и NFT.

## Что есть

- Регистрация: **Email + пароль + Telegram @username**
- Числовой **ID** аккаунта
- Баланс в **TON**
- 3 кейса: NFT / Мишка / MechaGram (низкие шансы на NFT)
- **Пополнение по заявке** — пользователь создаёт заявку, админ одобряет и начисляет TON
- **Вывод по заявке** — баланс или предмет из инвентаря; админ пишет человеку в TG и выдаёт
- **Админ-панель** для `strepoomich27@gmail.com`
  - Список заявок на пополнение
  - Список заявок на вывод
  - Кнопки: Одобрить / Отклонить / Выдано

## Как работает админка

1. Зарегистрируйся / войди с почты **strepoomich27@gmail.com**
2. В навигации появится вкладка **Админка**
3. **Пополнения**:
   - «Одобрить» → TON сразу начисляются пользователю
   - «Отклонить» → заявка закрывается
4. **Выводы**:
   - При создании заявки баланс/предмет уже «заморожены» (списаны)
   - «Одобрить» → статус «одобрено» (ты идёшь писать человеку в TG)
   - «Выдано / Переведено» → финальный статус
   - «Отклонить (вернуть)» → баланс или предмет возвращаются пользователю

Админ видит `@username`, числовой ID и email — чтобы написать человеку в Telegram и выдать товар / подтвердить оплату.

## Firebase

В Console проекта `novus-roleplay`:

1. **Authentication** → Email/Password — включить
2. **Firestore** — создать базу
3. Правила (для демо; в проде ужесточить):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /deposit_requests/{id} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
    }
    match /withdraw_requests/{id} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
    }
  }
}
```

Если Firestore попросит индекс для orderBy + where — создай по подсказке в консоли браузера.

## Запуск

```bash
cd tg-casino
npx serve .
# или python -m http.server 8080
```

## Важно

- Демо-логика на клиенте. Для продакшена — серверные роллы.
- Выдача подарков TG вручную: админ пишет пользователю в Telegram.
- Админ-почта: strepoomich27@gmail.com
