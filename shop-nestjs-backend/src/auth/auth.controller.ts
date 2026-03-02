import { Headers, Body, Controller, NotFoundException, Post, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import * as authService from './auth.service';
import * as authModels from 'src/models/auth.models';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller("auth")
export class AuthController {

    constructor(private readonly appService: authService.AuthService) {}

    // @UseGuards(AuthGuard("jwt"))
    @Post("login")
    async login(@Body() loginData: authModels.LoginData) {
        return this.appService.login(loginData);
    }

    // @UseGuards(AuthGuard("jwt"))
    @Post("signup")
    async signUp(@Body() signUpData: authModels.SignUpData) {
        return this.appService.signUp(signUpData);
    }

    @UseGuards(AuthGuard("jwt"))
    @Get("me")
    async me(@CurrentUser() user: { userId: number }) {
        return this.appService.getCurrentUser(user.userId);
    }
}
