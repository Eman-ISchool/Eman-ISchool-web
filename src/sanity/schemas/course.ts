import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'course',
    title: 'Course',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price (EGP)',
            type: 'number',
            validation: (rule) => rule.required().min(0),
        }),
        defineField({
            name: 'duration',
            title: 'Duration (Hours)',
            type: 'number',
        }),
        defineField({
            name: 'image',
            title: 'Main Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'subject',
            title: 'Subject',
            type: 'string',
            options: {
                list: [
                    { title: 'Arabic', value: 'arabic' },
                    { title: 'Math', value: 'math' },
                    { title: 'Science', value: 'science' },
                    { title: 'English', value: 'english' },
                    { title: 'History', value: 'history' },
                    { title: 'Physics', value: 'physics' },
                ],
            },
        }),
        defineField({
            name: 'gradeLevel',
            title: 'Grade Level',
            type: 'string',
        }),
    ],
})
