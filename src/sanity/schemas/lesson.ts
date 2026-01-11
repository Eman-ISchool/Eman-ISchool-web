import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'lesson',
    title: 'Lesson',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Lesson Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'startDateTime',
            title: 'Start Date & Time',
            type: 'datetime',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'endDateTime',
            title: 'End Date & Time',
            type: 'datetime',
            validation: (rule) => rule.required().min(rule.valueOfField('startDateTime')),
        }),
        defineField({
            name: 'meetLink',
            title: 'Google Meet Link',
            type: 'url',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            initialValue: 'scheduled',
            options: {
                list: [
                    { title: 'Scheduled', value: 'scheduled' },
                    { title: 'Live', value: 'live' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Cancelled', value: 'cancelled' },
                ],
            },
        }),
        defineField({
            name: 'course',
            title: 'Course',
            type: 'reference',
            to: [{ type: 'course' }],
        }),
        defineField({
            name: 'teacher',
            title: 'Teacher',
            type: 'reference',
            to: [{ type: 'user' }],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'startDateTime',
        },
    },
})
