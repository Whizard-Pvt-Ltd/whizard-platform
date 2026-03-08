import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32);
  const N = 16384;
  const r = 8;
  const p = 1;
  const keyLen = 64;

  const derivedKey = (await scryptAsync(password, salt, keyLen, {
    N,
    r,
    p
  })) as Buffer;

  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

async function createTestUser() {
  const prisma = new PrismaClient();

  try {
    const email = 'test@whizard.com';
    const password = 'Test@123';

    console.log('Creating test user...');
    console.log('Email:', email);
    console.log('Password:', password);

    // Hash the password
    const passwordHash = await hashPassword(password);
    console.log('Password hash generated');

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

    console.log('User account created with ID:', userAccount.id);

    // Create user credential
    await prisma.userCredential.create({
      data: {
        userAccountId: userAccount.id,
        passwordHash: passwordHash
      }
    });

    console.log('User credential created');
    console.log('\n✅ Test user created successfully!');
    console.log('\nLogin credentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
