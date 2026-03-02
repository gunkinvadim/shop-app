/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import * as listService from './list.service';


@Controller("list")
export class ListController {
    constructor(private readonly listService: listService.ListService) {}

    
    @Get()
    getList(): listService.ListItem[] {
        return this.listService.getList();
    }

    @Post()
    addItem(@Body() newItem: listService.ListItem): listService.ListItem[] {
        return this.listService.addItem(newItem);
    }

    @Put(":id")
    editItem(@Param("id") id: number, @Body() item: listService.ListItem): listService.ListItem[] {
        return this.listService.editItem(id, item);
    }

    @Delete(":id")
    deleteItem(@Param("id") id: number): listService.ListItem[] {
        return this.listService.deleteItem(id);
    }
}
