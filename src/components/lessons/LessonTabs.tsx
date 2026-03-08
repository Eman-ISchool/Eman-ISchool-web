'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Video, FileText, Sparkles, FolderOpen, ExternalLink, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export function LessonTabs({ lesson, materials, attendance, locale, duration }: any) {
    const startDate = new Date(lesson.start_date_time);
    const endDate = new Date(lesson.end_date_time);

    return (
        <Tabs defaultValue="info" className="w-full">
            <TabsList className="justify-start border-b rounded-none w-full bg-transparent p-0 mb-6 overflow-x-auto pb-px">
                <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Information</TabsTrigger>
                <TabsTrigger value="materials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Materials</TabsTrigger>
                <TabsTrigger value="homework" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Homework</TabsTrigger>
                <TabsTrigger value="quizzes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Quizzes</TabsTrigger>
                <TabsTrigger value="exams" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Exams</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Lesson Info block (copied from original) */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5">
                            <h2 className="text-lg font-bold text-gray-900">Lesson Details</h2>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
                                        <Calendar className="h-3 w-3" /> Date
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {startDate.toLocaleDateString('en-US', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
                                        <Clock className="h-3 w-3" /> Time
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        {' – '}
                                        {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-gray-400 text-sm ml-2">({duration}min)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Meet Link */}
                            {lesson.meet_link && (
                                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                            <Video className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-blue-900 text-sm">Google Meet</div>
                                            <a href={lesson.meet_link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">
                                                {lesson.meet_link}
                                            </a>
                                        </div>
                                    </div>
                                    <a href={lesson.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                                        <ExternalLink className="h-4 w-4" /> Join
                                    </a>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <div className="text-xs text-gray-400 mb-2">Description</div>
                                <div className="text-gray-700 bg-gray-50 rounded-xl p-4 min-h-[80px] whitespace-pre-wrap text-sm">
                                    {lesson.description || 'No description provided.'}
                                </div>
                            </div>
                        </div>

                        {/* AI Tools Section */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                                AI Tools
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Generate Summary', desc: 'Auto-summarize lesson content' },
                                    { label: 'Create Quiz', desc: 'Generate quiz questions' },
                                    { label: 'Slide Outline', desc: 'Create presentation outline' },
                                    { label: 'Lesson Script', desc: 'Generate teaching script' },
                                ].map((tool, i) => (
                                    <button key={i} className="text-left p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                                        <p className="font-semibold text-sm text-gray-900">{tool.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Attendance snapshot */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Users className="h-5 w-5 text-gray-400" />
                                Attendance
                            </h3>
                            {attendance.length === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-4">
                                    No attendance records yet.
                                    <Link href={`/${locale}/teacher/lessons/${lesson.id}/attendance`} className="block mt-3 text-blue-600 font-medium hover:text-blue-700">
                                        Mark Attendance
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {attendance.map((a: any) => (
                                        <div key={a.id} className="flex items-center justify-between p-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {(a.student?.name || '?')[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700 truncate max-w-[120px]">
                                                    {a.student?.name || a.student_id}
                                                </span>
                                            </div>
                                            {a.status === 'present' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                            {a.status === 'absent' && <XCircle className="h-4 w-4 text-red-500" />}
                                            {a.status === 'late' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                        </div>
                                    ))}
                                    <Link href={`/${locale}/teacher/lessons/${lesson.id}/attendance`} className="block text-center text-sm text-blue-600 font-medium hover:text-blue-700 mt-3">
                                        View Full Report
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="materials">
                <div className="rounded-2xl border border-gray-100 bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-gray-400" />
                            Materials & Attachments
                        </h2>
                    </div>
                    {materials.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No materials uploaded yet. Switch to Edit mode to add files.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {materials.map((m: any) => (
                                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">{m.title || m.file_name}</p>
                                        <p className="text-xs text-gray-400">{m.file_type || 'Document'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="homework">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Homework Tasks</h3>
                        <div className="text-muted-foreground p-8 text-center border rounded-md border-dashed">
                            Homework assignments linked natively to this specific lesson will appear here. Note: this table relies on homework IDs linked directly to `lesson_id`.
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="quizzes">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Pop Quizzes</h3>
                        <div className="text-muted-foreground p-8 text-center border rounded-md border-dashed">
                            In-lesson or immediate post-lesson quizzes.
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="exams">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Associated Exams</h3>
                        <div className="text-muted-foreground p-8 text-center border rounded-md border-dashed">
                            If this lesson serves as an Exam day, the exam interface and link gets attached here.
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
    );
}
