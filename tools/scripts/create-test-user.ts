import { PrismaClient } from '@prisma/client';
import { createAppLogger } from '@whizard/shared-infrastructure';
import { scrypt, randomBytes } from 'node:crypto';
const logger = createAppLogger({ service: 'tools', component: 'create-test-user' });

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32);
  const N = 16384;
  const r = 8;
  const p = 1;
  const keyLen = 64;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLen, { N, r, p }, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(key as Buffer);
    });
  });

  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

async function createTestUser() {
  const prisma = new PrismaClient();

  try {
    const email = 'test@whizard.com';
    const password = 'Test@123';

    logger.info('Creating test user', { email, password });

    // Hash the password
    const passwordHash = await hashPassword(password);
    logger.info('Password hash generated');

    // Create user account
    const userAccount = await prisma.userAccount.create({
      data: {
        primaryLoginId: email,
        primaryEmail: email,
        authMode: 'LOCAL_PASSWORD',
        status: 'ACTIVE',
        mfaRequired: false,
        tenantType: 'SYSTEM',
        tenantId: 'default',
        activatedAt: new Date()
      }
    });

    logger.info('User account created', { userAccountId: userAccount.id });

    // Create user credential
    await prisma.userCredential.create({
      data: {
        userAccountId: userAccount.id,
        passwordHash: passwordHash
      }
    });

    logger.info('User credential created');
    logger.info('Test user created successfully', { email, password });
  } catch (error) {
    logger.error('Error creating test user', { error });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
