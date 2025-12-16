import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateOrderDto, OrderResponse } from './orders.schema';
import { OrdersService } from './orders.service';

@Controller('orders')
@ApiExtraModels(OrderResponse)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new Order',
    description:
      'Places a new order with the specified products. Atomically decreases product availability.',
  })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    schema: {
      $ref: getSchemaPath(OrderResponse),
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or insufficient stock',
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponse> {
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all orders',
    description: 'Get a list of all orders',
  })
  @ApiOkResponse({
    description: 'Orders retrieved successfully',
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(OrderResponse),
      },
    },
  })
  async findAll(): Promise<OrderResponse[]> {
    return await this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve order details',
    description: 'Get details of a specific order by ID',
  })
  @ApiOkResponse({
    description: 'Order details retrieved successfully',
    schema: {
      $ref: getSchemaPath(OrderResponse),
    },
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string): Promise<OrderResponse> {
    return await this.ordersService.findOne(id);
  }
}
