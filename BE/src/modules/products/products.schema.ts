import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BaseProductSchema = z.object({
  id: z.number().positive().describe('Unique product id'),
  name: z.string().nonempty().trim().describe('Product name'),
  description: z.string().trim().describe('Product description'),
  price: z.number().min(0).describe('Product price'),
  availableCount: z
    .number()
    .min(0)
    .describe('Product quantity available for fulfillment'),
  createdAt: z
    .string()
    .pipe(z.coerce.date())
    .describe('Product creation timestamp'),
  updatedAt: z
    .string()
    .pipe(z.coerce.date())
    .describe('Product last updated timestamp'),
});

export class ProductResponse extends createZodDto(BaseProductSchema) {}

export const CreateProductSchema = BaseProductSchema.pick({
  name: true,
  description: true,
  price: true,
  availableCount: true,
});
export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const UpdateProductSchema = BaseProductSchema.pick({
  name: true,
  description: true,
  price: true,
  availableCount: true,
});
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

export const PatchProductSchema = BaseProductSchema.pick({
  name: true,
  description: true,
  price: true,
  availableCount: true,
}).partial();
export class PatchProductDto extends createZodDto(PatchProductSchema) {}

export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).describe('Page number'),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10)
    .describe('Items per page (max 100)'),
});
export class GetProductsQueryDto extends createZodDto(GetProductsQuerySchema) {}

export const PaginatedProductsSchema = z.object({
  data: z.array(BaseProductSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});
export class PaginatedProductsResponse extends createZodDto(
  PaginatedProductsSchema,
) {}

export const CheckQuantitiesSchema = z.object({
  ids: z.array(z.number().positive()).describe('Array of product IDs to check'),
});
export class CheckQuantitiesDto extends createZodDto(CheckQuantitiesSchema) {}

export const ProductQuantitySchema = z.object({
  id: z.number().positive().describe('Product ID'),
  availableCount: z.number().min(0).describe('Available quantity'),
});

export const CheckQuantitiesResponseSchema = z.array(ProductQuantitySchema);
export class CheckQuantitiesResponse extends createZodDto(
  CheckQuantitiesResponseSchema,
) {}
