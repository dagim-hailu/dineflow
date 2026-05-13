'use client';

import * as React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { User, Mail, ShieldAlert, Heart, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { GET_CURRENT_USER } from '@/lib/graphql/profile';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      displayName
      profileImageUrl
    }
  }
`;

const ALLERGIES_OPTIONS = ['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];

export default function ProfileSettingsPage() {
  const t = useTranslations('Profile');
  const tAllergy = useTranslations('Allergies');
  const { user: authUser, getCurrentUser } = useAuthStore();
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [allergies, setAllergies] = React.useState<string[]>([]);

  const { data, loading } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (d) => {
      if (d?.me) {
        setDisplayName(d.me.displayName ?? '');
        setEmail(d.me.email ?? '');
        try {
          const prefs =
            typeof d.me.preferences === 'string' ? JSON.parse(d.me.preferences) : d.me.preferences;
          if (prefs?.allergies) setAllergies(prefs.allergies);
        } catch {}
      }
    },
  });

  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE);

  const handleSave = async () => {
    try {
      await updateProfile({
        variables: {
          input: {
            displayName,
            preferences: JSON.stringify({ allergies }),
          },
        },
      });
      await getCurrentUser();
      toast.success(t('updateSuccess'));
    } catch (err: any) {
      toast.error(err?.message ?? t('updateError'));
    }
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy],
    );
  };

  const me = data?.me;
  const memberSinceDate = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-gray-500 hover:text-gray-900 flex items-center">
          <ArrowLeft className="w-5 h-5 mr-1" />
          {t('back')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Avatar Section */}
          <div className="p-8 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                {me?.profileImageUrl ? (
                  <img
                    src={me.profileImageUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-[#F59E0B] border-4 border-white shadow-md">
                    <User className="w-12 h-12" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-[#F59E0B] transition-colors">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{displayName || t('yourName')}</h2>
                {memberSinceDate && (
                  <p className="text-sm text-gray-500">
                    {t('memberSince')} {memberSinceDate}
                  </p>
                )}
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 capitalize">
                  {me?.role ?? authUser?.role ?? 'customer'}
                </span>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#F59E0B] hover:bg-yellow-500"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? t('saving') : t('saveChanges')}
            </Button>
          </div>

          {/* Info Section */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#F59E0B]" />
                  {t('displayName')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-[#F59E0B]" />
                  {t('emailAddress')}
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
                {t('allergies')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES_OPTIONS.map((allergy) => (
                  <button
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                      allergies.includes(allergy)
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {tAllergy(allergy as any)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
