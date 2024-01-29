import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService 
{
    private readonly prisma : PrismaClient;
    constructor () 
    {
        this.prisma = new PrismaClient();
    }

    async getUsers() 
    {
        const users = await this.prisma.user.findMany();
        return users;
    }

    async getUserById(id: number)
    {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        });
        return user;
    }

    async findOne(username: string)
    {
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        });
        return user;
    }

    async findOrCreateGoogleUser(profile: any) {
        const { id, displayName, emails } = profile;
        const photo = await profile.photos[0].value;
        console.log(profile);
        // console.log(profile.photos[0].value);

        let user = await this.prisma.user.findUnique({
          where: {
            googleId: id,
          },
        });
    
        if (!user) {
          user = await this.prisma.user.create({
            data: {
              googleId: id,
              name: displayName,
              username: emails[0]?.value || id,
              password: '',
              picture: photo
            },
          });
        }
        console.log(photo);
        console.log(user);
        return user;
      }

      async findOrCreateFortyTwoUser(profile: any) {
        // console.log(profile);
        // console.log(profile._json.image);
        const { id, username } = profile;
        const pic = profile._json.image.link;
        let user = await this.prisma.user.findUnique({
          where: {
            fortytwoId: id,
          },
        });
    
        if (!user) {
          user = await this.prisma.user.create({
            data: {
              fortytwoId: id,
              name: username,
              username: username,
              password: '',
              picture: pic
            },
          });
        }
    
        return user;
      }
}
