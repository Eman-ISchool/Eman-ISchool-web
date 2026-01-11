"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users } from "lucide-react";
import { useCartStore } from "@/lib/store";

// Define TypeScript Interface matching Supabase response
interface Course {
  id: string; // Changed from _id to id
  title: string;
  description: string;
  price: number;
  duration_hours: number; // Changed from duration
  image_url: string | null; // Changed from image object
  grade_level: string; // Changed from gradeLevel
  // Optional: add enrollments count if API returns it
}

export default function ProductsPage() {
  const addToCart = useCartStore((state) => state.addToCart);
  const [products, setProducts] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/courses?published=true');
        const data = await res.json();

        if (data.courses) {
          setProducts(data.courses);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xl">جاري تحميل الدورات...</div>;
  }

  const displayProducts = products.length > 0 ? products : [
    {
      id: "mock-course-1",
      title: "اللغة العربية - الصف الأول الإعدادي",
      description: "شرح شامل لمنهج اللغة العربية مع تدريبات مكثفة",
      price: 450,
      duration_hours: 30,
      image_url: null,
      grade_level: "Grade 7"
    },
    {
      id: "mock-course-2",
      title: "الرياضيات - الصف الثاني الإعدادي",
      description: "كورس تأسيسي في الجبر والهندسة",
      price: 550,
      duration_hours: 45,
      image_url: null,
      grade_level: "Grade 8"
    },
    {
      id: "mock-course-3",
      title: "العلوم - الصف الثالث الإعدادي",
      description: "تبسيط مفاهيم الفيزياء والكيمياء والأحياء",
      price: 500,
      duration_hours: 40,
      image_url: null,
      grade_level: "Grade 9"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-brand-dark">المواد الدراسية</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          اختر المادة المناسبة لمستواك الدراسي وابدأ رحلة التفوق مع أفضل المعلمين.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayProducts.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">لا توجد مواد دراسية متاحة حالياً.</p>
        ) : (
          displayProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
              <div className="aspect-video bg-gray-200 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Eduverse';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <BookOpen className="w-12 h-12 opacity-50" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl line-clamp-1">{product.title}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {product.duration_hours || 0} ساعة
                  </div>
                  {/* Placeholder for students count */}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    +100 طالب
                  </div>
                </div>
                <div className="text-2xl font-bold text-brand-primary">{product.price} ج.م</div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-brand-dark text-white hover:bg-black"
                  onClick={() => {
                    const cartItem = {
                      id: product.id,
                      title: product.title,
                      description: product.description,
                      price: `${product.price} ج.م`,
                      duration: `${product.duration_hours} ساعة`,
                      students: "+100",
                      image: product.image_url || ""
                    };
                    addToCart(cartItem);
                    alert('تمت الإضافة للسلة بنجاح');
                  }}
                >
                  اضف للسلة
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
