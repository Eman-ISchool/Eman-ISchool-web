import Link from 'next/link';
import { Globe } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full bg-brand-dark text-white py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* About */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-brand-primary">Eman-Academy</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        المنصة الوحيدة المتخصصة في تحضير أبناء المصريين بالخارج للامتحانات المصرية باحترافية.
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                        <Globe className="w-4 h-4" />
                        <span>للعائلات المصرية في الخارج</span>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-brand-primary">روابط سريعة</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/about-us" className="hover:text-white">من نحن</Link></li>
                        <li><Link href="/national-school" className="hover:text-white">المنهج المصري</Link></li>
                        <li><Link href="/al-azhar-school" className="hover:text-white">المنهج الأزهري</Link></li>
                        <li><Link href="/vr-eduverse" className="hover:text-white">تجربة VR التعليمية ✨</Link></li>
                        <li><Link href="/policy" className="hover:text-white">سياسة الخصوصية</Link></li>
                    </ul>
                </div>

                {/* Features */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-brand-primary">الميزات الأساسية</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/exam-simulation" className="hover:text-white">محاكاة الامتحانات</Link></li>
                        <li><Link href="/parent-dashboard" className="hover:text-white">لوحة ولي الأمر</Link></li>
                        <li><Link href="/product/by-subject" className="hover:text-white">المواد الدراسية</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-brand-primary">تواصل معنا</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>info@eman-academy.ae</li>
                        <li>+971 50 569 2091</li>
                    </ul>
                    <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">نخدم العائلات المصرية في:</p>
                        <div className="flex flex-wrap gap-2">
                            {['🇦🇪', '🇸🇦', '🇰🇼', '🇶🇦', '🇧🇭', '🇴🇲', '🇩🇪', '🇬🇧', '🇺🇸'].map((flag, i) => (
                                <span key={i} className="text-lg">{flag}</span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Eman-Academy. جميع الحقوق محفوظة.</p>
                <p className="mt-2 text-xs text-gray-600">
                    المنصة الأولى والوحيدة المتخصصة لجاهزية الامتحانات المصرية للمصريين بالخارج
                </p>
            </div>
        </footer>
    );
}
