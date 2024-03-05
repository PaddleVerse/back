import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { SearchModule } from './search/search.module';

@Module({
  imports: [AuthModule, UserModule, FriendshipModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..' ,'images'), }),
    SearchModule],
  controllers: [AppController, FriendshipController, SearchController],
  providers: [AppService, FriendshipService, SearchService],
})
export class AppModule {}
