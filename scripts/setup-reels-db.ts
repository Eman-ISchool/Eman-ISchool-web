/**
 * Database Setup Script for Reels Tables
 * 
 * This script creates the reels tables directly using Supabase client
 * and seeds sample data for testing.
 * 
 * Note: Since we can't execute raw SQL through the Supabase client,
 * this script provides instructions and creates sample data.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkTablesExist() {
    console.log('🔍 Checking if reels tables exist...\n');

    const tables = ['reels', 'reel_progress', 'generation_logs'];
    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

        if (error) {
            if (error.message.includes('does not exist') || error.message.includes('not found') || error.message.includes('schema cache')) {
                missingTables.push(table);
                console.log(`❌ Table '${table}' does not exist`);
            } else {
                console.log(`⚠️  Table '${table}' check failed: ${error.message}`);
                missingTables.push(table);
            }
        } else {
            existingTables.push(table);
            console.log(`✅ Table '${table}' exists`);
        }
    }

    console.log('');
    return { existingTables, missingTables };
}

async function provideSQLInstructions() {
    const migrationPath = path.join(__dirname, '../supabase/migrations/add_reels_tables.sql');
    const absolutePath = path.resolve(migrationPath);
    const dashboardUrl = SUPABASE_URL
        ? SUPABASE_URL.replace('/rest/v1', '')
        : '(SUPABASE_URL not configured)';

    console.log('📋 MANUAL SETUP REQUIRED\n');
    console.log('The reels tables need to be created in your Supabase database.');
    console.log('Please follow these steps:\n');
    console.log('1. Open your Supabase Dashboard:');
    console.log(`   ${dashboardUrl}\n`);
    console.log('2. Navigate to: SQL Editor (in the left sidebar)\n');
    console.log('3. Click "New Query"\n');
    console.log('4. Copy the contents of this file:');
    console.log(`   ${absolutePath}\n`);
    console.log('5. Paste it into the SQL Editor\n');
    console.log('6. Click "Run" to execute the migration\n');
    console.log('7. Re-run this script with --seed flag to add sample data\n');
    console.log('─'.repeat(60));
    console.log('\nSQL File Preview:');
    console.log('─'.repeat(60));

    try {
        const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
        const preview = sqlContent.split('\n').slice(0, 30).join('\n');
        console.log(preview);
        console.log('\n... (file continues) ...\n');
    } catch (error) {
        console.error('❌ Could not read migration file:', error);
    }
}

async function seedSampleData() {
    console.log('🌱 Seeding sample data...\n');

    try {
        // Check if tables exist first
        const { missingTables } = await checkTablesExist();

        if (missingTables.length > 0) {
            console.error('❌ Cannot seed data - tables do not exist yet.');
            console.error('   Please create the tables first using the SQL migration.\n');
            await provideSQLInstructions();
            return false;
        }

        // Get a teacher user to associate reels with
        const { data: teachers, error: teacherError } = await supabase
            .from('users')
            .select('id, name')
            .eq('role', 'teacher')
            .limit(1);

        let teacherId: string;

        if (teacherError || !teachers || teachers.length === 0) {
            console.log('⚠️  No teacher found in database. Creating sample teacher...');

            // Create a sample teacher
            const { data: newTeacher, error: createError } = await supabase
                .from('users')
                .insert({
                    email: 'teacher@eduverse.com',
                    name: 'Sample Teacher',
                    role: 'teacher',
                    google_id: `sample-teacher-${Date.now()}`
                })
                .select()
                .single();

            if (createError) {
                console.error('❌ Failed to create sample teacher:', createError.message);
                return false;
            }

            teacherId = newTeacher.id;
            console.log(`✅ Created teacher: ${newTeacher.name} (${teacherId})\n`);
        } else {
            teacherId = teachers[0].id;
            console.log(`✅ Using teacher: ${teachers[0].name} (${teacherId})\n`);
        }

        // Check if reels already exist
        const { data: existingReels } = await supabase
            .from('reels')
            .select('id')
            .limit(1);

        if (existingReels && existingReels.length > 0) {
            console.log('ℹ️  Sample reels already exist. Skipping seeding.\n');
            return true;
        }

        // Sample reels data
        const sampleReels = [
            {
                title_en: 'Introduction to Algebra',
                title_ar: 'مقدمة في الجبر',
                description_en: 'Learn the basics of algebraic expressions and equations',
                description_ar: 'تعلم أساسيات التعبيرات والمعادلات الجبرية',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                thumbnail_url: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Algebra',
                duration_seconds: 90,
                status: 'approved',
                teacher_id: teacherId,
                subject: 'Mathematics',
                grade_level: 'Grade 8',
                is_published: true
            },
            {
                title_en: 'The Water Cycle',
                title_ar: 'دورة الماء',
                description_en: 'Understanding how water moves through our environment',
                description_ar: 'فهم كيفية تحرك الماء في بيئتنا',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                thumbnail_url: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Water+Cycle',
                duration_seconds: 75,
                status: 'approved',
                teacher_id: teacherId,
                subject: 'Science',
                grade_level: 'Grade 6',
                is_published: true
            },
            {
                title_en: 'English Grammar: Present Perfect',
                title_ar: 'قواعد اللغة الإنجليزية: المضارع التام',
                description_en: 'Master the present perfect tense with examples',
                description_ar: 'إتقان زمن المضارع التام مع الأمثلة',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                thumbnail_url: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Grammar',
                duration_seconds: 60,
                status: 'approved',
                teacher_id: teacherId,
                subject: 'English',
                grade_level: 'Grade 7',
                is_published: true
            },
            {
                title_en: 'Photosynthesis Explained',
                title_ar: 'شرح عملية التمثيل الضوئي',
                description_en: 'How plants convert sunlight into energy',
                description_ar: 'كيف تحول النباتات ضوء الشمس إلى طاقة',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                thumbnail_url: 'https://via.placeholder.com/400x300/8BC34A/FFFFFF?text=Photosynthesis',
                duration_seconds: 85,
                status: 'approved',
                teacher_id: teacherId,
                subject: 'Biology',
                grade_level: 'Grade 9',
                is_published: true
            },
            {
                title_en: 'Geometry: Triangles',
                title_ar: 'الهندسة: المثلثات',
                description_en: 'Types of triangles and their properties',
                description_ar: 'أنواع المثلثات وخصائصها',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                thumbnail_url: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Triangles',
                duration_seconds: 70,
                status: 'approved',
                teacher_id: teacherId,
                subject: 'Mathematics',
                grade_level: 'Grade 7',
                is_published: true
            }
        ];

        // Insert sample reels
        const { data: insertedReels, error: insertError } = await supabase
            .from('reels')
            .insert(sampleReels)
            .select();

        if (insertError) {
            console.error('❌ Failed to insert sample reels:', insertError.message);
            return false;
        }

        console.log(`✅ Successfully created ${insertedReels?.length || 0} sample reels\n`);

        // Display created reels
        if (insertedReels) {
            console.log('📚 Sample Reels Created:');
            insertedReels.forEach((reel: any, index: number) => {
                console.log(`   ${index + 1}. ${reel.title_en} (${reel.subject} - ${reel.grade_level})`);
            });
            console.log('');
        }

        return true;
    } catch (error: any) {
        console.error('❌ Error seeding data:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Reels Database Setup\n');
    console.log('─'.repeat(60));
    console.log('');

    try {
        // Check if tables exist
        const { missingTables } = await checkTablesExist();

        if (missingTables.length > 0) {
            // Tables don't exist - provide instructions
            await provideSQLInstructions();
            process.exit(1);
        }

        // Tables exist - seed data if requested
        const shouldSeed = process.argv.includes('--seed');

        if (shouldSeed) {
            const success = await seedSampleData();
            if (success) {
                console.log('✨ Database setup complete!\n');
                console.log('Next steps:');
                console.log('1. Refresh your browser at http://localhost:3000/student/reels');
                console.log('2. The "Failed to fetch reels" error should be resolved');
                console.log('3. You should see the sample reels displayed\n');
                process.exit(0);
            } else {
                process.exit(1);
            }
        } else {
            console.log('✅ All tables exist!\n');
            console.log('ℹ️  Run with --seed flag to add sample data:');
            console.log('   npx ts-node scripts/setup-reels-db.ts --seed\n');
            process.exit(0);
        }

    } catch (error: any) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    }
}

main();
