import { drizzle } from 'drizzle-orm/mysql2';
import { users } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const testUsers = [
  {
    id: 'test-supervisor',
    name: 'Supervisor (Test)',
    email: 'supervisor@ytf.test',
    loginMethod: 'test',
    role: 'user',
  },
  {
    id: 'test-manager',
    name: 'Manager (Test)',
    email: 'manager@ytf.test',
    loginMethod: 'test',
    role: 'user',
  },
  {
    id: 'test-executive',
    name: 'Executive (Test)',
    email: 'executive@ytf.test',
    loginMethod: 'test',
    role: 'admin',
  },
  {
    id: 'test-admin',
    name: 'Admin (Test)',
    email: 'admin@ytf.test',
    loginMethod: 'test',
    role: 'admin',
  },
];

console.log('Creating test users...');

for (const user of testUsers) {
  try {
    await db.insert(users).values(user).onDuplicateKeyUpdate({ set: { name: user.name } });
    console.log(`✓ Created: ${user.name} (username: ${user.id.replace('test-', '')}, password: test123)`);
  } catch (error) {
    console.log(`✗ Error creating ${user.name}:`, error.message);
  }
}

console.log('\nTest Users Created:');
console.log('━'.repeat(50));
console.log('Username: supervisor | Password: test123 | Role: Supervisor');
console.log('Username: manager    | Password: test123 | Role: Manager');
console.log('Username: executive  | Password: test123 | Role: Executive');
console.log('Username: admin      | Password: test123 | Role: Admin');
console.log('━'.repeat(50));

process.exit(0);
