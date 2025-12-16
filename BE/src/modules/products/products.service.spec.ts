import { Mocked, TestBed } from '@suites/unit';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateProductDto } from './products.schema';
import { ProductsService } from './products.service';

describe('Product Service Unit Tests', () => {
  let productService: ProductsService;
  let prismaService: Mocked<PrismaService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(ProductsService).compile();

    productService = unit;
    prismaService = unitRef.get(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product with provided data', async () => {
      const createdProductData: CreateProductDto = {
        name: 'Mesmerizer 3000',
        description: 'An antique mesmerizer designed to captivate audiences.',
        price: 199.99,
        availableCount: 12,
      };

      prismaService.product.create.mockResolvedValueOnce({
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...createdProductData,
      });

      const result = await productService.create(createdProductData);
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: createdProductData,
      });
      expect(result).toEqual(expect.objectContaining(createdProductData));
    });
  });

  describe('findMany', () => {
    it('should return paginated products with default pagination', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Product 1',
          description: 'Description 1',
          price: 10.99,
          availableCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Product 2',
          description: 'Description 2',
          price: 20.99,
          availableCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.$transaction.mockResolvedValueOnce([mockProducts, 2]);

      const result = await productService.findMany(1, 10);

      expect(result).toEqual({
        data: mockProducts,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should calculate correct totalPages for pagination', async () => {
      const mockProducts = Array(25)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          description: `Description ${i + 1}`,
          price: 10.99,
          availableCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      prismaService.$transaction.mockResolvedValueOnce([
        mockProducts.slice(0, 10),
        25,
      ]);

      const result = await productService.findMany(1, 10);

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });

  describe('findOne', () => {
    it('should retrieve matching product by using provided product id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.product.findUnique.mockResolvedValueOnce(mockProduct);

      const result = await productService.findOne(1);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      prismaService.product.findUnique.mockResolvedValueOnce(null);

      await expect(productService.findOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('updateOne', () => {
    it('should update and return the product with the given product id', async () => {
      const existingProduct = {
        id: 1,
        name: 'Old Name',
        description: 'Old Description',
        price: 10.99,
        availableCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        name: 'New Name',
        description: 'New Description',
        price: 19.99,
        availableCount: 10,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
        updatedAt: new Date(),
      };

      prismaService.product.findUnique.mockResolvedValueOnce(existingProduct);
      prismaService.product.update.mockResolvedValueOnce(updatedProduct);

      const result = await productService.updateOne(1, updateData);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const updateData = {
        name: 'New Name',
        description: 'New Description',
        price: 19.99,
        availableCount: 10,
      };

      prismaService.product.findUnique.mockResolvedValueOnce(null);

      await expect(productService.updateOne(999, updateData)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('patchOne', () => {
    it('should partially update a product', async () => {
      const existingProduct = {
        id: 1,
        name: 'Old Name',
        description: 'Old Description',
        price: 10.99,
        availableCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const patchData = {
        price: 15.99,
      };

      const patchedProduct = {
        ...existingProduct,
        ...patchData,
        updatedAt: new Date(),
      };

      prismaService.product.findUnique.mockResolvedValueOnce(existingProduct);
      prismaService.product.update.mockResolvedValueOnce(patchedProduct);

      const result = await productService.patchOne(1, patchData);

      expect(result.price).toBe(15.99);
      expect(result.name).toBe('Old Name');
    });
  });

  describe('deleteOne', () => {
    it('should delete a product with the given product id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.product.findUnique.mockResolvedValueOnce(mockProduct);
      prismaService.product.delete.mockResolvedValueOnce(mockProduct);

      const result = await productService.deleteOne(1);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        success: true,
        message: 'Product with ID 1 successfully deleted',
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      prismaService.product.findUnique.mockResolvedValueOnce(null);

      await expect(productService.deleteOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('checkQuantities', () => {
    it('should return available quantities for multiple product IDs', async () => {
      const checkQuantitiesDto = {
        ids: [1, 2, 3],
      };

      const mockProducts = [
        { id: 1, availableCount: 10 },
        { id: 2, availableCount: 5 },
        { id: 3, availableCount: 0 },
      ];

      (prismaService.product.findMany as any).mockResolvedValueOnce(
        mockProducts,
      );

      const result = await productService.checkQuantities(checkQuantitiesDto);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [1, 2, 3],
          },
        },
        select: {
          id: true,
          availableCount: true,
        },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no product IDs match', async () => {
      const checkQuantitiesDto = {
        ids: [999, 998],
      };

      (prismaService.product.findMany as any).mockResolvedValueOnce([]);

      const result = await productService.checkQuantities(checkQuantitiesDto);

      expect(result).toEqual([]);
    });

    it('should handle single product ID', async () => {
      const checkQuantitiesDto = {
        ids: [1],
      };

      const mockProduct = [{ id: 1, availableCount: 15 }];

      (prismaService.product.findMany as any).mockResolvedValueOnce(
        mockProduct,
      );

      const result = await productService.checkQuantities(checkQuantitiesDto);

      expect(result).toEqual(mockProduct);
      expect(result).toHaveLength(1);
    });
  });
});
