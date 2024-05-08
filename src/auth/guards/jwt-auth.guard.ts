import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { BlacklistService } from "../blacklist.service";


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly blacklistService: BlacklistService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const isTokenValid = await super.canActivate(context) as boolean;
      if (!isTokenValid)
        throw new UnauthorizedException();
      
      const request = context.switchToHttp().getRequest();
      const token = this.extractJwtFromRequest(request);
      
      // Check if the token is blacklisted
      if (this.blacklistService.isTokenBlacklisted(token))
        throw new UnauthorizedException();
  
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private extractJwtFromRequest(request: any): string {
    return request.headers.authorization.split(' ')[1];
  }
}
