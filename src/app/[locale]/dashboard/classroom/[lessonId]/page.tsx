'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, Mic, VideoOff, MicOff, AlertTriangle, CheckCircle, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { validateMeetLinkForJoining } from '@/lib/meet-utils';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

export default function ClassroomPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const lessonId = params.lessonId as string;

    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [micActive, setMicActive] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<'pending' | 'present' | 'absent'>('pending');
    const [randomCheckVisible, setRandomCheckVisible] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    // Fetch Lesson Details
    useEffect(() => {
        const fetchLesson = async () => {
            try {
                // We're using the attendance API to get lesson details implicitly or we could fetch lessons
                // For now, let's assume we can get it from the lessons API
                // But simplified, let's just get the lesson by ID
                const res = await fetch(`/api/lessons?id=${lessonId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setLesson(data.find(l => l._id === lessonId));
                    } else {
                        setLesson(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch lesson', error);
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) {
            fetchLesson();
        }
    }, [lessonId]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Random Verification Logic
    useEffect(() => {
        if (attendanceStatus === 'present') {
            // Trigger random check every 5-15 minutes
            const interval = setInterval(() => {
                setRandomCheckVisible(true);
                // Auto-fail if not checked within 1 minute
                const timeout = setTimeout(() => {
                    if (randomCheckVisible) { // If still visible
                        // Ideally we would mark them as 'away' or 'absent' in backend
                        console.log('Random check failed - user away');
                    }
                }, 60000);

                return () => clearTimeout(timeout);

            }, Math.random() * (15 * 60 * 1000 - 5 * 60 * 1000) + 5 * 60 * 1000); // Random between 5-15 mins

            return () => clearInterval(interval);
        }
    }, [attendanceStatus]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraActive(true);
            setMicActive(true);
            setPermissionGranted(true);

            // Mark attendance as present once camera is on
            await recordAttendance('join');
            setAttendanceStatus('present');

        } catch (err) {
            console.error("Error accessing media devices:", err);
            alert("يرجى السماح بالوصول للكاميرا والميكروفون لتسجيل الحضور");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraActive(false);
            setMicActive(false);
            setAttendanceStatus('absent'); // Or pending
        }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicActive(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCameraActive(videoTrack.enabled);
            }
        }
    };

    const recordAttendance = async (action: 'join' | 'leave') => {
        try {
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    action
                })
            });
        } catch (error) {
            console.error('Failed to record attendance', error);
        }
    };

    const openMeet = () => {
        if (!lesson?.meetLink) {
            alert('لا يوجد رابط اجتماع متاح لهذا الدرس. يرجى التواصل مع المعلم.');
            return;
        }

        // Validate the Meet link before opening
        const validation = validateMeetLinkForJoining(lesson.meetLink);
        if (!validation.isValid) {
            alert(validation.error || 'رابط الاجتماع غير صالح');
            return;
        }

        // Open the valid Meet link
        window.open(lesson.meetLink, '_blank');
    };

    const verifyPresence = () => {
        setRandomCheckVisible(false);
        // Log verification success to backend if needed
        alert("تم تأكيد حضورك ✅");
    };

    if (loading) return <div className="p-10 text-center">جاري تحميل الفصل...</div>;

    if (!lesson) return <div className="p-10 text-center text-red-500">الدرس غير موجود</div>;

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(lesson.startDateTime).toLocaleString('ar-EG')}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${attendanceStatus === 'present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {attendanceStatus === 'present' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {attendanceStatus === 'present' ? 'تم تسجيل الحضور' : 'بانتظار تفعيل الكاميرا'}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content - Cam & Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-2 border-brand-primary/20 overflow-hidden bg-black/5 relative">
                        <CardHeader className="bg-white border-b">
                            <CardTitle className="flex justify-between items-center">
                                <span>الكاميرا المباشرة</span>
                                {permissionGranted && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={toggleMic} className={!micActive ? 'bg-red-50 text-red-500 border-red-200' : ''}>
                                            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={toggleVideo} className={!cameraActive ? 'bg-red-50 text-red-500 border-red-200' : ''}>
                                            {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 relative aspect-video bg-black flex items-center justify-center">
                            {!permissionGranted ? (
                                <div className="text-center text-white p-6 space-y-4">
                                    <ShieldCheck className="w-16 h-16 mx-auto text-brand-primary" />
                                    <h3 className="text-xl font-bold">مطلوب تفعيل الكاميرا</h3>
                                    <p className="text-gray-400 max-w-md mx-auto">
                                        يجب تفعيل الكاميرا لتسجيل الحضور والسماح لك بالانضمام للحصة.
                                        نحن نستخدم تقنية التحقق الذكي لضمان تواجد الطلاب.
                                    </p>
                                    <Button onClick={startCamera} size="lg" className="bg-brand-primary text-black hover:bg-yellow-400 font-bold">
                                        <Video className="w-4 h-4 ml-2" />
                                        تفعيل الكاميرا وبدء الدرس
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                                    />
                                    {!cameraActive && (
                                        <div className="text-white flex flex-col items-center">
                                            <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                                            <p>الكاميرا متوقفة</p>
                                        </div>
                                    )}
                                    {/* Random Verification Modal Overlay */}
                                    {randomCheckVisible && (
                                        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                                            <div className="bg-white rounded-xl p-6 text-center space-y-4 max-w-sm animate-in zoom-in duration-300">
                                                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
                                                <h3 className="text-xl font-bold">التحقق العشوائي!</h3>
                                                <p className="text-gray-600">للتحقق من تواجدك، يرجى الضغط على الزر أدناه خلال 30 ثانية.</p>
                                                <Button onClick={verifyPresence} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">
                                                    أنا موجود! ✅
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {permissionGranted && (
                        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                            <AlertTitle className="flex items-center gap-2 font-bold">
                                <ExternalLink className="w-4 h-4" />
                                الخطوة التالية
                            </AlertTitle>
                            <AlertDescription className="mt-2">
                                تم تسجيل حضورك بنجاح. يمكنك الآن الانتقال إلى Google Meet لبدء الحصة الدراسية.
                                <br />
                                <strong>ملاحظة:</strong> يرجى إبقاء هذه الصفحة مفتوحة لضمان استمرار تسجيل الحضور.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Sidebar - Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>إجراءات الدرس</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={openMeet}
                                disabled={!permissionGranted}
                                className="w-full h-12 text-lg bg-brand-primary text-black hover:bg-yellow-400 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ExternalLink className="w-5 h-5 ml-2" />
                                فتح Google Meet
                            </Button>

                            <div className="text-xs text-center text-gray-500">
                                يتم فتح الاجتماع في نافذة جديدة
                            </div>

                            <hr className="border-gray-100" />

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => {
                                    if (confirm('هل تريد بالتأكيد مغادرة الدرس؟')) {
                                        recordAttendance('leave');
                                        router.push(withLocalePrefix('/dashboard', locale));
                                    }
                                }}
                            >
                                مغادرة الدرس
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-500">حالة الاتصال</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">الكاميرا</span>
                                {cameraActive ? <span className="text-green-600 text-xs font-bold">نشط</span> : <span className="text-red-500 text-xs font-bold">متوقف</span>}
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">الحضور</span>
                                <span className="text-green-600 text-xs font-bold">{attendanceStatus === 'present' ? 'مسجل' : 'غير مسجل'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
