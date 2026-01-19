import LoginForm from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
    return (
        <LoginForm
            role="admin"
            title="تسجيل دخول الإدارة"
            description="يرجى إدخال بيانات حساب المسؤول"
        />
    );
}
