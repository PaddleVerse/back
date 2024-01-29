import { Controller,Post, UseGuards, Request, Body, Get, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { LocalGuard } from './guards/local.guard';
import { GoogleGuard } from './guards/google.guard';
import { FortyTwoGuard } from './guards/42.guard';


@Controller('auth')
export class AuthController 
{
  constructor(private authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const user : any = await this.authService.login(req.user);

    // Set the access token as a cookie
    res.cookie('access_token', user.access_token, { httpOnly: true });

    return user;
  }

  @Post('signup')
  async signup(@Body() body: { username: string,name: string , password: string })
  {
    const { username, name, password } = body;
    await this.authService.signup(username, name, password);
    return { message: 'signup successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  async protectedRoute(@Request() req)
  {
    return req.user;
  }

  @UseGuards(GoogleGuard)
  @Get('google')
  async googleLogin() {
    return {
      message: 'Google login url'
    }
  }

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleLoginCallback(@Request() req, @Res({ passthrough: true }) res: Response) {

    const user: any = await this.authService.login(req.user);

    res.cookie('access_token', user.access_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });
    res.redirect('http://localhost:3000/Dashboard');
    res.status(HttpStatus.OK);
  }


  @UseGuards(FortyTwoGuard)
  @Get('42')
  async fortyTwoLogin() {
    return {
      message: '42 login url'
    }
  }

  @UseGuards(FortyTwoGuard)
  @Get('42/callback')
  async fortyTwoLoginCallback(@Request() req, @Res({ passthrough: true }) res: Response) {

    const user: any = await this.authService.login(req.user);

    res.cookie('access_token', user.access_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });
    res.redirect('http://localhost:3000/Dashboard');
    res.status(HttpStatus.OK);
  }
}
