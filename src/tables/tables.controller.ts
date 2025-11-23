import { Controller, Post, Get, Body, Param, Put, Delete } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private service: TablesService) {}

  @Post()
  create(@Body() dto: CreateTableDto) {
    return this.service.create(dto);
  }

  @Get('restaurant/:id')
  findAllByRestaurant(@Param('id') restaurantId: string) {
    return this.service.findAllByRestaurant(restaurantId);
  }

  @Put(':id/status/:status')
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
