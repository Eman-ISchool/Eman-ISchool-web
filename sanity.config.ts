'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6h1kv8j2'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
import { schema } from './src/sanity/schemas'

export default defineConfig({
    basePath: '/studio',
    projectId,
    dataset,
    // Add and edit the content schema in the './sanity/schema' folder
    schema,
    plugins: [
        structureTool(),
    ],
})
