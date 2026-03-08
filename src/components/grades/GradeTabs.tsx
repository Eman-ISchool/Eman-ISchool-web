'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function GradeTabs({ grade }: { grade: any }) {

    return (
        <Tabs defaultValue="info" className="w-full">
            {/* Horizontal Tabs List aligned left-to-mid */}
            <TabsList className="justify-start border-b rounded-none w-full bg-transparent p-0">
                <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Information</TabsTrigger>
                <TabsTrigger value="courses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Courses</TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Table-Calendar</TabsTrigger>
                <TabsTrigger value="fees" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Fees</TabsTrigger>
                <TabsTrigger value="students" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">Students</TabsTrigger>
            </TabsList>

            <div className="mt-6">
                <TabsContent value="info">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Grade Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{grade.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="font-medium">{grade.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Slug</p>
                                    <p className="font-medium">{grade.slug}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="courses">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Courses for this Grade</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* We will render Course Cards here. They should fetching /api/courses?gradeId=grade.id */}
                                <div className="text-muted-foreground p-4 border rounded-md border-dashed text-center">
                                    No courses currently mapped.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Grade Schedule</h3>
                            <div className="text-muted-foreground">
                                Calendar view showing all live sessions across courses in this grade.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fees">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Fee Structure</h3>
                            <div className="text-muted-foreground">
                                Subscription packages and active promos for this grade level.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Enrolled Students</h3>
                            <div className="text-muted-foreground">
                                Students enrolled across any course in this grade.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
    );
}
