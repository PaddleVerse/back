import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
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

    @Put(':id')
    updateUser(@Param('id') id: any, @Body() updateUserDto: any)
    {
        return this.userService.updateUser(+id, updateUserDto);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: any)
    {
        return this.userService.deleteUser(+id);
    }
}
