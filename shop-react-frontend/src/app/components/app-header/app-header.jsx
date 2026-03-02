import './app-header.scss';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { environment } from '../../../environments/environment';
import axios from "axios";
import { CookiesProvider, useCookies } from 'react-cookie';
import { fetchCurrentUserData, logout } from '../../api/auth.api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useUserStore from '../../stores/userStore';

export const AppHeader = () => {

    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies();

    const setUserData = useUserStore(state => state.setUserData);
    const clearUserData = useUserStore(state => state.clearUserData);

    const userData = useUserStore(state => state.userData);
    
    const logoutHandler = async () => {
        removeCookie("token");
        clearUserData();
        navigate("/login");
    }

    return <header className="app-header">
        <div className="header-container">
            <NavLink className="header-link" to="/">Shop</NavLink>
            <NavLink className="header-link" to="/my-products">My Products</NavLink>
            <NavLink className="header-link" to="/list">List</NavLink>
        </div>
        
        <div className="header-container">
            {!userData ? (
                <>
                    <NavLink className="header-link" to="/login">Login</NavLink>
                    <NavLink className="header-link" to="/signup">Sign Up</NavLink>
                </>
            ) : null}
            {userData ? (
                <>
                    <span className="username">{userData.username}</span>
                    <button className="header-button">Become a seller</button>
                    <button className="header-button" onClick={logoutHandler}>Logout</button>
                </>
            ) : null}
            
        </div>
        
    </header>
}