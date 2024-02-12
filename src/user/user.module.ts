import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserGateway } from './user.gateway';

@Module({
    controllers: [UserController],
    providers: [UserService, UserGateway],
    exports: [UserService]
})
export class UserModule {}
