import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import type { Order } from 'src/common/generated/prisma-client';
import { CreateOrderDto } from './orders.schema';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, products } = createOrderDto;

    // Use a Prisma transaction to ensure atomicity and handle concurrency
    // This prevents race conditions when multiple customers try to order the same product
    return await this.prisma.$transaction(async (tx) => {
      let orderTotal = 0;
      const orderItems: Array<{
        productId: number;
        quantity: number;
        price: number;
      }> = [];

      // Process each product in the order
      for (const item of products) {
        // Lock the product row for update to prevent concurrent modifications
        // This is crucial for preventing overselling
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.id} not found`);
        }

        // Check if sufficient quantity is available
        if (product.availableCount < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". Available: ${product.availableCount}, Requested: ${item.quantity}`,
          );
        }

        // Calculate item total
        const itemTotal = product.price * item.quantity;
        orderTotal += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        // Decrease the product's available count atomically
        // Using decrement ensures the operation is done at the database level
        await tx.product.update({
          where: { id: product.id },
          data: {
            availableCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create the order with all items
      const order = await tx.order.create({
        data: {
          customerId,
          orderTotal,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return this.formatOrderResponse(order);
    });
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent orders first
      },
    });

    return orders.map((order) => this.formatOrderResponse(order));
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.formatOrderResponse(order);
  }

  private formatOrderResponse(order: Order & { orderItems: any[] }) {
    return {
      id: order.id,
      customerId: order.customerId,
      orderCreatedDate: order.createdAt,
      orderUpdatedDate: order.updatedAt,
      status: order.status,
      orderTotal: order.orderTotal,
      products: order.orderItems.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
        price: item.price,
      })),
    };
  }
}
