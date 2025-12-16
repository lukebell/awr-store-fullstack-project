import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GenericOperationResponseSchema = z.object({
  success: z.boolean().describe('Set to true if operation was successful'),
});

export class GenericOperationResponse extends createZodDto(
  GenericOperationResponseSchema,
) {}
