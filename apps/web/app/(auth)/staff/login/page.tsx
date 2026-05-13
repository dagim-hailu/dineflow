'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Lock, Mail, Eye, EyeOff, ChefHat, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffLoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. GraphQL login to get user details and set dineflow_token cookie in browser
      await login(email, password);

      // 2. NextAuth login to set authjs.session-token for Next.js middleware
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Fetch session to determine role and redirect accordingly
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      setIsLoading(false);
      toast.success('Welcome back!');

      const role = session?.user?.role?.toLowerCase();
      if (role === 'manager' || role === 'admin') {
        router.push('/manager');
      } else if (role === 'kitchen') {
        router.push('/kitchen');
      } else if (role === 'waiter') {
        router.push('/waiter');
      } else {
        router.push('/');
      }
    } catch (err) {
      setIsLoading(false);
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
      <a
        href="/"
        className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back to Site
      </a>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-[#F59E0B] text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ChefHat className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Staff Portal</h1>
          <p className="text-white/80 italic">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-[#F59E0B]" />
              Staff ID / Email
            </label>
            <input
              type="email"
              placeholder="chef@dineflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-[#F59E0B]" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F59E0B]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F59E0B] py-6 rounded-xl text-lg font-bold hover:bg-yellow-500 transition-all text-white shadow-lg"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>

          <div className="pt-4 text-center">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-[#F59E0B] transition-colors underline-offset-4 hover:underline"
            >
              Forgot password? Contact Administrator
            </a>
          </div>
        </form>
      </div>

      <p className="mt-8 text-gray-500 text-sm">
        © 2026 DineFlow Restaurant Group. All rights reserved.
      </p>
    </div>
  );
}
