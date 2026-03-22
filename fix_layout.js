const fs = require('fs');
const file = 'src/app/[locale]/(portal)/admin/courses/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `    const handleCreateMeeting = () => {
        // Simulating the creation of a Google Meet link locally
        const randomString = Math.random().toString(36).substring(2, 12);
        const generatedLink = \`https://meet.google.com/\${randomString.substring(0, 3)}-\${randomString.substring(3, 7)}-\${randomString.substring(7)}\`;
        setMeetingLink(generatedLink);
    };

    return (
        <div className="relative min-h-[calc(100vh-120px)] w-full pb-20">
            {/* Header Section */}
            <div className="mb-8 flex items-center justify-between">
                {/* Save Button */}
                <div>
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-7 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black/80"
                    >
                        <Save className="h-4 w-4" />
                        <span>{copy.save}</span>
                    </button>
                </div>
                {/* Title & Back */}
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">{courseTitle || 'New Course'}</h1>
                    <Link
                        href={withAdminPortalPrefix('/admin/courses', locale)}
                        className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#71717a] transition-colors hover:text-[#111111]"
                    >
                        <span>{copy.back}</span>
                        <BackIcon className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="info" className="w-full" dir={isArabic ? 'rtl' : 'ltr'}>
                <div className="flex justify-end mb-6">
                    <TabsList className="bg-transparent space-x-2 space-x-reverse h-auto p-0 border-b border-[#e5e7eb] w-full justify-start rounded-none">
                        <TabsTrigger
                            value="info"
                            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3 font-semibold text-[#111111]"
                        >
                            <BookOpenIcon className="w-4 h-4 mr-2" />
                            {copy.tabs.info}
                        </TabsTrigger>
                        <TabsTrigger
                            value="lessons"
                            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3 font-medium text-[#71717a]"
                        >
                            {copy.tabs.lessons}
                        </TabsTrigger>
                        <TabsTrigger
                            value="assignments"
                            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3 font-medium text-[#71717a]"
                        >
                            {copy.tabs.assignments}
                        </TabsTrigger>
                        <TabsTrigger
                            value="exams"
                            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3 font-medium text-[#71717a]"
                        >
                            {copy.tabs.exams}
                        </TabsTrigger>
                        <TabsTrigger
                            value="live"
                            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#111111] data-[state=active]:bg-white data-[state=active]:shadow-none px-6 py-3 font-medium text-[#71717a]"
                        >
                            <Video className="w-4 h-4 mr-2 ml-2" />
                            {copy.tabs.live}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="info" className="mt-0 outline-none">
                    <div className="flex flex-col gap-6">

                        {/* Card 1: Course Details & Image Upload */}
                        <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm overflow-hidden bg-[#fafafa]">
                            <CardHeader className="pb-4 pt-6 bg-[#fafafa]">
                                <CardTitle className="text-[22px] font-bold text-[#111111] text-start">
                                    {copy.courseDetails.title}
                                </CardTitle>
                                <CardDescription className="text-[#a1a1aa] text-sm mt-1 text-start">
                                    {copy.courseDetails.subtitle}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
                                    
                                    {/* Forms Column (Right in RTL, so visually on the right side of the card) */}
                                    <div className="flex flex-col gap-6 lg:order-1 order-2">
                                        <div className="space-y-2 text-start flex flex-col items-end w-full">
                                            <label className="text-sm font-semibold text-[#111111] pl-4 self-stretch text-start">
                                                {copy.courseDetails.courseName}
                                            </label>
                                            <Input
                                                value={courseTitle}
                                                onChange={(e) => setCourseTitle(e.target.value)}
                                                className="h-[52px] w-full rounded-[14px] bg-white border border-[#e5e7eb] px-4 text-base focus-visible:ring-1 focus-visible:ring-[#111111] text-right"
                                            />
                                        </div>

                                        <div className="space-y-2 text-start flex flex-col items-end w-full">
                                            <label className="text-sm font-semibold text-[#111111] pl-4 self-stretch text-start">
                                                {copy.courseDetails.teacher}
                                            </label>
                                            <div className="relative w-full">
                                                <select
                                                    value={teacher}
                                                    onChange={(e) => setTeacher(e.target.value)}
                                                    className="w-full h-[52px] appearance-none rounded-[14px] border border-[#e5e7eb] bg-white px-4 py-2 text-base text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] text-right"
                                                    dir="rtl"
                                                >
                                                    <option value="ابراهيم محمد">ابراهيم محمد</option>
                                                    <option value="د. رحمة خليل">د. رحمة خليل</option>
                                                    <option value="Zainab elfadili Ibrahim">Zainab elfadili Ibrahim</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4">
                                                    <ChevronDown className="h-5 w-5 text-[#8a8a8a]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-start flex flex-col items-end w-full">
                                            <label className="text-sm font-semibold text-[#111111] pl-4 self-stretch text-start">
                                                {copy.courseDetails.details}
                                            </label>
                                            <div className="w-full rounded-[14px] border border-[#e5e7eb] bg-white overflow-hidden shadow-sm">
                                                <div className="flex flex-wrap items-center justify-end gap-1 border-b border-[#e5e7eb] bg-white p-[10px] sm:flex-nowrap">
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><Type className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><Link2 className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><ImageIcon className="w-[18px] h-[18px]" /></button>
                                                    <div className="w-px h-5 bg-[#e4e4e7] mx-1.5"></div>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><List className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><ListOrdered className="w-[18px] h-[18px]" /></button>
                                                    <div className="w-px h-5 bg-[#e4e4e7] mx-1.5"></div>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><Bold className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><Italic className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><Underline className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-md transition-colors"><Strikethrough className="w-[18px] h-[18px]" /></button>
                                                </div>
                                                <Textarea
                                                    value={details}
                                                    onChange={(e) => setDetails(e.target.value)}
                                                    className="w-full min-h-[160px] resize-none border-0 focus-visible:ring-0 p-5 bg-transparent text-[#27272a] text-[15px] leading-relaxed text-right"
                                                    dir="rtl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload Column (Visually on the left side) */}
                                    <div className="lg:order-2 order-1 flex items-stretch h-full">
                                        <div className="flex w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d4d4d8] bg-transparent p-10 text-center transition-colors hover:bg-white/50">
                                            <ImageIcon className="mb-6 h-[48px] w-[48px] text-[#a1a1aa]" strokeWidth={1} />
                                            <p className="mb-4 text-sm font-medium text-[#71717a]">
                                                {copy.upload.dragDrop}
                                            </p>
                                            <button
                                                type="button"
                                                className="mb-5 flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#111111] shadow-sm transition-colors hover:bg-[#f4f4f5]"
                                            >
                                                <UploadCloud className="h-[18px] w-[18px]" />
                                                <span>{copy.upload.button}</span>
                                            </button>
                                            <p className="text-[11px] text-[#a1a1aa]">
                                                {copy.upload.formats}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Meeting Details */}
                        <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm bg-[#fafafa]">
                            <CardHeader className="pb-4 pt-6 bg-[#fafafa]">
                                <div className="flex items-center justify-between flex-row-reverse w-full">
                                    <div className="flex flex-col text-start items-start">
                                        <CardTitle className="text-[22px] font-bold text-[#111111]">
                                            {copy.meeting.title}
                                        </CardTitle>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreateMeeting}
                                        className="flex items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80"
                                    >
                                        <Video className="h-[18px] w-[18px]" />
                                        <span>{copy.meeting.createMeeting}</span>
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4 text-start flex flex-col items-end w-full">
                                    <div className="flex items-center gap-2 text-start justify-end w-full">
                                        <label className="text-sm font-semibold text-[#111111]">
                                            {copy.meeting.meetingLink}
                                        </label>
                                        <Link2 className="w-[18px] h-[18px] text-[#8a8a8a]" />
                                    </div>
                                    <Input
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder={copy.meeting.meetingLinkPlaceholder}
                                        className="h-[52px] w-full rounded-[14px] bg-white border border-[#e5e7eb] px-5 focus-visible:ring-1 focus-visible:ring-[#111111] text-left text-[15px] text-[#71717a] font-mono"
                                        dir="ltr"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                <TabsContent value="lessons">{/* Placeholder */}</TabsContent>
                <TabsContent value="assignments">{/* Placeholder */}</TabsContent>
                <TabsContent value="exams">{/* Placeholder */}</TabsContent>
                <TabsContent value="live">{/* Placeholder */}</TabsContent>
            </Tabs>
        </div>
    );
`;

const splitString = "    return (";
const parts = content.split(splitString);

if (parts.length === 2) {
    const endSplit = "export function BookOpenIcon(props: any) {"; // Wait, check what's at the bottom
    // I know from view_file that at the end there is:
    // }
    // 
    // // Inline BookOpenIcon
    const newContent = parts[0] + replacement + '\n}\n\n' + content.slice(content.indexOf('// Inline BookOpenIcon'));
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Successfully updated component layout.');
} else {
    console.error('Failed to split file');
}
