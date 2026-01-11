import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (rule) => rule.required().email(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'url',
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            initialValue: 'student',
            options: {
                list: [
                    { title: 'Student', value: 'student' },
                    { title: 'Teacher', value: 'teacher' },
                    { title: 'Admin', value: 'admin' },
                ],
            },
            validation: (rule) => rule.required(),
        }),
    ],
})
