/**
 * Migration Script: Add token_hash column to password_resets table
 * 
 * This script adds a token_hash column to store SHA-256 hashed
 * password reset tokens for improved security.
 * 
 * Usage: node scripts/migrate-password-reset-tokens.ts
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Starting password reset token migration...');
    
    try {
        // Check if token_hash column already exists
        const { data: columns } = await supabase
            .rpc('get_table_columns', {
                args: { table_name: 'password_resets' }
            });
        
        const hasTokenHash = columns?.some((col: any) => col.column_name === 'token_hash');
        
        if (hasTokenHash) {
            console.log('Column token_hash already exists. Skipping migration.');
            return;
        }
        
        // Add token_hash column
        const { error: addError } = await supabase.rpc('execute_sql', {
            args: {
                sql: `ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS token_hash TEXT;`
            }
        });
        
        if (addError) {
            throw new Error(`Failed to add token_hash column: ${addError.message}`);
        }
        
        // Create index on token_hash for faster lookups
        const { error: indexError } = await supabase.rpc('execute_sql', {
            args: {
                sql: `CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);`
            }
        });
        
        if (indexError) {
            console.warn('Failed to create index on token_hash:', indexError.message);
            // Continue anyway as index is not critical
        }
        
        // Add comment for security
        const { error: commentError } = await supabase.rpc('execute_sql', {
            args: {
                sql: `COMMENT ON COLUMN password_resets.token_hash IS 'SHA-256 hash of reset token for security';`
            }
        });
        
        if (commentError) {
            console.warn('Failed to add comment:', commentError.message);
        }
        
        console.log('Migration completed successfully!');
        console.log('Next steps:');
        console.log('1. Restart your application');
        console.log('2. Test password reset functionality');
        console.log('3. Monitor logs for any issues');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
