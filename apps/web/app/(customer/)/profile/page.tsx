'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { User, Mail, ShieldAlert, Heart, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [allergies, setAllergies] = React.useState<string[]>(['Peanuts', 'Dairy']);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully!');
    }, 1500);
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy],
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-gray-500 hover:text-gray-900 flex items-center">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Avatar Section */}
        <div className="p-8 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-[#F59E0B] border-4 border-white shadow-md">
                <User className="w-12 h-12" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-[#F59E0B] transition-colors">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
              <p className="text-sm text-gray-500">Member since April 2026</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#F59E0B]">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Info Section */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-[#F59E0B]" />
                Full Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#F59E0B]" />
                Email Address
              </label>
              <input
                type="email"
                defaultValue="john@example.com"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
              Allergies & Dietary Restrictions
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'].map((allergy) => (
                <button
                  key={allergy}
                  onClick={() => toggleAllergy(allergy)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold transition-all border-2
                    ${
                      allergies.includes(allergy)
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300'
                    }
                  `}
                >
                  {allergy}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-[#F59E0B]" />
              Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div>
                  <p className="font-bold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500 italic">
                    Get updates on your orders and rewards
                  </p>
                </div>
                <div className="w-12 h-6 bg-[#F59E0B] rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
