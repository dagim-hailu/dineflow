'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      toast({
        title: t('registrationFailed'),
        description: t('passwordsDoNotMatch'),
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    try {
      await register({ displayName, email, password });

      toast({
        title: t('registrationSuccess'),
        description: t('registrationSuccessDesc'),
        duration: 3000,
      });

      router.push('/login');
      router.refresh();
    } catch (err) {
      toast({
        title: t('registrationFailed'),
        description: error || 'An unexpected error occurred.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image 
              src="/logo.png" 
              alt="Cook Solution" 
              width={120} 
              height={120} 
              className="h-20 w-auto mx-auto object-contain bg-white rounded-xl p-2" 
            />
          </Link>
          <p className="text-gray-300">{t('createAccount')}</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-[#0F172A]">
              {t('join')}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {t('enterDetails')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                    {t('displayName')}
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder={t('displayNamePlaceholder')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="h-12 text-base px-4 border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base px-4 border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base px-4 border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {t('confirmPassword')}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 text-base px-4 border-gray-300 focus:border-[#F59E0B] focus:ring-[#F59E0B]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#F59E0B] hover:bg-yellow-600 text-white font-bold text-base rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('registering')}
                  </>
                ) : (
                  t('registerSubmit')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('hasAccount')}{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#F59E0B] hover:text-yellow-600 transition-colors"
                >
                  {t('signInHere')}
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                {t('agreeTerms')}{' '}
                <Link href="/terms" className="text-[#F59E0B] hover:underline">
                  {t('terms')}
                </Link>{' '}
                {t('and')}{' '}
                <Link href="/privacy" className="text-[#F59E0B] hover:underline">
                  {t('privacy')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Guest notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            {t('guestTitle')}{' '}
            <Link href="/" className="text-[#F59E0B] hover:text-yellow-400 font-medium">
              {t('guestLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
