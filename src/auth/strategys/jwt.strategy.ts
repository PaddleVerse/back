import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy,ExtractJwt } from "passport-jwt"
import { UserService } from "src/user/user.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt')
{
    constructor(private readonly userService: UserService)
    {
        super({
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.SECRET
        })
    }
    async validate(payload: any)
    {
        const info = { id: payload.sub, username: payload.username }
        const user = await this.userService.findOne(info.username);
        delete user.password;
        return user;
    }
}