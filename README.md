# MovieSwipe Backend

A TypeScript backend for the MovieSwipe application.

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── models/          # Database models and TypeScript types
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── test/            # Test setup and utilities
└── index.ts         # Application entry point
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp env.example .env
   ```

3. Update the `.env` file with your configuration

4. Run in development mode:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Environment Variables

See `env.example` for all available environment variables.

## API Endpoints

### Authentication

#### Google Login
- **POST** `/auth/google`
- **Description**: Authenticate user with Google ID token
- **Request Body**:
  ```json
  {
    "idToken": "google-id-token-here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "data": {
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "User Name",
      },
      "token": "jwt-token-here"
    }
  }
  ```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials and create an OAuth 2.0 Client ID
5. Add your application's domain to the authorized origins
6. Copy the Client ID and add it to your `.env` file as `GOOGLE_CLIENT_ID`

## How It Works

1. Frontend authenticates with Google and receives an ID token
2. Frontend sends the ID token to `/auth/google` endpoint
3. Backend verifies the token with Google's servers
4. If valid, backend finds or creates a user in the database
5. Backend returns a JWT token for subsequent API calls

# MovieSwipe API

A RESTful API for movie swiping application with group functionality.

## Features

- Google OAuth authentication
- Group creation and management
- Invitation-based group joining
- JWT token-based authentication

## Group API Endpoints

### Authentication Required
All group endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Create Group
**POST** `/api/groups/`

Create a new group with the authenticated user as the owner.

**Request Body:**
```json
{
  "name": "Movie Night Group"
}
```

**Response:**
```json
{
  "message": "Group created successfully",
  "data": {
    "group": {
      "_id": "group-id",
      "name": "Movie Night Group",
      "owner": "user-id",
      "members": ["user-id"],
      "invitationCode": "ABC12345",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Join Group
**POST** `/api/groups/join`

Join a group using an invitation code.

**Request Body:**
```json
{
  "invitationCode": "ABC12345"
}
```

**Response:**
```json
{
  "message": "Successfully joined group",
  "data": {
    "group": {
      "_id": "group-id",
      "name": "Movie Night Group",
      "owner": "user-id",
      "members": ["user-id", "new-user-id"],
      "invitationCode": "ABC12345",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get User Groups
**GET** `/api/groups/`

Get all groups that the authenticated user is a member of.

**Response:**
```json
{
  "message": "Groups retrieved successfully",
  "data": [
    {
      "_id": "group-id",
      "name": "Movie Night Group",
      "owner": {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": [
        {
          "_id": "user-id",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "invitationCode": "ABC12345",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Group by ID
**GET** `/api/groups/:groupId`

Get a specific group by ID. The user must be a member of the group.

**Response:**
```json
{
  "message": "Group retrieved successfully",
  "data": {
    "_id": "group-id",
    "name": "Movie Night Group",
    "owner": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "_id": "user-id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "invitationCode": "ABC12345",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Group name is required"
}
```

### 401 Unauthorized
```json
{
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. You are not a member of this group."
}
```

### 404 Not Found
```json
{
  "message": "Invalid invitation code"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Group Features

- **Group Owner**: Each group has one owner who created the group
- **Members**: List of users who are part of the group
- **Invitation Code**: Unique 8-character alphanumeric code for joining groups
- **Automatic Owner Membership**: Group owner is automatically added as a member
- **Unique Invitation Codes**: Each group gets a unique invitation code generated automatically

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/movieswipe
MONGODB_URI_TEST=mongodb://localhost:27017/movieswipe-test
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
GOOGLE_CLIENT_ID=your-google-client-id
```

3. Run the application:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

The group functionality includes comprehensive tests for:
- Group creation
- Group joining via invitation codes
- Error handling for invalid data
- Duplicate membership prevention 