import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CreateProductDto,
  GetProductsQueryDto,
  PaginatedProductsResponse,
  PatchProductDto,
  ProductResponse,
  UpdateProductDto,
  CheckQuantitiesDto,
  CheckQuantitiesResponse,
} from './products.schema';
import { ProductsService } from './products.service';

@Controller('products')
@ApiExtraModels(
  ProductResponse,
  PaginatedProductsResponse,
  CheckQuantitiesResponse,
)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new Product resource.',
  })
  @ApiCreatedResponse({
    description: 'Returned when a new Product was created successfully.',
    schema: {
      $ref: getSchemaPath(ProductResponse),
    },
  })
  @ApiBadRequestResponse({
    description:
      'Returned when one or more parameters failed validation during Product creation',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve a paginated list of products.',
  })
  @ApiOkResponse({
    description: 'Returns a paginated list of products.',
    schema: {
      $ref: getSchemaPath(PaginatedProductsResponse),
    },
  })
  async findAll(
    @Query() query: GetProductsQueryDto,
  ): Promise<PaginatedProductsResponse> {
    return await this.productsService.findMany(query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a single product by ID.',
  })
  @ApiOkResponse({
    description: 'Returns the product details.',
    schema: {
      $ref: getSchemaPath(ProductResponse),
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponse> {
    return await this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a product (replaces all fields).',
  })
  @ApiOkResponse({
    description: 'Product updated successfully.',
    schema: {
      $ref: getSchemaPath(ProductResponse),
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.updateOne(id, updateProductDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partially update a product (updates only provided fields).',
  })
  @ApiOkResponse({
    description: 'Product updated successfully.',
    schema: {
      $ref: getSchemaPath(ProductResponse),
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchProductDto: PatchProductDto,
  ): Promise<ProductResponse> {
    return await this.productsService.patchOne(id, patchProductDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a product by ID.',
  })
  @ApiOkResponse({
    description: 'Product deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.deleteOne(id);
  }

  @Post('check-quantities')
  @ApiOperation({
    summary: 'Check available quantities for a list of product IDs.',
  })
  @ApiOkResponse({
    description: 'Returns available quantities for the requested products.',
    schema: {
      $ref: getSchemaPath(CheckQuantitiesResponse),
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid product IDs provided',
  })
  async checkQuantities(
    @Body() checkQuantitiesDto: CheckQuantitiesDto,
  ): Promise<CheckQuantitiesResponse> {
    return await this.productsService.checkQuantities(checkQuantitiesDto);
  }
}
