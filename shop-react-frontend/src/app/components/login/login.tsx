import { FormEvent, useState } from "react";
import "./login.scss";
import { environment } from "../../../environments/environment";
import axios from 'axios';
import useUserStore from '../../stores/userStore';
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { login } from "../../api/auth.api";
import { LoginFormValue } from "../../models/auth.models";
import { useAppStore } from "../../stores/appStore";

export const Login = () => {

    const userData = useUserStore(state => state.userData);
    const setUserData = useUserStore(state => state.setUserData);

    const [ formValue, setFormValue ] = useState<LoginFormValue>({ login: "", password: "" });
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
            const res = await login(formValue);

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
            <h3>Login</h3>
            <div className="input-container">
                <label htmlFor="login">Login or E-Mail</label>
                <input id="login" type="login" value={formValue.login} onInput={(e) => setFormValue({ ...formValue, login: e.currentTarget.value })}/>
            </div>
            <div className="input-container">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={formValue.password} onInput={(e) => setFormValue({ ...formValue, password: e.currentTarget.value })}/>
            </div>
            <div className="btn-container">
                <button type="submit">Submit</button>
            </div>

            { error ? <div className="error-text">{error}</div> : null }
        </form>
    </div>
}