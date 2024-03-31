# Folder Structure Overview

The trading-game repository is structured to organize the codebase efficiently, facilitating easy navigation and maintenance. Here's a breakdown of the primary directories and files:

trading-game/
│
├── src/ # Source code for the application
│ ├── controllers/ # Handles incoming requests and returns responses
│ ├── models/ # Represents data structures and database models
│ ├── repositories/ # Abstraction layer between models and services
│ ├── routes/ # Defines the endpoints and links them to controllers
│ ├── services/ # Business logic and function definitions
│ ├── utils/ # Utility functions and helpers
│ ├── app.js # Registers routes and middlewares
│ └── index.js # Main entry point of the server
│
└── tests/ # Contains test files for the application

## Architecture Overview

The "trading-game" repository features a structured, modular JavaScript codebase designed for maintainability, scalability, and clarity. Below is a succinct overview of its architecture:

### Entry Point

- **`index.js`**: Initializes the server, setting up the application with necessary configurations.

### Application Setup

- **`app.js`**: Configures middleware, registers routes, and initializes the express app.

### Application Layers

- **Routes**: Define endpoints and delegate request handling to the appropriate controllers.
- **Controllers**: Process incoming requests, call services for business logic, and return responses.
- **Services**: Contain the core business logic, interfacing with repositories for data operations.
- **Repositories**: Offer an abstraction layer for database interactions, facilitating CRUD operations.
- **Models**: Represent data structures and schemas, mirroring the database layout.
- **Utilities (`utils`)**: Provide reusable functions and helpers for common tasks.

### Testing

- **Tests**: Ensure functionality and stability through comprehensive tests for each component.

This architecture emphasizes separation of concerns, with each layer focusing on a singular responsibility, making the codebase easier to navigate, develop, and test.

## User API Endpoints Documentation

### 1. User Registration

- **Request Syntax**:

  ```http
  POST /api/users/register
  Content-Type: application/json

  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

#### Description

Registers a new user with an email and password.

#### Feature Supported

User Sign-up

#### Related Tests

- **should validate user input and return 400 for invalid data**

  - Ensures that the input provided by the user meets the required format and criteria. If the validation fails, it returns a `400 Bad Request` response.

- **should register a new user**

  - Validates and processes the registration of a new user. It creates a new user record in the system if all validations pass.

- **should prevent duplicate user registration**
  - Checks if a user already exists with the given email address before processing the registration. If a duplicate is found, it prevents the registration to ensure that each email is associated with only one user.

### 2. User Login

- **Request Syntax**:
  ```http
  POST /api/users/login
  Content-Type: application/json
  ```

{
"email": "user@example.com",
"password": "yourpassword"
}

#### Description

Authenticates a user and returns a token for session management.

#### Feature Supported

User Authentication/Login

#### Related Tests

- **should validate user input and return 400 for invalid data**

  - Verifies that the input provided by the user for authentication is valid. If the data is invalid, it returns a `400 Bad Request` response.

- **should allow a user to log in with correct credentials**

  - Tests the successful login scenario where the user provides correct credentials (email and password), and the system authenticates the user, returning a token for session management.

- **should reject login with unregistered email**

  - Tests the scenario where a user attempts to login with an email address that is not registered in the system. In such cases, the system should reject the login attempt.

- **should reject login with incorrect password**
  - Tests the scenario where a user attempts to login with a registered email but provides an incorrect password. The system should reject the login attempt in such cases.

### 3. User Profile

- **Request Syntax**:
  ```http
  GET /api/users/profile
  Authorization: Bearer <token>
  ```

### Description

Fetches the profile details of the authenticated user.

### Feature Supported

User Profile Viewing

### Related Tests

- **should return the user profile for an authenticated user**

  - Ensures that an authenticated user, who provides a valid token, can successfully retrieve their profile details. This test verifies that the correct user information is returned upon request.

- **should deny access without a valid token**
  - Tests the security measure that denies access to the user profile details if the request does not include a valid authentication token. This ensures that unauthorized access to user profiles is

## Game API Endpoints Documentation

### 1. Create Game

- **Request Syntax**:
  ```http
  POST /api/games/create
  Content-Type: application/json
  Authorization: Bearer <adminToken>
  ```

{
"name": "New Game",
"startTime": "2023-01-01T00:00:00Z",
"endTime": "2023-12-31T00:00:00Z",
"initialAmount": 1000
}

#### Description

Allows an authenticated admin to create a new game with specified parameters.

#### Feature Supported

Game creation by administrators

#### Related Tests

- **"should validate input and create a new game"**
  - This test ensures that the system properly validates the input data for creating a new game. Upon successful validation, it confirms the creation of the game. This process checks for the correctness of the data such as game title, description, release date, and other relevant parameters before proceeding with the creation.

### 2. List Games

- **Request Syntax**:
  ```http
  GET /api/games
  Authorization: Bearer <adminToken>
  ```

#### Description

Retrieves a list of games with pagination support.

#### Feature Supported

Listing of games for user selection

#### Related Tests

- **"should return paginated list of games"**
  - Confirms that games can be listed with pagination, allowing users to navigate through the list of games in a structured manner. This test ensures that the system supports pagination parameters and returns the games list accordingly.

### 3. Single Game Details

- **Request Syntax**:
  ```http
  GET /api/games/:id
  Authorization: Bearer <adminToken>
  ```

#### Description

Fetches details for a specific game by its ID.

#### Feature Supported

Accessing detailed information of a game

#### Related Tests

- **"should get a single game by id"**

  - Verifies that details of a specific game can be retrieved using its ID, ensuring that users can access in-depth information about a game, including its title, description, genre, and any other relevant details.

- **"should return 404 if game not found"**
  - Ensures proper handling of requests for non-existent games by returning a `404 Not Found` response. This test confirms that the system gracefully handles queries for games that do not exist in the database, providing clear feedback to the user.

### 4. Register For Game

- **Request Syntax**:
  ```http
  POST /api/games/:id/register
  Authorization: Bearer <userToken>
  ```

#### Description

Registers a user for a game, enabling them to buy and sell stocks within that game's context.

#### Feature Supported

User registration for game participation

#### Related Tests

- **"should register a user for a game"**

  - Confirms that users can register for a specific game. This test ensures that the registration process adds the user to the game, allowing them to participate in buying and selling stocks within that game's context.

- **"should return 400 if user already registered"**

  - Checks for attempts to register a user more than once for the same game and ensures that the system returns a `400 Bad Request` response in such cases. This prevents duplicate registrations and maintains the integrity of game participation records.

- **"should return 404 if game not found"**
  - Verifies that attempts to register for a non-existent game are properly handled by the system. In cases where the specified game ID does not correspond to any existing game, the system should return a `404 Not Found` response, informing the user that the game they are trying to register for does not exist.

### 5. Buy Stock

- **Request Syntax**:
  ```http
  POST /api/games/:id/buy
  Content-Type: application/json
  Authorization: Bearer <userToken>
  {
  "stockSymbol": "AAPL",
  "quantity": 1
  }
  ```

#### Description

Enables a registered user to buy stocks within the context of a game.

#### Feature Supported

Buying stocks as part of game participation

#### Related Tests

- **"should allow a user to buy stocks within a game"**

  - Tests successful stock purchases by verifying that a registered user can buy stocks within the game using their allocated game funds. This ensures that the system correctly processes transactions and updates both the user's portfolio and their remaining game funds accordingly.

- **"should return 400 if insufficient funds"**
  - Ensures that purchases without sufficient game funds are rejected by the system. This test checks that when a user attempts to buy stocks with a cost exceeding their available game funds, the system returns a `400 Bad Request` response, preventing the transaction from proceeding.

### 6. Sell Stock

- **Request Syntax**:

  ```http
  POST /api/games/:id/sell
  Content-Type: application/json
  Authorization: Bearer <userToken>

  {
  "stockSymbol": "AAPL",
  "quantity": 1
  }
  ```

#### Description

Allows a user to sell stocks within a game, potentially adjusting their available funds within that game.

#### Feature Supported

Selling stocks within the game context

#### Related Tests

- **"should allow a user to sell stocks within a game"**

  - Confirms that users can sell stocks they own within a game. This test ensures that the selling process is functional and correctly updates the user's funds and stock portfolio within the game's context.

- **"should return 400 if trying to sell more stocks than owned"**
  - Checks that attempts to sell more stocks than the user owns are properly rejected. This test verifies that the system accurately tracks the number of stocks a user owns and prevents transactions where the user attempts to sell more stocks than they currently hold, ensuring fair play and consistency within the game.

# Trading-Game Server Setup and Testing Guide

## Prerequisites

- Node.js installed
- MongoDB installed and running

## Setup Instructions

### Clone the Project

```sh
git clone <repository-url>
cd trading-game
```

### Install Dependencies

```sh
npm install
```

### Configure Environment Variables

Create a .env file in the root directory with the following content:

MONGODB_URI=mongodb://127.0.0.1:27017/trading-app
PORT=3000
JWT_SECRET=your_secret_key
APCA_API_KEY_ID=your_api_key_id
APCA_API_SECRET_KEY=your_api_secret_key

### Run the Server in Development Mode

```sh
npm run dev
```

### Run Tests

```sh
npm run test
```
