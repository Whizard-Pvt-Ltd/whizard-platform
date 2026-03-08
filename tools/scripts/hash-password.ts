import { PasswordHasherService } from '../../libs/contexts/identity-access/src/infrastructure/security/password-hasher.service';

const hasher = new PasswordHasherService();
const password = 'Test@123';
const hash = hasher.hash(password);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('Verify:', hasher.verify(password, hash));
