import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    HttpStatus,
} from '@nestjs/common';
import { resolve4 } from 'dns';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { JWTService } from 'src/configs';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JWTService) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const user = this.validateRequest(request, response);
        //console.log(request['user']);
        return user;
    }

    private async validateRequest(
        request: Request,
        response: Response
    ): Promise<boolean> {
        try {
            const token = request.headers['authorization'].split(' ')[1];
            if (!token) {
                throw new UnauthorizedException('Unauthorized');
            }

            const user = await this.jwtService.verifyToken(token, 'access');

            if (!user) {
                throw new UnauthorizedException('Unauthorized');
            }
          

            request['user'] = user;
            //how to user request.user in controller

            //console.log(request['user']);


            return true;
        } catch (error) {
            response
                .status(HttpStatus.UNAUTHORIZED)
                .json(new UnauthorizedException('Unauthorized'));
        }
    }
}