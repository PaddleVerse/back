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

    @Post('paddle/disable')
    async disablePaddle(@Body() body : any)
    {
        return await this.shopService.disablePaddle(body);
    }

    @Post('ball')
    async createBall(@Body() body : any)
    {
        return await this.shopService.createBall(body);
    }

    @Post('ball/enable')
    async enableBall(@Body() body : any)
    {
        return await this.shopService.enableBall(body);
    }

    @Post('ball/disable')
    async disableBall(@Body() body : any)
    {
        return await this.shopService.disableBall(body);
    }

    @Post('table')
    async createTable(@Body() body : any)
    {
        return await this.shopService.createTable(body);
    }

    @Post('table/enable')
    async enableTable(@Body() body : any)
    {
        return await this.shopService.enableTable(body);
    }

    @Post('table/disable')
    async disableTable(@Body() body : any)
    {
        return await this.shopService.disableTable(body);
    }
}
