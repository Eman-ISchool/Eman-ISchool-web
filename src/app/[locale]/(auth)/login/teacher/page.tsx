import LoginForm from '@/components/auth/LoginForm';

export default function TeacherLoginPage() {
    return (
        <LoginForm
            role="teacher"
            title="تسجيل دخول المعلم"
            description="مرحباً بك، يرجى تسجيل الدخول للمتابعة"
        />
    );
}
