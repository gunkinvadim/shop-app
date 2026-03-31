import { FormEvent, useState } from "react";
import "./login.scss";
import { environment } from "../../../environments/environment";
import axios from 'axios';
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { signUp } from "../../api/auth.api";
import { SignUpFormValue } from "../../models/auth.models";
import useUserStore from "../../stores/userStore";
import { useAppStore } from "../../stores/appStore";

export const SignUp = () => {

    const userData = useUserStore(state => state.userData);
    const setUserData = useUserStore(state => state.setUserData);

    const [ formValue, setFormValue ] = useState<SignUpFormValue>({ username: "", email: "", password: "", repeatPassword: "", createSellerAccount: false });
    const [ error, setError ] = useState<string>();

    const isLoading = useAppStore((state => state.isLoading));
    const setIsLoading = useAppStore((state => state.setIsLoading));

    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies();

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formValue);

        try {
            setIsLoading(true);
            const res = await signUp(formValue);

            console.log(res);
            setError(null);

            // save user data to zustand store so other components can read it
            setUserData(res.data.userData);

            setCookie("token", res.data.token);

            if (res.data.userData.roles.includes("SELLER")) {
                navigate("/my-products");
            } else {
                navigate("/");
            }
        } catch(err) {
            if (err.response) {
                setError(err.response.data.message);
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return <div className="login-container">
        <form className="login-form" onSubmit={(e) => handleFormSubmit(e)}>
            <h3>Sign Up</h3>
            <div className="input-container">
                <label htmlFor="username">Username</label>
                <input id="username" type="text" value={formValue.username} onInput={(e) => setFormValue({ ...formValue, username: e.currentTarget.value })}/>
            </div>
            <div className="input-container">
                <label htmlFor="email">E-Mail</label>
                <input id="email" type="email" value={formValue.email} onInput={(e) => setFormValue({ ...formValue, email: e.currentTarget.value })}/>
            </div>
            <div className="input-container">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={formValue.password} onInput={(e) => setFormValue({ ...formValue, password: e.currentTarget.value })}/>
            </div>
            <div className="input-container">
                <label htmlFor="repeat-password">Repeat password</label>
                <input id="repeat-password" type="password" value={formValue.repeatPassword} onInput={(e) => setFormValue({ ...formValue, repeatPassword: e.currentTarget.value })}/>
            </div>
            <div className="checkbox-container">
                <label><input type="checkbox"
                    checked={formValue.createSellerAccount}
                    onChange={(e) => setFormValue({ ...formValue, createSellerAccount: e.currentTarget.checked })}
                />Do you want to create seller account?</label>
            </div>
            <div className="btn-container">
                <button type="submit">Submit</button>
            </div>

            { error ? <div className="error-text">{error}</div> : null }
        </form>
    </div>
}