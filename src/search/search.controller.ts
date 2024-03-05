import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController
{
    constructor(private readonly searchService : SearchService){}

    @Get()
    getAll()
    {
        return this.searchService.getAll();
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
