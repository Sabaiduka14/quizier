"use client"
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">QuizMaster AI</h1>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto mt-28 px-4 sm:px-6 lg:px-8 py-16 flex items-center">
        <div className="w-1/2 pr-8">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-6">
            Create AI-Powered Quizzes in Minutes
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            QuizMaster AI uses advanced artificial intelligence to generate custom quizzes from any content. Perfect for educators, students, and curious minds.
          </p>
          <div className="flex space-x-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-1/2">
          <img src="/image.png" alt="QuizMaster AI" className="w-full h-auto rounded-lg shadow-lg" />
        </div>
      </main>
    </div>
  );
}
