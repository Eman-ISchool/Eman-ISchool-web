import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'attendance',
    title: 'Attendance',
    type: 'document',
    fields: [
        defineField({
            name: 'lesson',
            title: 'Lesson',
            type: 'reference',
            to: [{ type: 'lesson' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'student',
            title: 'Student/User',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'joinedAt',
            title: 'Joined At',
            type: 'datetime',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            initialValue: 'present',
            options: {
                list: [
                    { title: 'Present', value: 'present' },
                    { title: 'Absent', value: 'absent' },
                ],
            },
        }),
    ],
    preview: {
        select: {
            title: 'student.name',
            subtitle: 'lesson.title',
        },
    },
})
