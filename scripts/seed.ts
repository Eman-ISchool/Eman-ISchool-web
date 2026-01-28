
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TEST_USERS = [
    {
        email: 'admin@eduverse.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin',
        image: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
    },
    {
        email: 'teacher@eduverse.com',
        password: 'password123',
        name: 'Teacher User',
        role: 'teacher',
        image: 'https://ui-avatars.com/api/?name=Teacher+User&background=0D8ABC&color=fff',
    },
    {
        email: 'student@eduverse.com',
        password: 'password123',
        name: 'Student User',
        role: 'student',
        image: 'https://ui-avatars.com/api/?name=Student+User&background=0D8ABC&color=fff',
    },
];

async function seed() {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Users
    console.log('Creating users...');
    for (const user of TEST_USERS) {
        const passwordHash = await bcrypt.hash(user.password, 10);

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (existingUser) {
            console.log(`User ${user.email} already exists, updating...`);
            await supabase
                .from('users')
                .update({
                    name: user.name,
                    role: user.role,
                    image: user.image,
                    password_hash: passwordHash, // Assuming you added this column, or we can skip auth for now
                    email_verified: new Date().toISOString(),
                    is_active: true
                })
                .eq('id', existingUser.id);
        } else {
            console.log(`Creating user ${user.email}...`);
            const { error } = await supabase.from('users').insert({
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
                password_hash: passwordHash,
                is_active: true,
                google_id: `test_${user.role}`, // Dummy Google ID for testing
      });
      
      if (error) console.error(`Error creating user ${ user.email }: `, error);
    }
  }

  // 2. Seed Courses (Teacher only)
  console.log('Creating courses...');
  const { data: teacher } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'teacher@eduverse.com')
    .single();

  if (teacher) {
    const courses = [
      {
        title: 'Introduction to Mathematics',
        slug: 'intro-to-math',
        description: 'Basic mathematics concepts for beginners.',
        teacher_id: teacher.id,
        price: 99.99,
        is_published: true,
        subject: 'Mathematics',
        grade_level: 'Grade 10'
      },
      {
        title: 'Advanced Physics',
        slug: 'advanced-physics',
        description: 'Complex physics theories and experiments.',
        teacher_id: teacher.id,
        price: 149.99,
        is_published: true,
        subject: 'Physics',
        grade_level: 'Grade 12'
      }
    ];

    for (const course of courses) {
      const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('slug', course.slug)
          .single();
          
        if (!existingCourse) {
             const { error } = await supabase.from('courses').insert(course);
             if (error) console.error(`Error creating course ${ course.title }: `, error);
        }
    }
  }

  console.log('✅ Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
