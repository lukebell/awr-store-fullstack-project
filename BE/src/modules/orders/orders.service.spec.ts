import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Mocked, TestBed } from '@suites/unit';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('Orders Service Unit Tests', () => {
  let ordersService: OrdersService;
  let prismaService: Mocked<PrismaService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(OrdersService).compile();

    ordersService = unit;
    prismaService = unitRef.get(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with single product', async () => {
      const createOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [
          {
            id: 1,
            quantity: 2,
          },
        ],
      };

      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrder = {
        id: 'f539f7a2-556d-4f22-9138-6065488709c2',
        customerId: createOrderDto.customerId,
        orderTotal: 59.98,
        status: 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [
          {
            id: 1,
            orderId: 'f539f7a2-556d-4f22-9138-6065488709c2',
            productId: 1,
            quantity: 2,
            price: 29.99,
            product: mockProduct,
          },
        ],
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue({
              ...mockProduct,
              availableCount: 8,
            }),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
        };
        return callback(tx);
      });

      prismaService.$transaction = mockTransaction;

      const result = await ordersService.create(createOrderDto);

      expect(result).toEqual({
        id: mockOrder.id,
        customerId: mockOrder.customerId,
        orderCreatedDate: mockOrder.createdAt,
        orderUpdatedDate: mockOrder.updatedAt,
        status: mockOrder.status,
        orderTotal: mockOrder.orderTotal,
        products: [
          {
            id: 1,
            quantity: 2,
            name: 'Test Product',
            price: 29.99,
          },
        ],
      });
    });

    it('should create an order with multiple products', async () => {
      const createOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [
          { id: 1, quantity: 2 },
          { id: 2, quantity: 3 },
        ],
      };

      const mockProduct1 = {
        id: 1,
        name: 'Product 1',
        description: 'Description 1',
        price: 10.0,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProduct2 = {
        id: 2,
        name: 'Product 2',
        description: 'Description 2',
        price: 20.0,
        availableCount: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrder = {
        id: 'order-uuid',
        customerId: createOrderDto.customerId,
        orderTotal: 80.0,
        status: 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [
          {
            id: 1,
            orderId: 'order-uuid',
            productId: 1,
            quantity: 2,
            price: 10.0,
            product: mockProduct1,
          },
          {
            id: 2,
            orderId: 'order-uuid',
            productId: 2,
            quantity: 3,
            price: 20.0,
            product: mockProduct2,
          },
        ],
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        let callCount = 0;
        const tx = {
          product: {
            findUnique: jest.fn().mockImplementation(() => {
              callCount++;
              return callCount === 1
                ? Promise.resolve(mockProduct1)
                : Promise.resolve(mockProduct2);
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
        };
        return callback(tx);
      });

      prismaService.$transaction = mockTransaction;

      const result = await ordersService.create(createOrderDto);

      expect(result.orderTotal).toBe(80.0);
      expect(result.products).toHaveLength(2);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const createOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [{ id: 999, quantity: 1 }],
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      prismaService.$transaction = mockTransaction;

      await expect(ordersService.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(ordersService.create(createOrderDto)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const createOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [{ id: 1, quantity: 100 }],
      };

      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        availableCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
          },
        };
        return callback(tx);
      });

      prismaService.$transaction = mockTransaction;

      await expect(ordersService.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(ordersService.create(createOrderDto)).rejects.toThrow(
        'Insufficient stock for product "Test Product". Available: 5, Requested: 100',
      );
    });

    it('should atomically decrement product availableCount', async () => {
      const createOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [{ id: 1, quantity: 3 }],
      };

      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrder = {
        id: 'order-uuid',
        customerId: createOrderDto.customerId,
        orderTotal: 89.97,
        status: 'PENDING' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [
          {
            id: 1,
            orderId: 'order-uuid',
            productId: 1,
            quantity: 3,
            price: 29.99,
            product: mockProduct,
          },
        ],
      };

      let updateCalled = false;
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockImplementation((args) => {
              updateCalled = true;
              expect(args).toEqual({
                where: { id: 1 },
                data: {
                  availableCount: {
                    decrement: 3,
                  },
                },
              });
              return Promise.resolve({
                ...mockProduct,
                availableCount: 7,
              });
            }),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
        };
        return callback(tx);
      });

      prismaService.$transaction = mockTransaction;

      await ordersService.create(createOrderDto);

      expect(updateCalled).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should retrieve an order by ID', async () => {
      const mockOrder = {
        id: 'f539f7a2-556d-4f22-9138-6065488709c2',
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        orderTotal: 59.98,
        status: 'DISPATCHED' as const,
        createdAt: new Date('2025-04-17T23:50:00.268Z'),
        updatedAt: new Date('2025-04-17T23:50:00.268Z'),
        orderItems: [
          {
            id: 1,
            orderId: 'f539f7a2-556d-4f22-9138-6065488709c2',
            productId: 1,
            quantity: 2,
            price: 29.99,
            product: {
              id: 1,
              name: 'Test Product',
              description: 'Test Description',
              price: 29.99,
              availableCount: 8,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      prismaService.order.findUnique.mockResolvedValueOnce(mockOrder);

      const result = await ordersService.findOne(
        'f539f7a2-556d-4f22-9138-6065488709c2',
      );

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'f539f7a2-556d-4f22-9138-6065488709c2' },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      expect(result).toEqual({
        id: mockOrder.id,
        customerId: mockOrder.customerId,
        orderCreatedDate: mockOrder.createdAt,
        orderUpdatedDate: mockOrder.updatedAt,
        status: mockOrder.status,
        orderTotal: mockOrder.orderTotal,
        products: [
          {
            id: 1,
            quantity: 2,
            name: 'Test Product',
            price: 29.99,
          },
        ],
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      prismaService.order.findUnique.mockResolvedValueOnce(null);

      await expect(ordersService.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
      await expect(ordersService.findOne('non-existent-uuid')).rejects.toThrow(
        'Order with ID non-existent-uuid not found',
      );
    });
  });
});
