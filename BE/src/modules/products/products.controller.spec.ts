import { Mocked, TestBed } from '@suites/unit';
import { ProductsController } from './products.controller';
import { CreateProductDto } from './products.schema';
import { ProductsService } from './products.service';

describe('Products Controller Unit Tests', () => {
  let productsController: ProductsController;
  let productsService: Mocked<ProductsService>;

  beforeAll(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(ProductsController).compile();

    productsController = unit;
    productsService = unitRef.get(ProductsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Foo Bar',
        description: 'The fooest of bars',
        price: 1.23,
        availableCount: 123,
      };
      productsService.create = jest.fn();

      await productsController.create(createProductDto);
      expect(productsService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockPaginatedResponse = {
        data: [
          {
            id: 1,
            name: 'Product 1',
            description: 'Description 1',
            price: 10.99,
            availableCount: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      productsService.findMany = jest
        .fn()
        .mockResolvedValue(mockPaginatedResponse);

      const result = await productsController.findAll({ page: 1, limit: 10 });

      expect(productsService.findMany).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.findOne = jest.fn().mockResolvedValue(mockProduct);

      const result = await productsController.findOne(1);

      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 39.99,
        availableCount: 20,
      };

      const updatedProduct = {
        id: 1,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.updateOne = jest.fn().mockResolvedValue(updatedProduct);

      const result = await productsController.update(1, updateDto);

      expect(productsService.updateOne).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('patch', () => {
    it('should partially update a product', async () => {
      const patchDto = {
        price: 49.99,
      };

      const patchedProduct = {
        id: 1,
        name: 'Existing Product',
        description: 'Existing Description',
        price: 49.99,
        availableCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsService.patchOne = jest.fn().mockResolvedValue(patchedProduct);

      const result = await productsController.patch(1, patchDto);

      expect(productsService.patchOne).toHaveBeenCalledWith(1, patchDto);
      expect(result).toEqual(patchedProduct);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const deleteResponse = {
        success: true,
        message: 'Product with ID 1 successfully deleted',
      };

      productsService.deleteOne = jest.fn().mockResolvedValue(deleteResponse);

      const result = await productsController.remove(1);

      expect(productsService.deleteOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResponse);
    });
  });
});
