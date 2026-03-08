'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Trash2, Plus, FileText, Link as LinkIcon, Image as ImageIcon, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Material {
    id: string;
    title: string;
    type: string;
    file_url: string;
}

export function MaterialList({
    lessonId,
    initialMaterials,
    locale
}: {
    lessonId: string;
    initialMaterials: Material[];
    locale: string
}) {
    // translations? using 'common' or specific?
    // Assume specific keys if available, fallback to hardcoded english if not yet added
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newMaterial, setNewMaterial] = useState({
        title: '',
        type: 'link', // default
        fileUrl: ''
    });

    const handleAddMaterial = async () => {
        if (!newMaterial.title || !newMaterial.fileUrl) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newMaterial,
                    lessonId
                }),
            });

            if (res.ok) {
                const added = await res.json();
                setMaterials([added, ...materials]);
                setNewMaterial({ title: '', type: 'link', fileUrl: '' });
                setIsAdding(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to add material', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMaterial = async (id: string) => {
        if (!confirm('Delete this material?')) return;
        try {
            const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMaterials(materials.filter(m => m.id !== id));
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to delete material', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="tex-lg font-semibold">Materials</h3>
                <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
                    <Plus className="h-4 w-4 mr-2" /> Add Material
                </Button>
            </div>

            {isAdding && (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="pt-6 space-y-3">
                        <Input
                            placeholder="Title"
                            value={newMaterial.title}
                            onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <select
                                className="border rounded px-3 py-2 text-sm"
                                value={newMaterial.type}
                                onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
                            >
                                <option value="link">Link</option>
                                <option value="file">File (URL)</option>
                                <option value="video">Video</option>
                            </select>
                            <Input
                                placeholder="URL (https://...)"
                                value={newMaterial.fileUrl}
                                onChange={e => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleAddMaterial} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                {materials.map(material => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm">
                        <div className="flex items-center gap-3">
                            {material.type === 'video' ? <Video className="h-5 w-5 text-blue-500" /> :
                                material.type === 'image' ? <ImageIcon className="h-5 w-5 text-purple-500" /> :
                                    material.type === 'file' ? <FileText className="h-5 w-5 text-orange-500" /> :
                                        <LinkIcon className="h-5 w-5 text-gray-500" />}
                            <div>
                                <div className="font-medium text-sm">{material.title}</div>
                                <a href={material.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[200px] block">
                                    {material.file_url}
                                </a>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(material.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                {materials.length === 0 && !isAdding && (
                    <div className="text-center py-4 text-gray-400 text-sm">No materials added.</div>
                )}
            </div>
        </div>
    );
}
