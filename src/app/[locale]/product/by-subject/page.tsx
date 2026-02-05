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
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-brand-dark">المواد الدراسية حسب المادة</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayProducts.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <BookOpen className="w-12 h-12 opacity-50" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">{product.title}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {product.duration_hours} ساعة
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  +100 طالب
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto flex items-center justify-between">
              <span className="font-bold text-brand-primary">{product.price} ج.م</span>
              <Button onClick={() => addToCart({
                id: product.id,
                title: product.title,
                description: product.description,
                price: `${product.price} ج.م`,
                duration: `${product.duration_hours} ساعة`,
                students: "+100",
                image: product.image_url || "",
              })}>
                أضف للسلة
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
