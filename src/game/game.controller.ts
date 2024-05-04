import { Controller, Delete, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController 
{
    constructor (private readonly notService:GameService) {}

    @Get('getUserBallSkin/:id')
    async deleteNotification(@Param('id') id: number)
    {
        id = parseInt(id.toString());
        return await this.notService.getUserBallSkin(id);
    }
}
