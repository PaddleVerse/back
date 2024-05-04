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
        return false;
      
      const request = context.switchToHttp().getRequest();
      const token = this.extractJwtFromRequest(request);
  
      // Check if the token is blacklisted
      if (this.blacklistService.isTokenBlacklisted(token))
        return false;
  
      return true;
    } catch (error) {
      return false;
    }
  }

  private extractJwtFromRequest(request: any): string {
    return request.headers.authorization.split(' ')[1];
  }
}
