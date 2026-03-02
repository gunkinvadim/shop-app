export interface SignUpData {
    username: string;
    email: string;
    password: string;
    repeatPassword?: string;
    createSellerAccount?: boolean;
}

export interface LoginData {
    login: string;
    password: string;
}