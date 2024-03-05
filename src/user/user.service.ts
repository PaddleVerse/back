import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { MulterFile } from 'multer';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto/update-user.dto';

interface ClientData {
  [userId: number]: { socketId: string;};
}

@Injectable()
export class UserService 
{
  private readonly prisma : PrismaClient;
  public clients: ClientData = {};
    constructor () 
    {
        this.prisma = new PrismaClient();
    }

    async getUsers()
    {
      try
      {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                nickname: true,
                picture: true,
                banner_picture: true,
                status: true,
                level: true,
                twoFa : true,
                twoFaSecret: true,
                createdAt: true,
                friends: true,
                achievements: true,
                channel_participants: true,
            }
        });
        return users;
      }
      catch (error)
      {
        return null;
      }
    }

    async getUser(id: number)
    {
      try
      {
        const user = await this.prisma.user.findUnique({
          select: {
            id: true,
            username: true,
            name: true,
            nickname: true,
            picture: true,
            banner_picture: true,
            status: true,
            level: true,
            createdAt: true,
            twoFaSecret: true,
            twoFa: true,
            friends: true,
            achievements: true,
            channel_participants: true,
          },
            where: {
                id
            }
        });
        return user;
      }
      catch (error)
      {
        return null;
      }
    }

    async getTopThreeUsers()
    {
      try
      {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                nickname: true,
                picture: true,
                banner_picture: true,
                status: true,
                level: true,
                createdAt: true,
                friends: true,
                achievements: true,
                channel_participants: true,
            },
            orderBy: {
                level: 'desc'
            },
            take: 3
        });
        return users;
      }
      catch (error)
      {
        return null;
      }
    }

    async getTopUsers()
    {
      try
      {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                nickname: true,
                picture: true,
                banner_picture: true,
                status: true,
                level: true,
                createdAt: true,
                friends: true,
                achievements: true,
                channel_participants: true,
            },
            orderBy: {
                level: 'desc'
            },
            take: 10
        });
        return users;
      }
      catch (error)
      {
        return null;
      }
    }

    async getNeighbours(id: any)
    {
      try
      {
        const users = await this.getUsers();
        for (let i = 0; i < users.length; i++)
        {
          // check if the user in a range of each 10 users by level
            if (users[i].id == id)
              return (i < 10) ? users.slice(0, 10) : users.slice(i - 10, i + 10);
        }
      }
      catch (error)
      {
        return null;
      }
    }

    async getUserById(id: number)
    {
      try
      {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
              id: true,
                username: true,
                name: true,
                nickname: true,
                picture: true,
                banner_picture: true,
                status: true,
                level: true,
                createdAt: true,
                friends: true,
                achievements: true,
                channel_participants: true,
            }
        });
        return user;
      }
      catch (error)
      {
        return null;
      }
    }

    async findOne(username: string)
    {
        try
        {
          const user = await this.prisma.user.findUnique({
              where: {
                  username
              }
          });
          return user;
        }
        catch (error)
        {
          return null;
        }
    }

    async findOrCreateGoogleUser(profile: any) {
        try
        {
          const { id, displayName, emails } = profile;
          const photo = await profile.photos[0].value;

          let user = await this.prisma.user.findUnique({
            where: {
              googleId: id,
            },
          });

          let check = await this.prisma.user.findUnique({
            where: {
              username: emails[0]?.value,
            },
          });
          if (check) {
            emails[0].value = emails[0].value + id;
          }
      
          if (!user) {
            const random = Math.floor(Math.random() * 1000000);
            const res = random.toString();
            const pw = await bcrypt.hash(res, 10);
            user = await this.prisma.user.create({
              data: {
                googleId: id,
                name: displayName,
                username: emails[0]?.value || id,
                password: pw,
                picture: photo
              },
            });
          }
          return user;
        }
        catch (error)
        {
          return null;
        }
      }

      async findOrCreateFortyTwoUser(profile: any) {
        try
        {
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
        catch (error)
        {
          return null;
        }
      }

      async updateUser(id: number, data: any) {
        try
        {
          const user = await this.prisma.user.update({
            where: {
              id,
            },
            data,
          });
          return user;
        }
        catch (error)
        {
          return null;
        }
      }

      async deleteUser(id: number) {
        try
        {
          const user = await this.prisma.user.delete({
            where: {
              id,
            },
          });
          return user;
        }
        catch (error)
        {
          return null;
        }
      }

      async uploadImage(file: MulterFile): Promise<string>
      {
        try
        {
          const filename = `${Date.now()}-${file.originalname}`;
          const filePath = `images/${filename}`;
        
          await fs.promises.writeFile(filePath, file.buffer);
        
          return `http://localhost:8080/${filename}`;
        }
        catch (error) { return null; }
      }

      async editUser(id: number, data: UpdateUserDto)
      {
        const { name , nickname } = data;
        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                name: name,
                nickname: nickname
            }
        });
        return updatedUser;
      }

      async getLinkedFriends(userId: number , friendId: number)
      {
        try
        {
          const user : any= await this.getUserById(userId);
          const friend : any= await this.getUserById(friendId);

          let friends = [];
          for (let i = 0; i < user.friends.length; i++)
          {
            for (let j = 0; j < friend.friends.length; j++)
            {
              if (user.friends[i].friendId === friend.friends[j].friendId && friend.friends[i].status === 'ACCEPTED' && user.friends[j].status === 'ACCEPTED')
                friends.push(await this.getUserById(+user.friends[i].friendId));
              if (friends.length === 7)
                return friends;
            }
          }
          return friends;
        }
        catch (error)
        {
          return null;
        }
      }
}
