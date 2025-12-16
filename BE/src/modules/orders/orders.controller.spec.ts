import { Mocked, TestBed } from '@suites/unit';
import { OrdersController } from './orders.controller';
import { CreateOrderDto } from './orders.schema';
import { OrdersService } from './orders.service';

describe('Orders Controller Unit Tests', () => {
  let ordersController: OrdersController;
  let ordersService: Mocked<OrdersService>;

  beforeAll(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(OrdersController).compile();

    ordersController = unit;
    ordersService = unitRef.get(OrdersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [
          {
            id: 1,
            quantity: 2,
          },
          {
            id: 3,
            quantity: 1,
          },
        ],
      };

      const mockOrderResponse = {
        id: 'f539f7a2-556d-4f22-9138-6065488709c2',
        customerId: createOrderDto.customerId,
        orderCreatedDate: new Date('2025-04-17T23:50:00.268Z'),
        orderUpdatedDate: new Date('2025-04-17T23:50:00.268Z'),
        status: 'PENDING' as const,
        orderTotal: 89.97,
        products: [
          {
            id: 1,
            quantity: 2,
            name: 'Product 1',
          },
          {
            id: 3,
            quantity: 1,
            name: 'Product 3',
          },
        ],
      };

      ordersService.create = jest.fn().mockResolvedValue(mockOrderResponse);

      const result = await ordersController.create(createOrderDto);

      expect(ordersService.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrderResponse);
    });

    it('should handle order creation with single product', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        products: [
          {
            id: 5,
            quantity: 10,
          },
        ],
      };

      const mockOrderResponse = {
        id: 'order-uuid',
        customerId: createOrderDto.customerId,
        orderCreatedDate: new Date(),
        orderUpdatedDate: new Date(),
        status: 'PENDING' as const,
        orderTotal: 299.9,
        products: [
          {
            id: 5,
            quantity: 10,
            name: 'Product 5',
          },
        ],
      };

      ordersService.create = jest.fn().mockResolvedValue(mockOrderResponse);

      const result = await ordersController.create(createOrderDto);

      expect(ordersService.create).toHaveBeenCalledWith(createOrderDto);
      expect(result.products).toHaveLength(1);
      expect(result.orderTotal).toBe(299.9);
    });
  });

  describe('findOne', () => {
    it('should retrieve order details by ID', async () => {
      const orderId = 'f539f7a2-556d-4f22-9138-6065488709c2';

      const mockOrderResponse = {
        id: orderId,
        customerId: '7545afc6-c1eb-497a-9a44-4e6ba595b4ab',
        orderCreatedDate: new Date('2025-04-17T23:50:00.268Z'),
        orderUpdatedDate: new Date('2025-04-17T23:50:00.268Z'),
        status: 'DISPATCHED' as const,
        orderTotal: 123.45,
        products: [
          {
            id: 1,
            quantity: 12,
            name: 'Product 1',
          },
          {
            id: 4,
            quantity: 2,
            name: 'Product 4',
          },
        ],
      };

      ordersService.findOne = jest.fn().mockResolvedValue(mockOrderResponse);

      const result = await ordersController.findOne(orderId);

      expect(ordersService.findOne).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrderResponse);
      expect(result.products).toHaveLength(2);
    });

    it('should return order with correct structure', async () => {
      const orderId = 'test-order-uuid';

      const mockOrderResponse = {
        id: orderId,
        customerId: 'customer-uuid',
        orderCreatedDate: new Date(),
        orderUpdatedDate: new Date(),
        status: 'PENDING' as const,
        orderTotal: 50.0,
        products: [
          {
            id: 1,
            quantity: 5,
            name: 'Test Product',
          },
        ],
      };

      ordersService.findOne = jest.fn().mockResolvedValue(mockOrderResponse);

      const result = await ordersController.findOne(orderId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('customerId');
      expect(result).toHaveProperty('orderCreatedDate');
      expect(result).toHaveProperty('orderUpdatedDate');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('orderTotal');
      expect(result).toHaveProperty('products');
      expect(Array.isArray(result.products)).toBe(true);
    });
  });
});
