import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @UseGuards(AuthGuard("jwt"))
    @Post()
    @UseInterceptors(FileInterceptor("image"))
    createNewProduct(
        @UploadedFile() file: Express.Multer.File,
        @Body() productFormData
    ) {
        console.log(file);
        console.log(productFormData);
        return "hi";
    }

    @Get('categories')
    getCategories() {
        return this.productsService.getCategories();
    }
}
