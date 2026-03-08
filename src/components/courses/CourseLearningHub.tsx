'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectList } from "@/components/teacher/SubjectList";

export function CourseLearningHub({ course, subjects, locale }: { course: any, subjects: any[], locale: string }) {
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="justify-start border-b rounded-none w-full bg-transparent p-0 mb-6 pb-px flex-wrap gap-2 md:gap-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 md:px-6">Overview</TabsTrigger>
                <TabsTrigger value="topics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 md:px-6">Topics</TabsTrigger>
                <TabsTrigger value="sessions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 md:px-6">Live Sessions</TabsTrigger>
                <TabsTrigger value="people" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 md:px-6">People</TabsTrigger>
                <TabsTrigger value="materials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 md:px-6">Materials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Course Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Title</p>
                                <p className="font-medium">{course.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium">{course.is_published ? 'Published' : 'Draft'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium">{course.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="topics">
                <div className="bg-white rounded-lg border p-6 shadow-sm">
                    {/* For backward compatibility temporarily, we render the SubjectList 
                        assuming Subjects are acting as "Modules" inside a Course. */}
                    <SubjectList
                        courseId={course.id}
                        initialSubjects={subjects || []}
                        locale={locale}
                    />
                </div>
            </TabsContent>

            <TabsContent value="sessions">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Live Sessions</h3>
                        <div className="text-muted-foreground">
                            Calendar view showing all upcoming and past live sessions for this specific course.
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="materials">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Course Materials & Attachments</h3>
                        <div className="text-muted-foreground">
                            Global materials attached to the course (independent of specific lessons).
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="people">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Enrolled Students</h3>
                        <div className="text-muted-foreground">
                            Student roster, grades, and quick-attendance overview.
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
