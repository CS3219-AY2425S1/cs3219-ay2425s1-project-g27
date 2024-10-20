# Question Service Guide

## Setting-up

> :notebook: If you are familiar to MongoDB and wish to use a local instance, please feel free to do so. This guide utilizes MongoDB Cloud Services.

1. In the `question-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. Update the `DB_CLOUD_URI` of the `.env` file, and paste the string we copied earlier in step 4. Also remember to replace the `<password>` placeholder with the actual password.

## Running Question Service

1. You will need to run user service before running question service. Refer to the README in User Service on how to run. 

2. Open Command Line/Terminal and navigate into the `question-service` directory.

3. Run the command: `npm install`. This will install all the necessary dependencies.

4. Run the command `npm start` to start the Question Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

5. Using applications like Postman, you can interact with the Question Service on port 3002. If you wish to change this, please update the `.env` file.

## Question Service API Guide

### Create Question

- Description: This endpoint allows adding a new question to the database.

- HTTP method: `POST`

- Endpoint: `http://localhost:3002/api/questions`

- Body:

  - Required: title (string), description (string), complexity (string), category (Array of strings)
  ```
  {
    "title": "twoSum",
    "description": "<description of twoSum>",
    "complexity": "easy",
    "category": "array"
  }
  ```
- Headers:
  - Required: Authorization: Bearer <JWT_ACCESS_TOKEN>
  - Explanation: This endpoint requires the client to include a JWT (JSON Web Token) in the HTTP request header for authentication and authorization. This token is generated during the authentication process (i.e., login) and contains information about the user's identity. The server verifies this token to ensure that the client is authorized to access the data.
  - Auth Rules:
    - Admin users: Can add questions to the database. The server verifies that the user associated with the JWT token is an admin user and allows access to add a question to the database.
    - Non-admin users: Cannot add a question to the database. The server verifies that the user associated with the JWT token is not an admin user and denies access.

### Fetch All Questions
- Description: This endpoint allows fetching all questions from the database.

- HTTP method: `GET`

- Endpoint: `http://localhost:3002/api/questions`

- Headers:
  - No authentication required.
  - Explanation: This endpoint does not require authentication. It allows public access to retrieve all questions from the database.
 
#### Query Parameters 
- **`page`**: _(Optional)_ The page number for pagination. Default is `1`.
  - Example: `?page=2`
  
- **`limit`**: _(Optional)_ The number of questions to return per page. Default is `10`.
  - Example: `?limit=5`

- **`sort`**: _(Optional)_ The field by which to sort the results. Default is `title`.
  - Example: `?sort=complexity`
  - Supported fields:
    - `title`: Sort by question title.
    - `complexity`: Sort by complexity (e.g., `easy`, `medium`, `hard`).
    - `category`: Sort by question category (if category is an array, it will sort by the first element).
  
- **`order`**: _(Optional)_ The sort order, either `asc` (ascending) or `desc` (descending). Default is `asc`.
  - Example: `?order=desc`

- **`search`**: _(Optional)_ A search term to filter questions based on the title, topic, or difficulty. The search is case-insensitive.
  - Example: `?search=fibonacci`
  - Supported fields:
    - `title`: Searches for questions whose titles contain the search term.
    - `topic`: Searches for questions whose topic contain the search term.
    - `difficulty`: Searches for questions whose difficulty matches the search term.
 
 
### Example Request:
- Search for questions related to `fibonacci`

```
GET http://localhost:3002/api/questions?search=fibonacci
```


- Sort questions by difficulty in descending order
```
GET http://localhost:3002/api/questions?sort=complexity&order=desc
```

- Get the second page of results with 5 questions per page:
```
GET http://localhost:3002/api/questions?page=2&limit=5
```


### Fetch Question by ID
- Description: This endpoint allows fetching a specific question from the database by its ID.

- HTTP method: `GET`

- Endpoint: `http://localhost:3002/api/questions/:id`

- URL Parameters:
  - id (string): The unique identifier of the question to fetch.

- Headers:
  - No authentication required.
  - Explanation: This endpoint does not require authentication and allows public access to retrieve a specific question by its ID.

### Fetch Question by Title
- Description: This endpoint allows fetching a specific question by its title.

- HTTP method: `GET`

- Endpoint: `http://localhost:3002/api/questions/title/:title`

- URL Parameters:
  - title (string): The title of the question to fetch.

- Headers:
  - No authentication required.
  - Explanation: This endpoint does not require authentication. It allows public access to retrieve a specific question by its title.

### Update Question by ID
- Description: This endpoint allows updating an existing question in the database.

- HTTP method: `PUT`

- Endpoint: `http://localhost:3002/api/questions/:id`

- URL Parameters:
  - id (string): The unique identifier of the question to update.

- Body (at least one field required):
  - Optional: title (string), description (string), complexity (string), category (Array of strings)
  ```
  {
    "title": "twoSum",
    "description": "<new description of twoSum>",
    "complexity": "medium",
    "category": "array"
  }
  ```

- Headers:
  - Required: Authorization: Bearer <JWT_ACCESS_TOKEN>
  - Explanation: This endpoint requires the client to include a JWT in the HTTP request header for authentication and authorization. The server verifies that the user associated with the token is authorized to update the question.

- Auth Rules:
  - Admin users: Can update any question in the database.
  - Non-admin users: Cannot update any question. The server verifies that the user associated with the JWT token is not an admin user and denies access.

### Delete Question by ID
- Description: This endpoint allows deleting an existing question from the database.

- HTTP method: `DELETE`

- Endpoint: `http://localhost:3002/api/questions/:id`

- URL Parameters:
  - id (string): The unique identifier of the question to delete.

- Headers:
  - Required: Authorization: Bearer <JWT_ACCESS_TOKEN>
  - Explanation: This endpoint requires the client to include a JWT in the HTTP request header for authentication and authorization. The server verifies that the user associated with the token is authorized to delete the question.

- Auth Rules:
  - Admin users: Can delete any question from the database.
  - Non-admin users: Cannot delete any question. The server verifies that the user associated with the JWT token is not an admin user and denies access.
