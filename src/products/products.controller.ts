import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  Put,
  Param,
  NotFoundException,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/utility/upload/upload.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(@Body() data: { name: string, description: string, category: string, lazadaUrl: string }, @UploadedFiles() images: Express.Multer.File[]) {
    let uploaded = [];
    if (images) {
      uploaded = await this.uploadService.uploadFiles('products', images);
    }

    const result = await this.productsService.create({
      name: data.name,
      description: data.description,
      images: uploaded,
      category: data.category,
      lazadaUrl: data.lazadaUrl
    });

    if (result.error) {
      throw new InternalServerErrorException({ error: true, status: 500, message: 'An unexpected error occurred while create the product' });
    }

    return result;
  }

  @Get()
  async findAll(@Query() query) {
    // pagination implement letter
    if (query.pagination) {}
    const result = await this.productsService.findAll();
    return result;
  }

  @Get(':id')
  async findOne(@Param() param) {
    const id = param.id;
    const result = await this.productsService.findOne(id);

    if (result.error) {
      if (result.status === 404) throw new NotFoundException({ error: true, status: 404, message: result.message });
      throw new InternalServerErrorException({ error: true, status: 500, message: 'An unexpected error occurred while retrive the product' })
    }

    return result;
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(@Param() params, @Body() data: { name?: string, description?: string, category?: string, lazadaUrl?: string, updatedImageIndex?: string; images?: string[] }, @UploadedFiles() images: Express.Multer.File[]) {
    let uploaded = [];
    if (images) {
      const updatedImages = [];
      images.forEach((image, index) => {
        if (image) {
          updatedImages.push(image);
        };
      });
      uploaded = await this.uploadService.uploadFiles('products', updatedImages);
    }
    const updatedImageIndex = data.updatedImageIndex.split(',');
    let updatedImage;
    if (updatedImageIndex.length > 0) {
      const { result } = await this.productsService.findOne(params.id);
      updatedImage = result.images;

      updatedImageIndex.forEach((value, index) => {
        updatedImage[value] = uploaded[index];
      });
      data.images = updatedImage;
    }

    delete data.updatedImageIndex;
    const result = await this.productsService.update(params.id, data);

    return result;
  }

  @Post(':id/scan')
  async count(@Param('id') id: string, @Req() request: Request) {
    const ipAddress = request.ip;
    const result = await this.productsService.incrementScanHistory(id, ipAddress);

    if (result.error) {
      throw new InternalServerErrorException(result.message);
    }

    return result;
  }

  @Get('scan/report')
  async getCountReport() {
    const result = await this.productsService.scanReport();

    if (result.error) {
      throw new InternalServerErrorException(result.message);
    }

    return result;
  }
}
