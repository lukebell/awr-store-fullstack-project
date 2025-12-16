import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import type { Product } from 'src/common/generated/prisma-client';
import {
  CreateProductDto,
  PatchProductDto,
  UpdateProductDto,
  CheckQuantitiesDto,
} from './products.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const created = await this.prisma.product.create({
      data: createProductDto,
    });

    return created;
  }

  async findMany(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateOne(id: number, updateProductDto: UpdateProductDto) {
    // Check if product exists first
    await this.findOne(id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return updated;
  }

  async patchOne(id: number, patchProductDto: PatchProductDto) {
    // Check if product exists first
    await this.findOne(id);

    const patched = await this.prisma.product.update({
      where: { id },
      data: patchProductDto,
    });

    return patched;
  }

  async deleteOne(id: number) {
    // Check if product exists first
    await this.findOne(id);

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Product with ID ${id} successfully deleted`,
    };
  }

  async checkQuantities(checkQuantitiesDto: CheckQuantitiesDto) {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: checkQuantitiesDto.ids,
        },
      },
      select: {
        id: true,
        availableCount: true,
      },
    });

    return products;
  }
}
