import { environment } from "../../environments/environment";
import axios from "axios";
import { LoginFormValue, SignUpFormValue, UserData } from "../models/auth.models";

export const login = async (req: LoginFormValue) => {
    try {
        return await axios.post<{ userData: UserData, token: string }>(environment.baseUrl + "/auth/login", req);
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}

export const signUp = async (req: SignUpFormValue) => {
    try {
        return await axios.post<{ userData: UserData, token: string }>(environment.baseUrl + "/auth/signup", req);
    } catch (error) {
        console.error("Error sining up:", error);
        throw error;
    }
}

export const fetchCurrentUserData = async () => {
    try {
        return await axios.get<{ userData: UserData, token: string }>(environment.baseUrl + "/auth/me");
    } catch (error) {
        console.error("Error getting user data:", error);
        throw error;
    }
}