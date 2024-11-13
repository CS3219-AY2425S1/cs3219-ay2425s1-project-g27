[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)
# CS3219 Project (PeerPrep) - AY2425S1
## Group: G27

## Microservices

- [Collaboration Service](./collaboration-service/README.md)
- [Matching Service](./matching-service/README.md)
- [Question Service](./question-service/README.md)
- [User Service](./user-service/README.md)

## Website
You can access the frontend of our application here: [PeerPrep](https://frontend-855876857500.asia-southeast1.run.app/)


## Running the Project Locally

To build and run the project using Docker, follow these steps:

1. Navigate to the root directory of the project.

2. Build the Docker images without using cache:
   ```bash
   docker compose build --no-cache
   ```

3. Start the Docker containers (add --watch and -d if you want to enable monitoring in detached mode)
   ```bash
   docker compose up --watch -d
   ```
