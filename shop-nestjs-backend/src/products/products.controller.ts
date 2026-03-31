import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import * as productModel from 'src/models/product.model';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @UseGuards(AuthGuard("jwt"))
    @Post()
    @UseInterceptors(FileInterceptor("image", { storage: multer.memoryStorage() }))
    async createNewProduct(
        @Body() productFormData: productModel.ProductFormData,
        @UploadedFile() file: Express.Multer.File
    ) {
        const created = await this.productsService.createNewProduct(productFormData, file);
        return created;
    }

    @UseGuards(AuthGuard("jwt"))
    @Put(":id")
    @UseInterceptors(FileInterceptor("image", { storage: multer.memoryStorage() }))
    async editProduct(
        @Param("id") id: string,
        @Body() productFormData: productModel.ProductFormData,
        @UploadedFile() file: Express.Multer.File
    ) {
        const edited = await this.productsService.editProduct(Number(id), productFormData, file);
        return edited;
    }

    @UseGuards(AuthGuard("jwt"))
    @Delete(":id")
    async deleteProduct(@Param("id") id: string) {
        return await this.productsService.deleteProduct(Number(id));
    }

    @Get()
    getProductList(
        @Query('sellerId') sellerId?: string,
        @Query('categoryId') categoryId?: string
    ) {
        const sellerIdNum = sellerId ? Number(sellerId) : null;
        const categoryIdNum = categoryId ? Number(categoryId) : null;

        return this.productsService.getProductList(sellerIdNum, categoryIdNum);
    }

    @UseGuards(AuthGuard("jwt"))
    @Get("my")
    async getMyProducts(
        @CurrentUser() user: { userId: number },
        @Query('categoryId') categoryId?: string
    ) {
        const categoryIdNum = categoryId ? Number(categoryId) : null;
        return this.productsService.getProductList(user.userId, categoryIdNum);
    }


    @Get('categories')
    getCategories() {
        return this.productsService.getCategories();
    }
}
