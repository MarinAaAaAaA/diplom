import { randomBytes, createHash } from 'crypto';
import ApiKey from '../models/apiKey.js';

const sha = (s) => createHash('sha256').update(s).digest('hex');

class ApiKeyService {
  async getActive(userId) {
    const row = await ApiKey.findOne({ where: { userId, revokedAt: null } });
    return row?.key ?? null;
  }

  async issue(userId) {
    const exist = await this.getActive(userId);
    if (exist) return exist;

    const raw = randomBytes(24).toString('hex');
    await ApiKey.create({ userId, key: raw, hash: sha(raw) });
    return raw;
  }

  async revoke(userId) {
    await ApiKey.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );
  }

  async rotate(userId) {
    await this.revoke(userId);
    return this.issue(userId);
  }

  async authenticate(raw) {
    const row = await ApiKey.findOne({
      where: { hash: sha(raw), revokedAt: null },
      include: ['User'],
    });
    return row?.User ?? null;
  }
}

export default new ApiKeyService();
