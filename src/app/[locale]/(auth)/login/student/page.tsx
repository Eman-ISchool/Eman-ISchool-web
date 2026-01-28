import LoginForm from '@/components/auth/LoginForm';

export default function StudentLoginPage() {
    return (
        <LoginForm
            role="student"
            title="تسجيل دخول الطالب"
            description="مرحباً بك في رحلتك التعليمية"
        />
    );
}
