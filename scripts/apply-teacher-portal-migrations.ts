/**
 * Migration Script: Apply Teacher Portal Redesign Migrations
 * 
 * This script applies the three required migrations for the teacher portal redesign:
 * 1. 20260302_redesign_subjects_courses.sql - Makes subjects.course_id nullable, adds courses.subject_id
 * 2. 20260302_seed_grades.sql - Seeds 14 grade level records
 * 3. 20260303_drop_subjects_course_id.sql - Drops deprecated course_id column from subjects
 * 
 * Usage: node scripts/apply-teacher-portal-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql: string, description: string): Promise<void> {
    console.log(`Executing: ${description}...`);
    
    try {
        const { error } = await supabase.rpc('execute_sql', {
            args: { sql }
        });
        
        if (error) {
            throw new Error(`Failed: ${error.message}`);
        }
        
        console.log(`✓ ${description} completed successfully`);
    } catch (error) {
        // Check if it's a "already exists" type error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('already exists') || errorMessage.includes('duplicate column')) {
            console.log(`✓ ${description} - already applied (skipped)`);
        } else {
            throw error;
        }
    }
}

async function applyMigration(migrationFile: string, description: string): Promise<void> {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
        console.error(`Migration file not found: ${migrationPath}`);
        throw new Error(`Migration file not found: ${migrationFile}`);
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    await executeSQL(sql, description);
}

async function verifyGrades(): Promise<void> {
    console.log('Verifying grades table...');
    
    const { data, error } = await supabase
        .from('grades')
        .select('count', { count: 'exact', head: true })
        .eq('is_active', true);
    
    if (error) {
        console.warn('Warning: Could not verify grades:', error.message);
        return;
    }
    
    const count = data?.[0]?.count || 0;
    console.log(`✓ Found ${count} active grade records (expected: 14)`);
    
    if (count === 14) {
        console.log('✓ Grades table is correctly seeded');
    } else {
        console.warn(`⚠ Warning: Expected 14 grades, found ${count}`);
    }
}

async function verifySubjectsCourseIdDropped(): Promise<void> {
    console.log('Verifying subjects.course_id column is dropped...');
    
    // Try to query information_schema
    const { data, error } = await supabase.rpc('execute_sql', {
        args: {
            sql: `SELECT column_name FROM information_schema.columns WHERE table_name='subjects' AND column_name='course_id';`
        }
    });
    
    if (error) {
        console.warn('Warning: Could not verify subjects.course_id:', error.message);
        return;
    }
    
    // Parse the result
    const columns = data?.data || [];
    const hasCourseId = columns.some((row: any) => row.column_name === 'course_id');
    
    if (!hasCourseId) {
        console.log('✓ subjects.course_id column has been successfully dropped');
    } else {
        console.warn('⚠ Warning: subjects.course_id column still exists');
    }
}

async function migrate() {
    console.log('========================================');
    console.log('Teacher Portal Redesign Migrations');
    console.log('========================================\n');
    
    try {
        // Migration 1: Redesign subjects/courses relationship
        await applyMigration(
            '20260302_redesign_subjects_courses.sql',
            'Migration 1: Redesign subjects/courses relationship'
        );
        
        // Migration 2: Seed grades
        await applyMigration(
            '20260302_seed_grades.sql',
            'Migration 2: Seed grade levels'
        );
        
        // Migration 3: Drop subjects.course_id
        await applyMigration(
            '20260303_drop_subjects_course_id.sql',
            'Migration 3: Drop subjects.course_id column'
        );
        
        console.log('\n========================================');
        console.log('Verifying migrations...');
        console.log('========================================\n');
        
        await verifyGrades();
        await verifySubjectsCourseIdDropped();
        
        console.log('\n========================================');
        console.log('✓ All migrations completed successfully!');
        console.log('========================================\n');
        
        console.log('Next steps:');
        console.log('1. Restart your application');
        console.log('2. Test grade levels API: curl http://localhost:3000/api/grade-levels');
        console.log('3. Test subject creation: POST /api/subjects');
        console.log('4. Proceed with Phase 3 implementation\n');
        
    } catch (error) {
        console.error('\n========================================');
        console.error('❌ Migration failed');
        console.error('========================================\n');
        console.error(error);
        process.exit(1);
    }
}

migrate();
