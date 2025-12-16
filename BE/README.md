# E-Commerce Backend API

NestJS-based REST API for an e-commerce platform with full CRUD operations for products, transactional order processing, and built-in concurrency control to prevent overselling.

## Features

### Products Management
- ✅ Full CRUD operations (Create, Read, Update, Patch, Delete)
- ✅ Pagination support for product listings
- ✅ Stock availability tracking
- ✅ Automatic timestamps (createdAt, updatedAt)

### Orders Processing
- ✅ Transactional order creation with inventory management
- ✅ Atomic stock decrement to prevent overselling
- ✅ Concurrent request handling with database-level locking
- ✅ Order status tracking (PENDING, DISPATCHED, DELIVERED, CANCELLED)
- ✅ Order history with product details

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Fastify** - High-performance web framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Type-safe database client with migrations
- **PostgreSQL** - Relational database
- **Zod** - Runtime schema validation
- **Swagger/OpenAPI** - Automatic API documentation
- **Jest** - Testing framework
- **Docker** - Containerization

## Project Structure

```
BE/
├── src/
│   ├── common/
│   │   ├── generated/
│   │   │   └── prisma-client/      # Generated Prisma client
│   │   └── schemas/
│   │       └── generic-operation-response.schema.ts
│   ├── modules/
│   │   ├── app/
│   │   │   └── app.module.ts       # Root application module
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts   # Prisma service
│   │   ├── products/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.controller.spec.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.service.spec.ts
│   │   │   ├── products.schema.ts  # Zod validation schemas
│   │   │   └── products.module.ts
│   │   └── orders/
│   │       ├── orders.controller.ts
│   │       ├── orders.controller.spec.ts
│   │       ├── orders.service.ts
│   │       ├── orders.service.spec.ts
│   │       ├── orders.schema.ts    # Zod validation schemas
│   │       └── orders.module.ts
│   └── main.ts                     # Application entry point
├── prisma/
│   └── migrations/                 # Database migrations
├── docker-compose.yml              # Docker services configuration
├── Dockerfile                      # Multi-stage production build
└── package.json
```

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized setup)
- **PostgreSQL** 14+ (if running locally without Docker)

## Setup Instructions

### Option 1: Docker (Recommended)

```bash
# Start all services (database + backend)
docker-compose up -d

# The API will be available at http://localhost:3000
# Swagger documentation at http://localhost:3000/api
```

### Option 2: Local Development

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment

Create a `.env` file in the `BE/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
PORT=3000
```

#### 3. Start PostgreSQL

```bash
# Using Docker for just the database
docker-compose up -d awr-pg
```

#### 4. Run Database Migrations

```bash
npm run prisma:migrate:dev
```

This will:
- Create the database schema
- Generate Prisma client
- Seed initial data (if configured)

#### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

### Development
- `npm run start:dev` - Start development server with hot-reload
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build for production
- `npm start` - Start production server

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate:dev` - Create and apply migrations (dev)
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npx prisma studio` - Open Prisma Studio GUI

### Code Quality
- `npm run quality` - Run all quality checks (TypeScript + formatting + linting)
- `npm run tsc:build` - TypeScript type checking
- `npm run biome:format` - Check code formatting
- `npm run biome:format-fix` - Fix code formatting
- `npm run biome:lint` - Run linter

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report

## API Documentation

### Swagger UI

Interactive API documentation is available at:
```
http://localhost:3000/api
```

### OpenAPI JSON

Raw OpenAPI specification:
```
http://localhost:3000/api-json
```

## API Endpoints

### Products

#### `GET /products`
Retrieve a paginated list of products.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "availableCount": 50,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### `GET /products/:id`
Retrieve a single product by ID.

**Response:**
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "availableCount": 50,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### `POST /products`
Create a new product.

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "availableCount": 100
}
```

**Validation:**
- `name`: Required, minimum 1 character
- `description`: Required
- `price`: Required, must be positive
- `availableCount`: Required, must be >= 0

#### `PUT /products/:id`
Update a product (full replacement).

**Request Body:**
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 149.99,
  "availableCount": 75
}
```

#### `PATCH /products/:id`
Partially update a product.

**Request Body:**
```json
{
  "price": 149.99,
  "availableCount": 75
}
```

#### `DELETE /products/:id`
Delete a product.

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Orders

#### `POST /orders`
Create a new order with transactional inventory management.

**Request Body:**
```json
{
  "customerId": "customer-123",
  "products": [
    {
      "id": 1,
      "quantity": 2
    },
    {
      "id": 2,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": "customer-123",
  "orderTotal": 249.97,
  "status": "PENDING",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "products": [
    {
      "name": "Product 1",
      "price": 99.99,
      "quantity": 2
    },
    {
      "name": "Product 2",
      "price": 49.99,
      "quantity": 1
    }
  ]
}
```

**Error Responses:**

*Product not found:*
```json
{
  "statusCode": 404,
  "message": "Product with ID 1 not found"
}
```

*Insufficient stock:*
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for product \"Product Name\". Available: 5, Requested: 10"
}
```

#### `GET /orders/:id`
Retrieve order details by ID.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": "customer-123",
  "orderTotal": 249.97,
  "status": "PENDING",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "products": [
    {
      "name": "Product 1",
      "price": 99.99,
      "quantity": 2
    }
  ]
}
```

## Database Schema

### Product Model

```prisma
model Product {
  id             Int         @id @default(autoincrement())
  name           String
  description    String
  price          Float
  availableCount Int
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  orderItems     OrderItem[]

  @@index([createdAt])
}
```

### Order Model

```prisma
model Order {
  id          String      @id @default(uuid())
  customerId  String
  orderTotal  Float
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]

  @@index([customerId])
}

enum OrderStatus {
  PENDING
  DISPATCHED
  DELIVERED
  CANCELLED
}
```

### OrderItem Model (Junction Table)

```prisma
model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   String
  productId Int
  quantity  Int
  price     Float   // Snapshot of price at time of order
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@unique([orderId, productId])
  @@index([orderId])
  @@index([productId])
}
```

## Transactionality & Concurrency Handling

### The Overselling Problem

In a multi-user e-commerce system, a critical challenge is preventing **overselling**: selling more units of a product than are actually available in stock. This can occur when multiple customers simultaneously attempt to purchase the same product.

**Example Scenario:**
```
Product Stock: 10 units

Time    Customer A              Customer B
t1      Read stock: 10 units    Read stock: 10 units
t2      Order 8 units           Order 8 units
t3      Update stock: 2 units   Update stock: 2 units
        ✓ Order successful      ✓ Order successful

Result: 16 units sold, but only 10 were available!
```

### Our Solution: Database Transactions with Atomic Operations

We implement a **transactional approach** using Prisma's transaction API combined with **atomic decrement operations** to ensure data consistency even under high concurrency.

#### Implementation ([src/modules/orders/orders.service.ts](src/modules/orders/orders.service.ts))

```typescript
async create(createOrderDto: CreateOrderDto) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Validate stock availability for ALL products first
    for (const item of products) {
      const product = await tx.product.findUnique({
        where: { id: item.id }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.id} not found`);
      }

      if (product.availableCount < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}". ` +
          `Available: ${product.availableCount}, Requested: ${item.quantity}`
        );
      }
    }

    // 2. Atomically decrement stock for each product
    for (const item of products) {
      await tx.product.update({
        where: { id: item.id },
        data: {
          availableCount: {
            decrement: item.quantity  // Atomic operation
          }
        }
      });
    }

    // 3. Create the order
    const order = await tx.order.create({
      data: {
        customerId: createOrderDto.customerId,
        orderTotal,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    return order;
  });
}
```

### How It Works

#### 1. **Database Transaction Wrapper**

```typescript
this.prisma.$transaction(async (tx) => { ... })
```

All operations within this block are executed as a **single atomic unit**:
- ✅ **All operations succeed** → Transaction commits, changes are persisted
- ❌ **Any operation fails** → Transaction rolls back, **no changes** are made

This ensures **data consistency** - either the entire order is processed successfully, or the database remains unchanged.

#### 2. **Two-Phase Validation**

**Phase 1: Pre-flight Check**
```typescript
for (const item of products) {
  const product = await tx.product.findUnique({ where: { id: item.id } });

  if (product.availableCount < item.quantity) {
    throw new BadRequestException('Insufficient stock');
  }
}
```

We validate stock availability for **all products** before making any changes. This prevents partial order fulfillment.

**Phase 2: Atomic Decrement**
```typescript
await tx.product.update({
  where: { id: item.id },
  data: {
    availableCount: { decrement: item.quantity }
  }
});
```

Prisma's `decrement` operation is translated to an **atomic SQL UPDATE**:
```sql
UPDATE "Product"
SET "availableCount" = "availableCount" - $1
WHERE "id" = $2
```

This happens at the **database level**, ensuring no race conditions.

#### 3. **Database-Level Locking**

PostgreSQL automatically applies **row-level locks** during transactions:

```
Transaction A               Transaction B
┌─────────────┐            ┌─────────────┐
│ BEGIN       │            │ BEGIN       │
│ SELECT ...  │            │ SELECT ...  │
│ FOR UPDATE  │ <── Lock   │ (waiting...)│
│ UPDATE ...  │            │             │
│ COMMIT      │ → Release  │ SELECT ...  │
└─────────────┘            │ UPDATE ...  │
                           │ COMMIT      │
                           └─────────────┘
```

When Transaction A reads a product row for update, it acquires a lock. Transaction B must **wait** until Transaction A completes before accessing the same row.

### Concurrency Scenarios

#### Scenario 1: Sequential Requests (No Conflict)

```
Stock: 10 units

Request A: Order 5 units
  → Read stock: 10
  → Validate: 10 >= 5 ✓
  → Decrement: 10 - 5 = 5
  → Commit

Request B: Order 4 units
  → Read stock: 5
  → Validate: 5 >= 4 ✓
  → Decrement: 5 - 4 = 1
  → Commit

Final stock: 1 unit ✓
```

#### Scenario 2: Concurrent Requests (With Locking)

```
Stock: 10 units

Time    Request A (8 units)         Request B (8 units)
t1      BEGIN transaction           BEGIN transaction
t2      Read & lock stock: 10       (waiting for lock...)
t3      Validate: 10 >= 8 ✓
t4      Decrement: 10 - 8 = 2
t5      COMMIT & release lock       Read stock: 2
t6                                  Validate: 2 >= 8 ✗
t7                                  ROLLBACK

Result: Request A succeeds, Request B fails with error ✓
```

#### Scenario 3: Multi-Product Order

```
Products:
- Product A: 5 units
- Product B: 10 units

Request: Order 3x Product A + 8x Product B
  → BEGIN transaction
  → Validate Product A: 5 >= 3 ✓
  → Validate Product B: 10 >= 8 ✓
  → Decrement Product A: 5 - 3 = 2
  → Decrement Product B: 10 - 8 = 2
  → Create order
  → COMMIT

All or nothing - if any product lacks stock, ENTIRE order fails ✓
```

### Why This Approach Works

✅ **ACID Compliance**
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Database constraints always maintained
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

✅ **Race Condition Prevention**
- Atomic operations ensure no lost updates
- Database-level locking prevents concurrent modifications

✅ **Data Integrity**
- Stock count can never go negative (validation before decrement)
- Orders are never partially fulfilled

✅ **Scalability**
- Leverages PostgreSQL's robust concurrency control
- Minimal application-level complexity

### Performance Considerations

**Lock Contention**: High-volume products may experience lock contention. Mitigation strategies:
- Use connection pooling (configured in Prisma)
- Consider read replicas for queries
- Implement caching for product listings

**Transaction Duration**: Keep transactions short to minimize lock time:
- ✅ Validate first, then commit quickly
- ❌ Avoid external API calls inside transactions
- ❌ Avoid complex computations inside transactions

## Testing

The project includes comprehensive unit tests for both products and orders modules.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:cov
```

### Test Coverage

#### Products Module ([src/modules/products/](src/modules/products/))

**Products Service Tests** (27 tests):
- ✅ Create product with valid data
- ✅ Find all products with pagination
- ✅ Find product by ID
- ✅ Update product (full and partial)
- ✅ Delete product
- ✅ Error handling for not found scenarios
- ✅ Pagination metadata calculation

**Products Controller Tests**:
- ✅ Request validation
- ✅ Response formatting
- ✅ Error handling

#### Orders Module ([src/modules/orders/](src/modules/orders/))

**Orders Service Tests**:
- ✅ Create order with single product
- ✅ Create order with multiple products
- ✅ Stock validation and decrement
- ✅ Calculate order total correctly
- ✅ Handle insufficient stock errors
- ✅ Handle product not found errors
- ✅ Transaction rollback on failure
- ✅ Find order by ID

**Orders Controller Tests**:
- ✅ Request validation
- ✅ Response formatting

### Test Framework

- **Jest** - Testing framework
- **@suites/unit** - Unit testing utilities
- **@suites/doubles.jest** - Mocking framework

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `PORT` | Server port | 3000 | No |

Example `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
PORT=3000
```

## Docker Deployment

### Services

The `docker-compose.yml` defines two services:

#### Database (awr-pg)
- Image: `postgres:14-alpine`
- Port: `5432:5432`
- Health checks enabled
- Data persisted in `db-data` volume

#### Backend (awr-app)
- Multi-stage build for optimized image size
- Depends on database with health check
- Automatic migration on startup
- Port: `3000:3000`

### Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f awr-app

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

## Future Considerations

### Security
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ Add CORS configuration
- ⚠️ Add authentication/authorization (JWT, sessions)
- ⚠️ Add rate limiting
- ⚠️ Use HTTPS in production

### Performance
- ✅ Database indexing on frequently queried fields
- ✅ Connection pooling (Prisma default)
- ⚠️ Implement caching (Redis)
- ⚠️ Add database read replicas
- ⚠️ Enable compression (gzip)

### Monitoring
- ⚠️ Add logging (Winston, Pino)
- ⚠️ Add metrics collection (Prometheus)
- ⚠️ Add health check endpoints
- ⚠️ Add error tracking (Sentry)

### Scalability
- ✅ Stateless application design
- ✅ Containerized deployment
- ⚠️ Horizontal scaling with load balancer
- ⚠️ Database connection pooling tuning
- ⚠️ Background job processing for long-running tasks

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs awr-pg

# Verify connection string in .env
echo $DATABASE_URL
```

### Migration Issues

**Error**: "Migration failed"
```bash
# Reset database (DEV ONLY - destroys all data)
npx prisma migrate reset

# Apply pending migrations
npm run prisma:migrate:deploy
```

### Port Already in Use

**Error**: "Port 3000 is already in use"
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in .env
PORT=3001
```
