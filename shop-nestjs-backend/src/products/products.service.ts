import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';
import { User } from '../auth/user.entity';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { ProductFormData } from 'src/models/product.model';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    getCategories(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async getProductList(sellerId: number | null, categoryId: number | null) {
        if (sellerId == null && categoryId == null) {
            return this.productRepository.find({ relations: ['seller', 'category'] });
        }

        const qb = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.seller', 'seller')
            .leftJoinAndSelect('product.category', 'category');

        if (sellerId != null) {
            qb.andWhere('product.sellerId = :sellerId', { sellerId });
        }
        if (categoryId != null) {
            qb.andWhere('product.categoryId = :categoryId', { categoryId });
        }

        const res = await qb.getMany();

        return res;
    }

    async createNewProduct(productData: ProductFormData, file?: Express.Multer.File) {
        if (!productData || !productData.name) {
            throw new BadRequestException('Missing product name');
        }

        const product = new Product();
        product.name = productData.name;
        product.description = productData.description;

        if (productData.price) {
            product.price = Number(productData.price);
        } else {
            throw new BadRequestException('Missing price!');
        }

        if (productData.categoryId) {
            const categoryId = Number(productData.categoryId);
            const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
            if (!category) throw new BadRequestException('Invalid categoryId');
            product.category = category;
        } else {
            throw new BadRequestException('Missing category!');
        }

        if (productData.sellerId) {
            const sellerId = Number(productData.sellerId);
            const user = await this.userRepository.findOne({ where: { id: sellerId } });
            if (!user) throw new BadRequestException('Invalid sellerId');
            product.seller = user;
        } else {
            throw new BadRequestException('Missing sellerId');
        }

        // handle file if provided
        if (file && file.buffer) {
            const uploadsDir = join(process.cwd(), 'uploads', 'products');
            await fs.mkdir(uploadsDir, { recursive: true });

            const ext = (file.originalname && file.originalname.split('.').pop()) || 'bin';
            const filename = `${randomUUID()}.${ext}`;
            const filePath = join(uploadsDir, filename);

            await fs.writeFile(filePath, file.buffer);

            // store a relative URL path that can be served by static assets
            product.imageUrl = `/uploads/products/${filename}`;
        }

        const savedProduct = await this.productRepository.save(product);

        return {
            ...savedProduct,
            seller: savedProduct.seller ? {
                id: savedProduct.seller.id,
                username: savedProduct.seller.username,
                email: savedProduct.seller.email,
                roles: savedProduct.seller.roles,
            } : null,
        }
    }

    async editProduct(productId: number, productData: ProductFormData, file?: Express.Multer.File) {
        if (!productData || !productData.name) {
            throw new BadRequestException('Missing product name');
        }

        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) throw new BadRequestException('Product not found');

        product.name = productData.name;
        product.description = productData.description;

        if (productData.price) {
            product.price = Number(productData.price);
        } else {
            throw new BadRequestException('Missing price!');
        }

        if (productData.categoryId) {
            const categoryId = Number(productData.categoryId);
            const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
            if (!category) throw new BadRequestException('Invalid categoryId');
            product.category = category;
        } else {
            throw new BadRequestException('Missing category!');
        }

        // handle file if provided
        if (file && file.buffer) {
            // delete old image if it exists
            if (product.imageUrl) {
                const oldPath = join(process.cwd(), product.imageUrl);
                await fs.rm(oldPath, { force: true });
            }

            const uploadsDir = join(process.cwd(), 'uploads', 'products');
            await fs.mkdir(uploadsDir, { recursive: true });

            const ext = (file.originalname && file.originalname.split('.').pop()) || 'bin';
            const filename = `${randomUUID()}.${ext}`;
            const filePath = join(uploadsDir, filename);
            await fs.writeFile(filePath, file.buffer);

            product.imageUrl = `/uploads/products/${filename}`;
        }
        // else: keep existing imageUrl unchanged

        return this.productRepository.save(product);
    }

    async deleteProduct(productId: number) {
        const product = await this.productRepository.findOne({ where: { id: productId } });
        
        if (!product) {
            throw new NotFoundException("Product not found!");
        }

        return this.productRepository.delete(productId);
    }
}
