import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  async create(@Body() createCategoryDto: { name: string }) {
    try {
      const result = await this.categoriesService.create(createCategoryDto);

      if (result.error) {
        throw new HttpException(result.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return result
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      const result = await this.categoriesService.findAll();

      if (result.error) {
        throw new HttpException(result.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return result;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
