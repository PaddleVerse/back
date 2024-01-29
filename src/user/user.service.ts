import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
        // console.log(profile);
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
        // console.log(photo);
        // console.log(user);
        return user;
      }

      async findOrCreateFortyTwoUser(profile: any) {
        // console.log(profile);
        // console.log(profile._json.first_name);
        let { id, username } = profile;
        const name = profile._json.first_name + ' ' + profile._json.last_name;
        const pic = profile._json.image.link;
        let user = await this.prisma.user.findUnique({
          where: {
            fortytwoId: id,
          },
        });
        let check = await this.prisma.user.findUnique({
          where: {
            username: username,
          },
        });
        if (check) {
          username = username + id;
        }
        if (!user) {
          const random = Math.floor(Math.random() * 1000000);
          const res = random.toString();
          const pw = await bcrypt.hash(res, 10);
          user = await this.prisma.user.create({
            data: {
              fortytwoId: id,
              name: name,
              username: username,
              password: pw,
              picture: pic
            },
          });
        }
    
        return user;
      }
}
