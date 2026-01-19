/**
 * Teacher Materials Page
 * Displays lesson materials with AI reel generation buttons
 */

'use client';

import { useState, useEffect } from 'react';

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch materials from API
        // TODO: Implement API call to fetch materials
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Lesson Materials
                    </h1>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600 mb-4">
                            Loading materials...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Lesson Materials
                </h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 mb-4">
                        No materials found.
                    </p>
                </div>
            </div>
        </div>
    );
}
