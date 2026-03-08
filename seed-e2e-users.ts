import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('localhost', '127.0.0.1');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedTestUsers() {
    const testUsers = [
        {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'teacher@eduverse.com',
            name: 'Test Teacher',
            role: 'teacher',
            password_hash: '$2a$10$0z1hL4r5B0/9V.jK.d4PfeKzQKc2fN5F.F9wM1hR9P6mN3kL7y8u2' // password123
        },
        {
            id: '00000000-0000-0000-0000-000000000002',
            email: 'student@eduverse.com',
            name: 'Test Student',
            role: 'student',
            password_hash: '$2a$10$0z1hL4r5B0/9V.jK.d4PfeKzQKc2fN5F.F9wM1hR9P6mN3kL7y8u2' // password123
        },
        {
            id: '00000000-0000-0000-0000-000000000003',
            email: 'admin@eduverse.com',
            name: 'Test Admin',
            role: 'admin',
            password_hash: '$2a$10$0z1hL4r5B0/9V.jK.d4PfeKzQKc2fN5F.F9wM1hR9P6mN3kL7y8u2' // password123
        }
    ];

    console.log('Seeding E2E Test users into Supabase...');

    for (const user of testUsers) {
        const { error } = await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            password_hash: user.password_hash
        }, { onConflict: 'email' });

        if (error) {
            console.error(`Error inserting ${user.email}:`, error.message);
        } else {
            console.log(`✅ Upserted ${user.email}`);
        }
    }
}

seedTestUsers().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
