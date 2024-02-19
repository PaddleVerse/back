import { ConflictException, ForbiddenException, Injectable,UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService 
{
    private readonly prisma : PrismaClient;
    constructor (private jwtService: JwtService, private userService: UserService, private twoFactorService: TwoFactorService) 
    {
        this.prisma = new PrismaClient();
    }

    async signup(username: string, name: string, password: string)
    {
        if (!username || !password || !name) {
            throw new ConflictException('Missing credentials');
        }
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        });
        if (user) {
            throw new ConflictException('Username already taken');
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
    
    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> 
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

    async enable2FA(userId: number): Promise<void> {
        const user = await this.userService.getUser(userId);

        if (!user) throw new UnauthorizedException('User not found');

        const { secret, otpauthUrl } = await this.twoFactorService.generateSecret();

        await this.userService.updateUser(userId, { twoFactorSecret: secret });

        // Generate QR code for user to scan
        const qrCode = await this.twoFactorService.generateQrCode(otpauthUrl);

        // Send QR code to user (e.g., email, notification)
        // ...
      }
};

