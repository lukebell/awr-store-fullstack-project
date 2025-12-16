import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { OrdersModule } from 'src/modules/orders/orders.module';
import { ProductsModule } from 'src/modules/products/products.module';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
  imports: [ProductsModule, OrdersModule],
})
export class AppModule {}
