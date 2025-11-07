# MySQL Database Connection Setup Guide

## Prerequisites
1. MySQL Workbench installed
2. MySQL Server running
3. Your database schema created in MySQL

## Setup Instructions

### 1. Configure Database Connection

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=peersync
PORT=3001
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Test Database Connection

Start the server to test the connection:

```bash
bun run server
```

Visit `http://localhost:3001/api/health` to check if the database is connected.

### 4. Run Both Frontend and Backend

```bash
# Option 1: Run separately in different terminals
# Terminal 1:
bun run dev

# Terminal 2:
bun run server

# Option 2: Run both together (requires concurrently)
bun add -d concurrently
bun run dev:all
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `GET /api/groups/:id/members` - Get group members
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/members` - Add member to group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/user/:userId` - Get events by user
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Friendships
- `GET /api/friendships/:userId` - Get user's friendships
- `POST /api/friendships` - Create friendship request
- `PUT /api/friendships/:id` - Update friendship status
- `DELETE /api/friendships/:id` - Delete friendship

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications/user/:userId` - Get user's applications
- `GET /api/applications/event/:eventId` - Get applications for event
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Delete application

## Using the API in React Components

Example using React Query:

```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function MyComponent() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.users.getAll
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.userid}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Connection Refused
- Make sure MySQL server is running
- Check if the port 3306 (MySQL) is accessible
- Verify credentials in `.env` file

### Database Not Found
- Create the database in MySQL Workbench:
  ```sql
  CREATE DATABASE peersync;
  ```

### Table Doesn't Exist
- Make sure you've executed your schema SQL in MySQL Workbench
- Run your CREATE TABLE statements

### CORS Issues
- The server is configured with CORS enabled
- If issues persist, check your browser console for specific errors
