export type Role = "BUYER" | "SELLER" | "ADMIN" | "MODERATOR"

export interface UserData {
    id: number;
    email: string;
    username: string;
    roles: Role[];
}

export interface LoginFormValue {
    login: string;
    password: string
}

export interface SignUpFormValue {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
    createSellerAccount: boolean;
}