# Smart Parking Slot Finder and Management System

Desktop parking management app built with JavaFX + MySQL using a clean architecture style.

## Architecture

- `domain`: entities and repository interfaces (business core)
- `usecase`: application business rules
- `infrastructure`: JDBC implementations and DB config
- `presentation`: JavaFX UI and navigation
- `application`: dependency wiring (`AppConfig`, `AppContext`)

## Features

- Login for `ADMIN` and `USER`
- Driver can view parking slots in grid with color status
- Driver can reserve, release, and cancel reservation
- Admin can add slots and update slot status
- Admin can view all reservations and slot summary
- Parking fee calculated using fixed hourly rate

## Setup

1. Create DB and sample data:
   - Run `db/schema.sql` on your local MySQL.
2. Edit DB settings in `src/main/resources/application.properties`.
3. Run app:

```bash
mvn javafx:run
```

## Default Users

- Admin: `admin` / `admin123`
- User: `user` / `user123`
