# Set authentication endpoint to /auth
_Exported on 7/8/2025 at 17:07:10 PDT from Cursor (1.2.2)_

---

**User**

i want this to be /auth

---

**Cursor**

Currently, the route in `src/routes/auth.ts` is set up as `POST /auth/google` because in your main app file (`src/index.ts`), the router is mounted at `/auth`:

```js
app.use('/auth', authRoutes);
```

This means that the route defined as `router.post('/google', googleAuth);` in your router file is accessible at `/auth/google`.

If you want the route to be just `/auth` (i.e., `POST /auth`), you should change the route definition in `src/routes/auth.ts` from:

```js
router.post('/google', googleAuth);
```

to:

```js
router.post('/', googleAuth);
```

This will make the endpoint accessible at `POST /auth`.

Would you like me to make this change for you?

```javascript
app.use('/auth', authRoutes);
```

```javascript
router.post('/google', googleAuth);
```

```javascript
router.post('/', googleAuth);
```

---

**User**

yes

---

**Cursor**

```typescript
router.post('/', googleAuth);
```

The route has been updated so that authentication is now handled at `POST /auth` instead of `POST /auth/google`. If you need to update any frontend or API documentation to reflect this change, be sure to do so.

Let me know if you need help with anything else!

---

**User**

do it

---

**Cursor**

```typescript
import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

router.use('/auth', authRoutes);

export default router;

```

```typescript
// ... existing code ...
import routes from './routes';
// ... existing code ...
// Routes
// TODO: Move route mounting to src/routes/index.ts for better organization
app.use('/', routes);
// ... existing code ...
```

The route mounting logic has been moved to a new `src/routes/index.ts` file for better organization. Now, all routes (including `/auth`) are managed from this central router, and your main `src/index.ts` imports and uses this new router at the root path.

This structure makes it easier to add more route groups in the future and keeps your main server file clean.

Let me know if you want to add more routes or need further adjustments!

---

**User**

i want to first check to see if any properties of the user is different from googleUserInfo then update it

---

**Cursor**

To ensure the user is only updated if any properties differ from `googleUserInfo`, you should:

1. Compare each relevant property (`name`, `email`, and if you want to add it, `picture`) between the existing user and the incoming Google data.
2. Only update and save the user if at least one property is different.

Currently, your `GoogleUserInfo` does not include `picture`, but your `User` model does. If you want to keep the user's profile picture in sync, you should add `picture` to both the `GoogleUserInfo` interface and the update logic.

Would you like me to:
- Add `picture` to `GoogleUserInfo` and the update logic?
- Update `findOrCreateUser` so it only saves the user if any property is different?

Let me know if you want both, or just the update logic for the current properties!

---

**User**

second one

---

**Cursor**

```typescript
  async findOrCreateUser(googleUserInfo: GoogleUserInfo): Promise<IUser> {
    try {
      let user = await User.findOne({ googleId: googleUserInfo.googleId });

      if (!user) {
        user = new User(googleUserInfo);
        await user.save();
        logger.info(`New user created: ${user.email}`);
      } else {
        let needsUpdate = false;
        if (user.name !== googleUserInfo.name) {
          user.name = googleUserInfo.name;
          needsUpdate = true;
        }
        if (user.email !== googleUserInfo.email) {
          user.email = googleUserInfo.email;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await user.save();
          logger.info(`User updated: ${user.email}`);
        }
      }

      return user;
    } catch (error) {
      logger.error('Error finding/creating user:', error);
      throw new Error('Failed to process user');
    }
  }
```

The `findOrCreateUser` function has been updated so that it will only update and save the user if any properties (`name` or `email`) differ from the incoming `googleUserInfo`. If all properties are the same, no update or save will occur.

Let me know if you need any further changes or want to add more fields to this logic!

---

**User**

Duplicate schema index on {"email":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.

---

**Cursor**

```typescript
// ... existing code ...
// Remove these lines to avoid duplicate index definitions
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });
// ... existing code ...
```

The duplicate index definitions for `email` and `googleId` have been removed from your `User` model. Now, only the index definitions within the schema fields (`unique: true`, `index: true`) are used, which resolves the warning.

You can now restart your server without seeing the duplicate index warning. Let me know if you need anything else!

---

**User**

can u help me with typing req and res of the controller functions

---

**Cursor**

Here’s how you can improve and standardize the typing of `req` and `res` in your controller functions:

### 1. Typing the Request (`req`)
- Extend the `Request` interface from Express to specify the expected body, params, or query types.
- For example, for a request body with a `googleToken`:

```ts
import { Request } from 'express';

export interface GoogleAuthRequest extends Request {
  body: {
    googleToken: string;
  };
}
```

### 2. Typing the Response (`res`)
- Use the generic type parameter of `Response` to specify the response body type.
- For example, for a response with a `message` and optional `data`:

```ts
import { Response } from 'express';
import { AuthResult } from '../services/authService';

export interface GoogleAuthResponse {
  message: string;
  data?: AuthResult;
}
```

### 3. Typing the Controller Function
- Use the custom request and response types in your controller function signature:

```ts
export const googleAuth = async (
  req: GoogleAuthRequest,
  res: Response<GoogleAuthResponse>
) => {
  // ...function logic
};
```

### 4. Return Type
- Controller functions should not return a value (they send responses via `res`), so the return type should be `Promise<void>`, not `Promise<GoogleAuthResponse>`.

### 5. Example (Refactored)
```ts
export const googleAuth = async (
  req: GoogleAuthRequest,
  res: Response<GoogleAuthResponse>
): Promise<void> => {
  // ...function logic
};
```

---

**Summary:**  
- Use `Response<YourResponseType>` for the response.
- Use a custom interface extending `Request` for the request if you want to type `body`, `params`, or `query`.
- The controller function should return `Promise<void>`.

Would you like me to update your `googleAuth` controller to follow this pattern? If you have other controllers, I can help type those as well!

```typescript
import { Request } from 'express';

export interface GoogleAuthRequest extends Request {
  body: {
    googleToken: string;
  };
}
```

```typescript
import { Response } from 'express';
import { AuthResult } from '../services/authService';

export interface GoogleAuthResponse {
  message: string;
  data?: AuthResult;
}
```

```typescript
export const googleAuth = async (
  req: GoogleAuthRequest,
  res: Response<GoogleAuthResponse>
) => {
  // ...function logic
};
```

```typescript
export const googleAuth = async (
  req: GoogleAuthRequest,
  res: Response<GoogleAuthResponse>
): Promise<void> => {
  // ...function logic
};
```

---

**User**

create openapi doc for post /auth/ api

---

**Cursor**

Here is an OpenAPI (Swagger) specification for your `POST /auth/` endpoint, based on your controller and service logic:

```yaml
openapi: 3.0.3
info:
  title: MovieSwipe Auth API
  version: 1.0.0
  description: API for authenticating users with Google ID token

paths:
  /auth/:
    post:
      summary: Authenticate user with Google ID token
      description: Authenticates a user using a Google ID token and returns user info and a JWT token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - googleToken
              properties:
                googleToken:
                  type: string
                  description: Google ID token
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Authentication successful
                  data:
                    type: object
                    properties:
                      user:
                        type: object
                        properties:
                          id:
                            type: string
                            description: User ID
                          email:
                            type: string
                            description: User email
                          name:
                            type: string
                            description: User name
                          picture:
                            type: string
                            description: User profile picture URL
                            nullable: true
                      token:
                        type: string
                        description: JWT token
        '400':
          description: Missing Google ID token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Google ID token is required
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid Google token
        '500':
          description: Internal server error or failed to process user information
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Internal server error
```

**How to use:**
- You can copy this YAML into your OpenAPI documentation file (e.g., `openapi.yaml` or `swagger.yaml`).
- Adjust the `user` properties if your actual response differs (e.g., if you use `_id` instead of `id`, or if `picture` is not included).

Let me know if you want this in JSON format or need OpenAPI docs for other endpoints!

```yaml
openapi: 3.0.3
info:
  title: MovieSwipe Auth API
  version: 1.0.0
  description: API for authenticating users with Google ID token

paths:
  /auth/:
    post:
      summary: Authenticate user with Google ID token
      description: Authenticates a user using a Google ID token and returns user info and a JWT token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - googleToken
              properties:
                googleToken:
                  type: string
                  description: Google ID token
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Authentication successful
                  data:
                    type: object
                    properties:
                      user:
                        type: object
                        properties:
                          id:
                            type: string
                            description: User ID
                          email:
                            type: string
                            description: User email
                          name:
                            type: string
                            description: User name
                          picture:
                            type: string
                            description: User profile picture URL
                            nullable: true
                      token:
                        type: string
                        description: JWT token
        '400':
          description: Missing Google ID token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Google ID token is required
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid Google token
        '500':
          description: Internal server error or failed to process user information
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Internal server error
```

---

**User**

fill the middleware

fill in the authentication middleware

---

**Cursor**

Here’s a standard authentication middleware for Express that checks for a JWT in the `Authorization` header, verifies it, and attaches the user info to the request object. This is commonly used for protecting routes after login.

You’ll need to adjust the payload and secret as per your JWT setup.

```ts
// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    googleId: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      googleId: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

**How to use:**
- Import and use this middleware on any route you want to protect, e.g.:
  ```ts
  import { authenticate } from '../middleware/auth';
  router.get('/protected', authenticate, (req, res) => { ... });
  ```

Let me know if you want a version for role-based access, or if you want to see how to use this in your routes!

```typescript
// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    googleId: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      googleId: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

```typescript
  import { authenticate } from '../middleware/auth';
  router.get('/protected', authenticate, (req, res) => { ... });
```

---

**User**

i also want to have a refresh-token api

---

**Cursor**

To add a `refresh-token` API, you’ll need:

1. **A new route**: `POST /auth/refresh-token`
2. **A controller function**: To validate the refresh token and issue a new access token.
3. **(Optional) Service logic**: To handle refresh token validation and new token generation.

Below are the steps and code snippets to implement this:

---

### 1. Update the Route

Add this to your `src/routes/auth.ts`:

```ts
import { refreshToken } from '../controllers/authController';

// ...existing code...

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh JWT access token using a refresh token
 */
router.post('/refresh-token', refreshToken);
```

---

### 2. Controller Function

Add this to your `src/controllers/authController.ts`:

```ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
```

---

### 3. Service Logic

Add this to your `src/services/authService.ts`:

```ts
public async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
  try {
    // Verify the refresh token
    const payload = jwt.verify(refreshToken, config.JWT_SECRET) as { userId: string; email: string; googleId: string };
    // Optionally, check if the refresh token is in a whitelist or DB

    // Find the user
    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');

    // Generate a new access token
    const token = this.generateJWTToken(user);

    return { token };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
```

---

### 4. OpenAPI Doc Example

```yaml
/auth/refresh-token:
  post:
    summary: Refresh JWT access token
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - refreshToken
            properties:
              refreshToken:
                type: string
    responses:
      '200':
        description: Token refreshed successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                data:
                  type: object
                  properties:
                    token:
                      type: string
      '400':
        description: Refresh token is required
      '401':
        description: Invalid or expired refresh token
```

---

**Note:**  
- For production, you should use a separate secret for refresh tokens, set longer expiry, and store them securely (e.g., in a DB or Redis).
- This example assumes stateless JWT refresh tokens for simplicity.

Would you like me to make these changes in your codebase? If yes, should I also add refresh token generation to your login/auth response?

```typescript
import { refreshToken } from '../controllers/authController';

// ...existing code...

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh JWT access token using a refresh token
 */
router.post('/refresh-token', refreshToken);
```

```typescript
import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
```

```typescript
public async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
  try {
    // Verify the refresh token
    const payload = jwt.verify(refreshToken, config.JWT_SECRET) as { userId: string; email: string; googleId: string };
    // Optionally, check if the refresh token is in a whitelist or DB

    // Find the user
    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');

    // Generate a new access token
    const token = this.generateJWTToken(user);

    return { token };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
```

```yaml
/auth/refresh-token:
  post:
    summary: Refresh JWT access token
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - refreshToken
            properties:
              refreshToken:
                type: string
    responses:
      '200':
        description: Token refreshed successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                data:
                  type: object
                  properties:
                    token:
                      type: string
      '400':
        description: Refresh token is required
      '401':
        description: Invalid or expired refresh token
```

---

**User**

can u generate openapi for auth.ts apis

---

**Cursor**

Certainly! Here is a complete OpenAPI 3.0 YAML specification for the APIs defined in your `auth.ts` routes, including both the login (`POST /auth/`) and refresh token (`POST /auth/refresh-token`) endpoints:

```yaml
openapi: 3.0.3
info:
  title: MovieSwipe Auth API
  version: 1.0.0
  description: API for authenticating users with Google and refreshing JWT tokens

paths:
  /auth/:
    post:
      summary: Authenticate user with Google ID token
      description: Authenticates a user using a Google ID token and returns user info and a JWT token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - googleToken
              properties:
                googleToken:
                  type: string
                  description: Google ID token
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Authentication successful
                  data:
                    type: object
                    properties:
                      user:
                        type: object
                        properties:
                          id:
                            type: string
                            description: User ID
                          email:
                            type: string
                            description: User email
                          name:
                            type: string
                            description: User name
                          picture:
                            type: string
                            description: User profile picture URL
                            nullable: true
                      token:
                        type: string
                        description: JWT token
        '400':
          description: Missing Google ID token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Google ID token is required
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid Google token
        '500':
          description: Internal server error or failed to process user information
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Internal server error

  /auth/refresh-token:
    post:
      summary: Refresh JWT access token
      description: Issues a new JWT access token using a valid refresh token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refreshToken
              properties:
                refreshToken:
                  type: string
                  description: Refresh token
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Token refreshed successfully
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                        description: New JWT access token
        '400':
          description: Refresh token is required
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Refresh token is required
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid or expired refresh token
```

**How to use:**
- Copy this YAML into your OpenAPI/Swagger documentation file.
- Adjust the user properties or response structure if your implementation differs.
- You can add more endpoints as needed in the same format.

Let me know if you want this in JSON format or need OpenAPI docs for other endpoints!

```yaml
openapi: 3.0.3
info:
  title: MovieSwipe Auth API
  version: 1.0.0
  description: API for authenticating users with Google and refreshing JWT tokens

paths:
  /auth/:
    post:
      summary: Authenticate user with Google ID token
      description: Authenticates a user using a Google ID token and returns user info and a JWT token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - googleToken
              properties:
                googleToken:
                  type: string
                  description: Google ID token
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Authentication successful
                  data:
                    type: object
                    properties:
                      user:
                        type: object
                        properties:
                          id:
                            type: string
                            description: User ID
                          email:
                            type: string
                            description: User email
                          name:
                            type: string
                            description: User name
                          picture:
                            type: string
                            description: User profile picture URL
                            nullable: true
                      token:
                        type: string
                        description: JWT token
        '400':
          description: Missing Google ID token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Google ID token is required
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid Google token
        '500':
          description: Internal server error or failed to process user information
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Internal server error

  /auth/refresh-token:
    post:
      summary: Refresh JWT access token
      description: Issues a new JWT access token using a valid refresh token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refreshToken
              properties:
                refreshToken:
                  type: string
                  description: Refresh token
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Token refreshed successfully
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                        description: New JWT access token
        '400':
          description: Refresh token is required
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Refresh token is required
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid or expired refresh token
```

---

**User**

the type of the user is completely wrong

---

**Cursor**

Thank you for pointing that out. Based on your `IUser` interface and schema, the correct user type for your OpenAPI documentation should be:

- `googleId` (string)
- `email` (string)
- `name` (string)
- `createdAt` (string, date-time)
- `updatedAt` (string, date-time)

Here is the corrected user schema for your OpenAPI doc:

```yaml
user:
  type: object
  properties:
    googleId:
      type: string
      description: Google account ID
    email:
      type: string
      description: User email
    name:
      type: string
      description: User name
    createdAt:
      type: string
      format: date-time
      description: User creation timestamp
    updatedAt:
      type: string
      format: date-time
      description: User last update timestamp
```

And here is the corrected response section for your `/auth/` endpoint:

```yaml
/auth/:
  post:
    # ... other OpenAPI fields ...
    responses:
      '200':
        description: Authentication successful
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Authentication successful
                data:
                  type: object
                  properties:
                    user:
                      $ref: '#/components/schemas/user'
                    token:
                      type: string
                      description: JWT token
```

And add this to your `components` section:

```yaml
components:
  schemas:
    user:
      type: object
      properties:
        googleId:
          type: string
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

Let me know if you want the full OpenAPI YAML with this correction, or if you want to add any other fields!

```yaml
user:
  type: object
  properties:
    googleId:
      type: string
      description: Google account ID
    email:
      type: string
      description: User email
    name:
      type: string
      description: User name
    createdAt:
      type: string
      format: date-time
      description: User creation timestamp
    updatedAt:
      type: string
      format: date-time
      description: User last update timestamp
```

```yaml
/auth/:
  post:
    # ... other OpenAPI fields ...
    responses:
      '200':
        description: Authentication successful
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Authentication successful
                data:
                  type: object
                  properties:
                    user:
                      $ref: '#/components/schemas/user'
                    token:
                      type: string
                      description: JWT token
```

```yaml
components:
  schemas:
    user:
      type: object
      properties:
        googleId:
          type: string
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

---

**User**

yes give me the full document

---

**Cursor**

Here is the full OpenAPI 3.0 YAML document for your `auth.ts` APIs, with the correct user type based on your `IUser` interface and schema:

```yaml
openapi: 3.0.3
info:
  title: MovieSwipe Auth API
  version: 1.0.0
  description: API for authenticating users with Google and refreshing JWT tokens

paths:
  /auth/:
    post:
      summary: Authenticate user with Google ID token
      description: Authenticates a user using a Google ID token and returns user info and a JWT token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - googleToken
              properties:
                googleToken:
                  type: string
                  description: Google ID token
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Authentication successful
                  data:
                    type: object
                    properties:
                      user:
                        $ref: '#/components/schemas/User'
                      token:
                        type: string
                        description: JWT token
        '400':
          description: Missing Google ID token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Google ID token is required
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid Google token
        '500':
          description: Internal server error or failed to process user information
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Internal server error

  /auth/refresh-token:
    post:
      summary: Refresh JWT access token
      description: Issues a new JWT access token using a valid refresh token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refreshToken
              properties:
                refreshToken:
                  type: string
                  description: Refresh token
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Token refreshed successfully
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                        description: New JWT access token
        '400':
          description: Refresh token is required
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Refresh token is required
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid or expired refresh token

components:
  schemas:
    User:
      type: object
      properties:
        googleId:
          type: string
          description: Google account ID
        email:
          type: string
          description: User email
        name:
          type: string
          description: User name
        createdAt:
          type: string
          format: date-time
          description: User creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: User last update timestamp
```

You can copy this YAML into your OpenAPI/Swagger documentation file.  
Let me know if you need further adjustments or want to document more endpoints!

```yaml
openapi: 3.0.3
info:
  title: MovieSwipe Auth API
  version: 1.0.0
  description: API for authenticating users with Google and refreshing JWT tokens

paths:
  /auth/:
    post:
      summary: Authenticate user with Google ID token
      description: Authenticates a user using a Google ID token and returns user info and a JWT token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - googleToken
              properties:
                googleToken:
                  type: string
                  description: Google ID token
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Authentication successful
                  data:
                    type: object
                    properties:
                      user:
                        $ref: '#/components/schemas/User'
                      token:
                        type: string
                        description: JWT token
        '400':
          description: Missing Google ID token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Google ID token is required
        '401':
          description: Invalid Google token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid Google token
        '500':
          description: Internal server error or failed to process user information
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Internal server error

  /auth/refresh-token:
    post:
      summary: Refresh JWT access token
      description: Issues a new JWT access token using a valid refresh token.
      tags:
        - Auth
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refreshToken
              properties:
                refreshToken:
                  type: string
                  description: Refresh token
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Token refreshed successfully
                  data:
                    type: object
                    properties:
                      token:
                        type: string
                        description: New JWT access token
        '400':
          description: Refresh token is required
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Refresh token is required
        '401':
          description: Invalid or expired refresh token
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Invalid or expired refresh token

components:
  schemas:
    User:
      type: object
      properties:
        googleId:
          type: string
          description: Google account ID
        email:
          type: string
          description: User email
        name:
          type: string
          description: User name
        createdAt:
          type: string
          format: date-time
          description: User creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: User last update timestamp
```

