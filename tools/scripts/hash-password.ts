import { PasswordHasherService } from '../../libs/contexts/identity-access/src/infrastructure/security/password-hasher.service';
import { createAppLogger } from '@whizard/shared-infrastructure';

const hasher = new PasswordHasherService();
const password = 'Test@123';
const hash = hasher.hash(password);
const logger = createAppLogger({ service: 'tools', component: 'hash-password' });

logger.info('Password hashing completed', {
  password,
  hash,
  verify: hasher.verify(password, hash)
});
