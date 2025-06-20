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
        "picture": "https://profile-picture-url.com"
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