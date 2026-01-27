/**
 * Database Setup Instructions Component
 * Displays helpful instructions when reels database is not set up
 */

'use client';

import { useState } from 'react';

export function DatabaseSetupInstructions() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<string | null>(null);

    const handleSimulate = async () => {
        setIsSimulating(true);
        setSimulationResult(null);

        try {
            const response = await fetch('/api/reels/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 10 }),
            });

            const data = await response.json();

            if (data.success) {
                setSimulationResult(`✅ Successfully created ${data.data?.length || 0} sample reels!`);
                // Reload page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setSimulationResult(`❌ Error: ${data.error || 'Failed to create reels'}`);
            }
        } catch (error: any) {
            setSimulationResult(`❌ Error: ${error.message || 'Failed to create reels'}`);
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Educational Reels Setup Required
                </h1>

                <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            🔧 Database Setup Needed
                        </h2>
                        <p className="text-gray-600 mb-4">
                            The reels feature requires database tables to be set up. Follow these steps:
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Option 1: Quick Setup (Recommended)</h3>
                            <p className="text-gray-600 mb-3">
                                Use the simulation API to automatically create sample reels:
                            </p>
                            <button
                                onClick={handleSimulate}
                                disabled={isSimulating}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSimulating ? 'Creating Sample Reels...' : '🚀 Create Sample Reels'}
                            </button>
                            {simulationResult && (
                                <div className={`mt-3 p-3 rounded ${simulationResult.startsWith('✅')
                                        ? 'bg-green-50 text-green-800'
                                        : 'bg-red-50 text-red-800'
                                    }`}>
                                    {simulationResult}
                                </div>
                            )}
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Option 2: Manual Setup</h3>
                            <p className="text-gray-600 mb-2">
                                Execute the SQL migration in Supabase Dashboard:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                                <li>Open your Supabase Dashboard</li>
                                <li>Navigate to SQL Editor</li>
                                <li>Click "New Query"</li>
                                <li>Copy contents from <code className="bg-gray-100 px-2 py-1 rounded">supabase/migrations/add_reels_tables.sql</code></li>
                                <li>Paste and click "Run"</li>
                                <li>Use Option 1 above to create sample data</li>
                            </ol>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">📚 Documentation</h3>
                        <p className="text-blue-800 text-sm">
                            For detailed setup instructions, see:{' '}
                            <code className="bg-blue-100 px-2 py-1 rounded">docs/REELS_DATABASE_SETUP.md</code>
                        </p>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Note</h3>
                    <p className="text-yellow-800 text-sm">
                        If you see this message, it means either:
                    </p>
                    <ul className="list-disc list-inside text-yellow-800 text-sm ml-4 mt-2">
                        <li>The database tables haven't been created yet</li>
                        <li>There are no reels in the database</li>
                        <li>The Nanobana API key is not configured (simulation mode is active)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
