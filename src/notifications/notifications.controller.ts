import { Controller, Delete, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController 
{
    constructor (private readonly notService:NotificationsService) {}

    @Delete(':id')
    async deleteNotification(@Param('id') id: number)
    {
        return await this.notService.deleteAllNotifications(id);
    }
}
