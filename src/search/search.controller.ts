import { Body, Controller, UseGuards, Delete, Get, Param, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController
{
    constructor(private readonly searchService : SearchService){}

    @Get()
    getAll()
    {
        return this.searchService.getAll();
    }

    @Get('searchedUsers')
    getSearchedUsers()
    {
        return this.searchService.getSearchedUsers();
    }

    @Get(':name/:userId')
    filterSearch(@Param() body)
    {
        return this.searchService.filterSearch(body?.name, +body?.userId);
    }

    @Post()
    addSearch(@Body() body)
    {
        return this.searchService.addSearch(+body?.userId);
    }

    @Delete(':id')
    deleteSearch(@Param() body)
    {
        return this.searchService.deleteSearch(+body?.id);
    }
}
