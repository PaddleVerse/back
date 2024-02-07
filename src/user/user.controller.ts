import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController 
{
    constructor (private readonly userService : UserService) {}

    @Get()
    getUsers() 
    {
        return this.userService.getUsers();
    }

    @Get('range/:id')
    getTopUsers(@Param('id') id: any)
    {
        return this.userService.getNeighbours(+id);
    }

    @Get('top')
    getTopThreeUsers()
    {
        return this.userService.getTopThreeUsers();
    }
}
