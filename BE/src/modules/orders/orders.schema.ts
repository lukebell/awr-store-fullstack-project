import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const OrderProductItemSchema = z.object({
  id: z.number().int().positive().describe('Product ID'),
  quantity: z.number().int().positive().describe('Quantity to order'),
});

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid().describe('Customer UUID'),
  products: z
    .array(OrderProductItemSchema)
    .min(1)
    .describe('Array of products to order'),
});

export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}

export const OrderItemResponseSchema = z.object({
  id: z.number().int().positive().describe('Product ID'),
  quantity: z.number().int().positive().describe('Quantity ordered'),
  name: z.string().describe('Product name'),
  price: z.number().describe('Price at time of order'),
});

export const OrderResponseSchema = z.object({
  id: z.string().uuid().describe('Order ID'),
  customerId: z.string().uuid().describe('Customer ID'),
  orderCreatedDate: z.coerce.date().describe('Order creation timestamp'),
  orderUpdatedDate: z.coerce.date().describe('Order last updated timestamp'),
  status: z
    .enum(['PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'])
    .describe('Order status'),
  orderTotal: z.number().describe('Total order amount'),
  products: z.array(OrderItemResponseSchema).describe('Ordered products'),
});

export class OrderResponse extends createZodDto(OrderResponseSchema) {}
