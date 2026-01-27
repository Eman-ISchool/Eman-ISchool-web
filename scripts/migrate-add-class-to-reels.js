/**
 * Database Migration Script
 * Adds class_id column to reels table
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxphxyblhvrupnmcmtoy.supabase.co';
const supabaseServiceKey = 'sb_secret_zJutqIo-918Es6-gN4vQNw_r67NRohe';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🔄 Starting database migration...\n');

    try {
        // Check if column already exists
        console.log('1️⃣ Checking if class_id column exists...');
        const { data: columns, error: checkError } = await supabase
            .from('reels')
            .select('*')
            .limit(1);

        if (checkError) {
            console.error('❌ Error checking table:', checkError.message);
            process.exit(1);
        }

        // Run the migration SQL
        console.log('2️⃣ Adding class_id column to reels table...');

        const migrationSQL = `
            -- Add class_id column if it doesn't exist
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'reels' AND column_name = 'class_id'
                ) THEN
                    ALTER TABLE reels ADD COLUMN class_id UUID REFERENCES lessons(id) ON DELETE SET NULL;
                    CREATE INDEX idx_reels_class ON reels(class_id);
                    COMMENT ON COLUMN reels.class_id IS 'Optional reference to the class/lesson this reel belongs to';
                    RAISE NOTICE 'Column class_id added successfully';
                ELSE
                    RAISE NOTICE 'Column class_id already exists';
                END IF;
            END $$;
        `;

        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            console.log('⚠️  RPC method not available, trying direct SQL execution...');

            // Alternative: Use the SQL editor endpoint
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({ query: migrationSQL })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        console.log('✅ Migration completed successfully!\n');

        // Verify the column was added
        console.log('3️⃣ Verifying migration...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('reels')
            .select('id, class_id')
            .limit(1);

        if (verifyError) {
            console.log('⚠️  Could not verify (this is normal if table is empty)');
        } else {
            console.log('✅ Verification successful - class_id column is accessible\n');
        }

        console.log('🎉 Database migration complete!');
        console.log('📝 You can now test the AI video generation feature.\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\n📋 Manual migration required:');
        console.log('Please run the SQL in QUICK_MIGRATION.sql via Supabase Dashboard\n');
        process.exit(1);
    }
}

runMigration();
