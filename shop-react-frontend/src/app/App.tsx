import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.scss';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './components/login/login';
import { SignUp } from './components/login/signup';
import { List } from './components/list/list';
import useUserStore from './stores/userStore';
import { NotFound } from './components/not-found/not-found';
import { Shop } from './components/shop/shop';
import { environment } from '../environments/environment';
import axios from "axios";
import { CookiesProvider, useCookies } from 'react-cookie';
import { AppHeader } from './components/app-header/app-header';
import { fetchCurrentUserData } from './api/auth.api';
import { MyProducts } from './components/my-products/my-products';
import { useAppStore } from './stores/appStore';
import { Cart } from './components/cart/cart';
import { useCartStore } from './stores/cartStore';

function App() {

  const [cookies, setCookie, removeCookie] = useCookies();

  // zustand store for user data
  const setUserData = useUserStore(state => state.setUserData);
  const clearUserData = useUserStore(state => state.clearUserData);

  const isLoading = useAppStore((state => state.isLoading));
  const setIsLoading = useAppStore((state => state.setIsLoading));

  const [ isInitializing, setIsInitializing ] = useState<boolean>(false);

  const cart = useCartStore(state => state.cart);
  const setCart = useCartStore(state => state.setCart);
  const clearCart = useCartStore(state => state.clearCart);

  const getCurrentUserData = async () => {
    try {
      setIsInitializing(true);
      const res = await fetchCurrentUserData();
      setUserData(res.data.userData);

      const cart = localStorage.getItem("cart");
      if (cart) {
        setCart(JSON.parse(cart));
      }
    } catch(e) {
      console.error(e);
      if (e.response.status == 401) {
        removeCookie("token");
      }
    } finally {
      setIsInitializing(false);
    }
  }

  const userData = useUserStore(state => state.userData);

  useEffect(() => {
    const token = cookies['token'];

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (!userData) {
        getCurrentUserData();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      clearUserData();
      clearCart();
    }
  }, [cookies['token']])

  return (
    <BrowserRouter>
    {isInitializing
      ? <div>loading...</div>
      : (
        <div className="app">
          <AppHeader/>

          <div className="app-body">
            <Routes>
              <Route path="/" element={<Shop/>}/>
              {(userData && userData.roles.includes("SELLER")) && <Route path="/my-products" element={<MyProducts/>}/>}
              {(userData && userData.roles.includes("BUYER")) && <Route path="/cart" element={<Cart/>}/>}
              {/* <Route path="/list" element={<List/>}/> */}
              {!userData && <>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<SignUp/>}/>
              </>}
              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </div>
        </div>
      )
    }
    {isLoading && <div className="loading-overlay"></div>}
    </BrowserRouter>
  );
}

export default App;
