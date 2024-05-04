import { ConflictException, ForbiddenException, Injectable,UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { TwoFactorService } from './two-factor.service';
import { stat } from 'fs';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';

@Injectable()
export class AuthService 
{
    private readonly prisma : PrismaClient;
    constructor (private jwtService: JwtService, private userService: UserService, private twoFactorService: TwoFactorService) 
    {
        this.prisma = new PrismaClient();
    }

    async signup(body: any)
    {
        const { username, password, name, nickname } : CreateUserDto = body;
        if (!username || !password || !name || !nickname)
            return { status: 'error', message: 'Please provide all the required fields' };
        
        const user = await this.prisma.user.findUnique({
            where: {
                username
            }
        });

        if (user) return { status: 'error_', message: 'User already exists' };

        await this.prisma.user.create({
            data: {
                username,
                name,
                nickname,
                password: await this.hashPassword(password)
            }
        });
        
        return { status: 'success', message: 'User created' };
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
        if (user?.status === 'error') return user;
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async enable2FA(userId: number): Promise<any>
    {
        const user = await this.userService.getUser(userId);

        if (!user) throw new UnauthorizedException('User not found');

        const url = await this.twoFactorService.generateSecret(user.username);

        await this.userService.updateUser(userId, { twoFaSecret: url.secret });

        const qrCode = await this.twoFactorService.generateQRCode(url.url);

        return { Qr: qrCode };
    }

    async disable2FA(userId: number): Promise<any>
    {
        const user = await this.userService.getUser(userId);

        if (!user) throw new UnauthorizedException('User not found');

        await this.userService.updateUser(userId, { twoFaSecret: null , twoFa: false});

        return { message: '2FA disabled' };
    }

    async V2FA(userId: number, token: string): Promise<any>
    {
        const user = await this.userService.getUser(userId);

        if (!user) throw new UnauthorizedException('User not found');

        const res = await this.twoFactorService.verifyToken(user.twoFaSecret, token);

        this.userService.updateUser(userId, { twoFa: res });

        return {ok: res};
    }
};

