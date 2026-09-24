# StarDrop

Кейсы Telegram-подарков + мини-игры + админка.

## Фичи
- Кейсы: NFT, Мишка, MechaGram (логотип)
- Мини-игры: Мины (мин. 5 TON), Ракета, Апгрейдер
- Лидерборд
- Пополнение / вывод по заявкам
- Админ (strepoomich27@gmail.com): заявки + выдача TON/подарков по ID или @username

## Firebase rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
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

## Запуск
cd tg-casino && npx serve .
