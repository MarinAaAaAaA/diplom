import $api from '../http';

export default class ProfileService {
    static getApiKey() {
        return $api.get ('/profile/api-key');
    }
    static issueApiKey() {
        return $api.post('/profile/api-key/issue');
    }
    static revokeApiKey() {
        return $api.post('/profile/api-key/revoke');
    }
    static getMyCertificates() {
        return $api.get('/profile/ssl-certs');
    }
    static rotateApiKey() {
        return $api.post('/profile/api-key/rotate');
    }
}
