import $api from "../http";

export default class AuthService {
  static async login(email, password) {
    return $api.post('/login', { email, password });
  }

  static async registration(email, inn, password, confirmPassword) {
    try {
      return await $api.post(
        '/registration',
        { email, inn, password, confirmPassword }
      );
    } catch (err) {
      if (err.response && err.response.data) {
        throw err.response.data;  
      }
      throw err;
    }
  }

  static async logout() {
    return $api.post('/logout');
  }
}
