# Backend Project

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [Submission Guidelines](#submission-guidelines)
- [Getting Started](#getting-started)
- [Stage 1 – Products API](#stage-1--products-api)
- [Stage 2 – Orders & Relational Modeling](#stage-2--orders--relational-modeling)
- [The End](#the-end-of-the-backend-task)

---

## Overview

This take-home project is designed to evaluate your backend engineering skills across multiple dimensions:

- General API design
- Data modeling and validation
- Concurrency and transactional safety

### Focus on the Required Stages:
The core task involves completing the first two stages:

1. Products CRUD (Required)
2. Orders & Relational Modeling (Required)

We estimate completing these required stages might take 6 hours. Please prioritize quality, thoughtful design, clean code, and clear documentation of assumptions or trade-offs over speed.

## Tech Stack

This project is preconfigured with:

- [NestJS](https://docs.nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [PostgreSQL](https://www.postgresql.org/) via Docker
- [Biome](https://biomejs.dev/) for both linting and formatting

> ✅ You may replace any of these with another TS-based framework/ORM/validator—just:
> 1. Stay in TypeScript
> 2. Keep all services in `docker-compose.yml`
> 3. Honor the existing Biome rules to ease the review process.

Otherwise, you’re encouraged to leverage the full power of this stack (and/or any additional safe dependencies) to deliver a clean, efficient, and maintainable solution.

---

## Project Setup

Your repository should come with the following:

- A [NestJS](https://docs.nestjs.com/) project scaffold with 3 modules: `app`, `prisma`, and `products`.
- `tsconfig.json`, `package.json`
- [Prisma](https://www.prisma.io/docs) schema and initial database migration file
- `docker-compose.yml` for PostgreSQL
- Basic linting and formatting configuration defined in `biome.json`

```bash
# 4 steps to get started:
# Install project dependencies
npm install

# Start Postgres
docker compose up -d

# Apply migrations & generate Prisma client/typings.
# Generated client & TS types will be located in:
# src/common/generated/prisma-client
npm run prisma:migrate:dev

# Start dev server
npm run start:dev

```

Once running, view the API spec at http://localhost:3000/api.

---

## Submission Guidelines

Ensure your submission includes:

1. A clear `README.md` with setup instructions.
2. Containerization via `Dockerfile` and `docker-compose.yml` (verify `docker-compose up` launches both the database AND application).
3. All Prisma migration files (or equivalent).

### What We’re Looking For
- Clean, modular code
- Robust validation & error handling
- Safe transactions
- Clear README & assumptions

---

## Getting Started

We're building a basic online store 🏪!

In this project, you'll architect and implement services that power online shopping experiences. Your challenge is to build a robust, scalable API ecosystem that supports the full lifecycle of e-commerce operations:

* Product Management: Enable the creation, discovery, and administration of the store's inventory
* Order Processing: Handle customer purchases with transactional integrity and inventory management


---

## Stage 1 – Products API

Let’s begin by building the foundation for our product catalog.

The goal of this stage is to provide a way to manage the products that our store will offer for purchase. Begin by modeling and implementing the necessary HTTP endpoints to *create* and *read* products in our store.

### Requirements

Implement the following endpoints to support the `Product` resource. The schema of `Product` has been pre-defined within the `schema.prisma` file.

#### Required Endpoints

- `POST /products` – Creates a new product:
  - A very basic implementation has been pre-created as a starting point ✅ 🥳
- `GET /products` - Retrieve a list containing all existing products.
  - Pagination support is not required.

---

## Stage 2 – Orders & Relational Modeling

Now that we can create and manage our product listings, we will move on to the next feature: allowing customers to place an order. For the purpose of this project, we will not model or implement the customer's "Shopping Cart" but rather simply expose a few endpoints to place an order and to retrieve order details.

### Requirements

Define an `Order` resource. An order must contains one or more products. When the order is placed, each requested product in the order reduces the the product's `availableCount` by the ordered quantity.

To place a new order, a user will perform a `POST` request to `/orders` with a JSON payload of the following shape:
```json
  {
    "customerId": "7545afc6-c1eb-497a-9a44-4e6ba595b4ab",
    "products": [
      {
        "id": 1,
        "quantity": 1
      },
      {
        "id": 12,
        "quantity": 4
      },
    ]
  }
```
Where:
- `customerId` can just be any uuid for our use case.
- `products` can contain one or more objects with properties
  - `id`: The product id
  - `quantity`: The quantity of the product being ordered

#### Notes on order placement:

In the database, be sure to also record the order creation date and order last updated date. Both of these timestamp values can be set to the time that the order was placed. Additionally, the order total should be computed and stored in the table.

A user may also retrieve the details of a successfully placed order by performing a `GET` request to `orders/{id}` where `{id}` is the unique order identifier. The response shape of this endpoint should look something like the following:
```json
{
  "id": "f539f7a2-556d-4f22-9138-6065488709c2",
  "customerId": "7545afc6-c1eb-497a-9a44-4e6ba595b4ab",
  "orderCreatedDate": "2025-04-17T23:50:00.268Z",
  "orderUpdatedDate": "2025-04-17T23:50:00.268Z",
  "status": "DISPATCHED",
  "orderTotal": 123.45,
  "products": [
    {
      "id": 1,
      "quantity": 12,
      "name": "Product 1"
    },
    {
      "id": 4,
      "quantity": 2,
      "name": "Product 4"
    }
  ]
}
```

## The End of the Backend Task

Thank you for investing your time and energy into this project 🙏! A few final notes:

- **Next Steps:**
  Once you’re ready, please share your repository link with us. We’ll review your submission and aim to get back to you within one week with feedback and any follow-up questions.

- **Questions & Clarifications:**
  If anything was unclear or you’d like to discuss trade-offs in your approach, feel free to annotate your code and we can review them during the follow up session.

- **What We Value:**
  We look for clean, well-structured code, thoughtful error handling, clear documentation, and pragmatic decisions.

- **Good Luck!**
  We appreciate the effort you’re putting in and look forward to seeing your solution. If you run into any blockers, just let us know.

Happy coding! 🚀
