import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Folder, File, Video, Image as ImageIcon, Link2, Book } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

function getMaterialIcon(type: string) {
    switch (type) {
        case 'video': return <Video className="h-6 w-6" />;
        case 'image': return <ImageIcon className="h-6 w-6" />;
        case 'link': return <Link2 className="h-6 w-6" />;
        case 'book': return <Book className="h-6 w-6" />;
        default: return <File className="h-6 w-6" />;
    }
}

export default async function SubjectMaterialsPage({
    params: { locale, subjectId }
}: {
    params: { locale: string, subjectId: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch subject details
    const { data: subject } = await supabaseAdmin
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

    if (!subject) {
        redirect(withLocalePrefix('/teacher/subjects', locale));
    }

    // Fetch materials for this subject
    const { data: materials } = await supabaseAdmin
        .from('materials')
        .select('*')
        .eq('subject_id', subjectId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{subject.title} - Materials</h1>
                    <p className="text-gray-500">Manage materials and their associated lessons for this subject.</p>
                </div>
                <Button asChild className="gap-2 bg-brand-primary text-black hover:bg-yellow-400">
                    <Link href={withLocalePrefix(`/teacher/subjects/${subjectId}/materials/new`, locale)}>
                        <Plus className="h-4 w-4" />
                        Add Material
                    </Link>
                </Button>
            </div>

            {materials && materials.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {materials.map((material: any) => (
                        <Card key={material.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    {getMaterialIcon(material.type)}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{material.title}</CardTitle>
                                    <CardDescription>{material.type.toUpperCase()}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {material.description || 'No description provided.'}
                                </p>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <Button asChild variant="outline" className="w-full gap-2">
                                    <Link href={withLocalePrefix(`/teacher/subjects/${subjectId}/materials/${material.id}/lessons`, locale)}>
                                        <Book className="h-4 w-4" />
                                        View Associated Lessons
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Folder className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Materials Yet</h3>
                        <p className="text-gray-500 text-center mb-6 max-w-sm">
                            Add materials to this subject, which you can then map to specific lessons.
                        </p>
                        <Button asChild className="gap-2 bg-brand-primary text-black">
                            <Link href={withLocalePrefix(`/teacher/subjects/${subjectId}/materials/new`, locale)}>
                                <Plus className="h-4 w-4" />
                                Add Material
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
