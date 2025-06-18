import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import AuthService from '../services/AuthService';
import { API_URL } from '../http';
import { connectSocket, socket } from '../socket/socket';

class Store {
  user = {};
  isAuth = false;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(v) { this.isAuth = v; }
  setUser(u) { this.user = u; }
  setLoading(v) { this.isLoading = v; }

  getCurrentUserId() { return this.user.id ?? null; }
  async login(email, password) {
    try {
      const { data } = await AuthService.login(email, password);
      localStorage.setItem('token', data.accessToken);

      runInAction(() => {
        this.setAuth(true);
        this.setUser(data.user);  
      });

      connectSocket();    
      toast.success('Вы успешно вошли в систему');
    } catch (err) {
      console.log('Ошибка логина:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Не удалось войти');
      throw err;
    }
  }

  async registration(email, inn, password, confirmPassword) {
    try {
      const { data } = await AuthService.registration(
        email, inn, password, confirmPassword,
      );
      return data; 
    } catch (err) {
      console.log('Ошибка регистрации:', err.message || err);
      throw err;
    }
  }

  async logout() {
    try {
      await AuthService.logout();
    } finally {
      localStorage.removeItem('token');
      this.setAuth(false);
      this.setUser({});
      socket.disconnect();
    }
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      // payload: { accessToken, user }
      localStorage.setItem('token', data.accessToken);

      runInAction(() => {
        this.setAuth(true);
        this.setUser(data.user);
      });

      connectSocket();                  
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    } finally {
      this.setLoading(false);
    }
  }
}

export default new Store();
