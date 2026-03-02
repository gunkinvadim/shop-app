import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { LoginData, SignUpData } from 'src/models/auth.models';
import { Role, User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) {}

    // userList: User[] = [];

    async login(loginData: LoginData) {
        let user = await this.userRepository.findOne({ where: { email: loginData.login } });

        if (!user) {
            user = await this.userRepository.findOne({ where: { username: loginData.login } });
        }

        if (!user) {
            throw new NotFoundException(`User ${loginData.login} not found!`);
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Incorrect password!");
        }

        // return { message: "You were logged in", user: { email: user.email, roles: user.roles } };

        const token = this.jwtService.sign({ id: user.id });
        
        return {
            token,
            userData: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles
            }
        }
    }

    async signUp(signUpData: SignUpData) {

        const existingEmail = await this.userRepository.findOne({ where: { email: signUpData.email } });

        if (existingEmail) {
            throw new BadRequestException("Email already in use");
        }

        const existingUserName = await this.userRepository.findOne({ where: { username: signUpData.username } });

        if (existingUserName) {
            throw new BadRequestException("User name already in use");
        }
    
        if (signUpData.password !== signUpData.repeatPassword) {
            throw new BadRequestException("Passwords don't match!");
        }

        const roles: Role[] = [ "BUYER" ];

        if (signUpData.createSellerAccount) {
            roles.push("SELLER");
        }

        let user: Partial<User> = { username: signUpData.username, email: signUpData.email, password: await bcrypt.hash(signUpData.password, 10), roles: roles }

        // return { message: "You were successfully registered", user: { login: user.email, roles: user.roles } };

        user = await this.userRepository.save(user);
        const token = this.jwtService.sign({ id: user.id });

        return {
            token,
            userData: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles
            }
        }
    }

    async getCurrentUser(userId: number) {
        const userData = await this.userRepository.findOne({ where: { id: userId } })

        if (!userData) {
            throw new UnauthorizedException("Unauthorized");
        };

        return {
            userData: {
                id: userData.id,
                email: userData.email,
                username: userData.username,
                roles: userData.roles
            }
        }
    }
}