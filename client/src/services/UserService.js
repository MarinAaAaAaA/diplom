import $api from "../http";

export default class UserService {
    static fetchUsers() {
        return $api.get('/users');
    }

    static getUserById(userId) {
        return $api.get(`/users/${userId}`);
    }

    static async changePassword(userId, oldPassword, newPassword) {
        return $api.post(`/users/${userId}/change-password`, { oldPassword, newPassword });
    }

    static async forgotPassword(email) {
        return $api.post('/forgot-password', { email });
    }

    static async resetPassword(token, newPassword, confirmPassword) {
        return $api.post('/reset-password', { token, newPassword, confirmPassword });
    }
}
