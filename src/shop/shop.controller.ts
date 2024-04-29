import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService){}


  @Get('paddle/:id')
  async getUserPaddles(@Param('id') id: any)
  {
      return await this.shopService.getUserPadlles(+id);
  }

  @Post('paddle')
  async createPaddle(@Body() body : any)
  {
      return await this.shopService.createPaddle(body);
  }

  @Post('paddle/enable')
  async enablePaddle(@Body() body : any)
  {
      return await this.shopService.enablePaddle(body);
  }
}
