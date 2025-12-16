# Frontend Project

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [Submission Guidelines](#submission-guidelines)
- [Getting Started](#getting-started)
- [Stage 1 – Product Catalog & Admin UI](#stage-1--product-catalog--admin-ui)
- [Stage 2 – Checkout & Order Confirmation](#stage-2--checkout--order-confirmation)
- [The End](#the-end-of-the-frontend-task)

---

## Overview

This take-home project is designed to evaluate your frontend engineering skills across multiple dimensions:

- General UI/UX implementation
- Component-based architecture
- API consumption and data handling
- Client-side state management
- Asynchronous logic and error handling
- Clean, maintainable code

### Focus on the Required Stages:
The core task involves completing the first two stages:

1. Products CRUD (Required)
2. Orders & Relational Modeling (Required)

You should not spend more than 8-10 hours in this task. If you do not finish everything in that time, it's not a problem. We will still discuss your approach. Please prioritize quality, thoughtful design, clean code, and clear documentation of assumptions or trade-offs over speed.

## Tech Stack

We recommend you build this project with a modern component-based framework.

Framework: React.

Language: TypeScript

Styling: Your choice.

State Management: Your choice.

✅ You have the freedom to choose your tools, but please:

Use a modern JavaScript framework.

Ensure your project is runnable with clear README.md instructions.

---

## Project Setup

Please note: No project setup is offered for the frontend.

You are responsible for structuring your own project from scratch using your preferred tools.

### Backend API

This frontend project must consume the backend API from the other task. You should assume the backend server is running and available at: http://localhost:3000

All API requests (e.g., to `/products` or `/orders`) should be made to this base URL.

---

## Submission Guidelines

Ensure your submission includes:

1. A clear `README.md` with setup instructions.
2. All source code required to run the application.


### What We’re Looking For
- Clean, modular components
- Effective state management (especially for the cart)
- Robust loading and error handling (what happens if an API call fails?)
- A functional, clean, and intuitive user interface

---

## Getting Started

We're building the UI for our basic online store 🏪!

In this project, you'll build the client-side application that consumes our new e-commerce API. Your challenge is to build a functional and responsive UI that supports the core e-commerce operations:

Product Discovery: Allow customers to browse the store's inventory.

Product Management: Allow an admin to add new products.

Order Processing: Allow customers to place an order and view their confirmation.

---

## Stage 1 – Product Catalog & Admin UI

Let’s begin by building the interfaces for browsing and managing products.

The goal of this stage is to consume the Product API to display products to customers and allow an admin to create new products.

### Requirements

Implement the following UI components and views based on the available backend endpoints.

#### Required Views

- Customer: Shop Page (`/`)
  - Endpoint: Consumes `GET /products`.
  - Goal: Display a list or grid of all available products.
  - Each product item must display (at minimum) its name and price.
  - Each product item must have an "Add to Cart" button to be used in Stage 2.

- Admin: Product Dashboard (`/admin`)
  - Endpoint: Consumes `GET /products`.
  - Goal: Display a simple table or list of all products (similar to the customer view, but for "management").
  - This page should have a clear link or button to "Create New Product."

- Admin: Create Product Form (`/admin/new`)
  - Endpoint: Consumes `POST /products`.
  - Goal: Display a form that allows an admin to create a new product.
  - The form should include fields for `name`, `description`, `price`, and `availableCount`.
  - On successful submission, the admin should be redirected back to the Product Dashboard (`/admin`).

---

## Stage 2 – Checkout & Order Confirmation

Now that users can see products, let's allow them to place an order.

### Requirements

You must implement a client-side shopping cart and checkout flow.

1. Local Shopping Cart

  - Requirement: Since the BE does not have a "Cart" endpoint, you must implement a client-side shopping cart.
  - Use local state management (e.g., React Context, Redux) to store the items a user adds.
  - The "Add to Cart" button from Stage 1 should add the product `id` and `quantity` to this state.
  - Create a "Cart" component (e.g., a modal, a sidebar, or a separate `/cart` page) that shows all items, their quantities, and a total price.

2. Order Placement

  - Endpoint: Consumes `POST /orders`.
  - Requirement: The Cart component must have a "Place Order" button.
  - When clicked, you must format the cart's state into the JSON payload shape required by the backend:

  ```json
  {
      "customerId": "7545afc6-c1eb-497a-9a44-4e6ba595b4ab", // Can be hard-coded
      "products": [
        { "id": 1, "quantity": 1 },
        { "id": 12, "quantity": 4 }
      ]
    }
  ```
  - Handle loading states and any potential errors from the API (e.g., "Out of Stock").

3. Order Confirmation Page
  - Endpoint: Consumes `GET /orders/:id`.
  - Requirement: After a `POST /orders` request is successful, the backend will return the new order.
  - You must redirect the user to a dynamic "Order Confirmation" page (e.g., `/orders/{id}`).
  - This page must then fetch the order details from `GET /orders/:id` and display them to the user, matching the response shape:

  ```json
  {
    "id": "f539f7a2-556d-4f22-9138-6065488709c2",
    "customerId": "7545afc6-c1eb-497a-9a44-4e6ba595b4ab",
    "orderCreatedDate": "2025-04-17T23:50:00.268Z",
    "orderUpdatedDate": "2025-04-17T23:50:00.268Z",
    "status": "DISPATCHED",
    "orderTotal": 123.45,
    "products": [
      { "id": 1, "quantity": 12, "name": "Product 1" },
      { "id": 4, "quantity": 2, "name": "Product 4" }
    ]
  }
  ```

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

## The End of the Frontend Task

Thank you for investing your time and energy into this project 🙏! A few final notes:

- **Next Steps:**
  Once you’re ready, please share your repository link with us. We’ll review your submission and aim to get back to you within one week.

- **Questions & Clarifications:**
  If anything was unclear or you’d like to discuss trade-offs in your approach, feel free to add notes to your README.md and we can review them.

- **What We Value:**
  We look for clean, well-structured components, thoughtful state management, a fair user experience (including error/loading states), and pragmatic decisions.

- **Good Luck!**
  We appreciate the effort you’re putting in and look forward to seeing your solution. If you run into any blockers, just let us know.

Happy coding! 🚀
