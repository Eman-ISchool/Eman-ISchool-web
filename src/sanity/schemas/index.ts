import { type SchemaTypeDefinition } from 'sanity'

import course from './course'
import post from './post'
import user from './user'
import lesson from './lesson'
import attendance from './attendance'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [course, post, user, lesson, attendance],
}
