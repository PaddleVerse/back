import { Injectable,UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService 
{
    private readonly prisma : PrismaClient;
    constructor (private jwtService: JwtService ) 
    {
        this.prisma = new PrismaClient();
    }

    async signup(username: string, name: string, password: string) 
    {
        if (!username || !password || !name) {
            throw new UnauthorizedException('Missing credentials');
        }
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        });
        if (user) {
            throw new UnauthorizedException('Username already taken');
        }
        const newUser = await this.prisma.user.create({
            data: {
                username,
                name,
                password: await this.hashPassword(password)
            }
        });

        return newUser;
    }
    
    async validatePassword(plainPassword: string,hashedPassword: string): Promise<boolean> 
    {
      return bcrypt.compare(plainPassword, hashedPassword);
    }
    
    async hashPassword(password: string): Promise<string> {
      return bcrypt.hash(password, 10);
    }

    async login(user: any)
    {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

};

