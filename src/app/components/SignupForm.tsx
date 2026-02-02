'use client';

import { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/app/hooks/useTranslation';
import type { TranslationKey } from '@/app/lib/translations';

type UserRole = 'client' | 'provider';

interface SignupFormProps {
  defaultRole?: UserRole;
  onSubmit: (data: {
    fullName: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phone?: string;
    role: UserRole;
    specialties?: string[];
  }) => void;
}

export default function SignupForm({ defaultRole, onSubmit }: SignupFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
    role: defaultRole || 'client' as UserRole,
    specialties: [] as string[],
  });
  const [showSpecialties, setShowSpecialties] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const formatDobDdMmYyyy = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 8); // DDMMYYYY
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) return `${dd}/${mm}`;
    return `${dd}/${mm}/${yyyy}`;
  };

  const parseDobDdMmYyyyToIso = (dob: string): string | null => {
    const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);

    if (yyyy < 1900 || yyyy > 2100) return null;
    if (mm < 1 || mm > 12) return null;
    if (dd < 1 || dd > 31) return null;

    // Validate actual calendar date
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;

    const iso = `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    return iso;
  };

  const setPasswordAndMaybeClearError = (nextPassword: string) => {
    setFormData((prev) => {
      const next = { ...prev, password: nextPassword };
      if (passwordError && next.confirmPassword && next.password === next.confirmPassword) {
        setPasswordError('');
      }
      return next;
    });
  };

  const setConfirmPasswordAndMaybeClearError = (nextConfirmPassword: string) => {
    setFormData((prev) => {
      const next = { ...prev, confirmPassword: nextConfirmPassword };
      if (passwordError && next.password && next.password === next.confirmPassword) {
        setPasswordError('');
      }
      return next;
    });
  };

  // Calculate max date (18 years ago from today)
  const getMaxDate = (): string => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const CATEGORY_LABEL_TO_KEY: Partial<Record<string, TranslationKey>> = {
    'Home Maintenance & Repair': 'category.homeMaintenance',
    'Outdoor & Garden Work': 'category.outdoorGarden',
    'Moving & Transport': 'category.movingTransport',
    'Cleaning & Maintenance': 'category.cleaningMaintenance',
    'Construction & Renovation': 'category.constructionRenovation',
    'Technical & Installation': 'category.technicalInstallation',
    'Vehicle Services': 'category.vehicleServices',
    'Personal Assistance': 'category.personalAssistance',
    'Seasonal & Miscellaneous': 'category.seasonalMisc',
    Other: 'common.other',
  };

  const allSpecialties = [
    'Home Maintenance & Repair',
    'Outdoor & Garden Work',
    'Moving & Transport',
    'Cleaning & Maintenance',
    'Construction & Renovation',
    'Technical & Installation',
    'Vehicle Services',
    'Personal Assistance',
    'Seasonal & Miscellaneous',
    'Other',
  ];

  const toggleSpecialty = (label: string) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(label);
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter(s => s !== label)
          : [...prev.specialties, label],
      };
    });
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const iso = parseDobDdMmYyyyToIso(dateOfBirth);
    const birthDate = iso ? new Date(iso) : new Date('invalid');
    if (Number.isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDobDdMmYyyy(e.target.value);
    setFormData({ ...formData, dateOfBirth: formatted });
    setAgeError('');
    
    if (formatted.length === 10) {
      const iso = parseDobDdMmYyyyToIso(formatted);
      if (!iso) {
        setAgeError(t('auth.form.dateOfBirthRequired'));
        return;
      }

      const maxIso = getMaxDate();
      if (iso > maxIso) {
        setAgeError(t('auth.signup.ageTooYoung'));
        return;
      }

      const age = calculateAge(formatted);
      if (age < 18) {
        setAgeError(t('auth.signup.ageTooYoung'));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!formData.dateOfBirth) {
      setAgeError(t('auth.form.dateOfBirthRequired'));
      return;
    }

    const isoDob = parseDobDdMmYyyyToIso(formData.dateOfBirth);
    if (!isoDob) {
      setAgeError(t('auth.form.dateOfBirthRequired'));
      return;
    }
    
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18) {
      setAgeError(t('auth.signup.ageTooYoung'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t('auth.signup.passwordsDoNotMatch'));
      return;
    }
    
    setAgeError('');
    onSubmit({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      // Submit in ISO format to keep server/storage consistent.
      dateOfBirth: isoDob,
      phone: formData.phone,
      role: formData.role,
      specialties: formData.specialties,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-black">
          {t('auth.form.fullName')}
        </label>
        <input
          type="text"
          id="fullName"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-black"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black">
          {t('auth.form.email')}
        </label>
        <input
          type="email"
          id="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-black"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-black">
          {t('auth.form.dateOfBirth')}
        </label>
        <input
          type="text"
          id="dateOfBirth"
          required
          inputMode="numeric"
          autoComplete="bday"
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 text-black ${
            ageError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-violet-500 focus:ring-violet-500'
          }`}
          value={formData.dateOfBirth}
          onChange={handleDateOfBirthChange}
          placeholder="DD/MM/YYYY"
        />
        {ageError && (
          <p className="mt-1 text-sm text-red-600">{ageError}</p>
        )}
        <p className="mt-1 text-sm text-gray-600">{t('auth.signup.minAgeNote')}</p>
      </div>

      {formData.role === 'provider' && (
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-black">
            {t('auth.form.telephoneOptional')}
          </label>
          <input
            type="tel"
            id="phone"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-black"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t('auth.form.telephonePlaceholder')}
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-black">
          {t('auth.form.password')}
        </label>
        <input
          type="password"
          id="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-black"
          value={formData.password}
          onChange={(e) => setPasswordAndMaybeClearError(e.target.value)}
        />
        <p className="mt-1 text-sm text-black">{t('auth.form.passwordMinHint')}</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
          {t('auth.form.confirmPassword')}
        </label>
        <input
          type="password"
          id="confirmPassword"
          required
          minLength={8}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 text-black ${
            passwordError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-violet-500 focus:ring-violet-500'
          }`}
          value={formData.confirmPassword}
          onChange={(e) => setConfirmPasswordAndMaybeClearError(e.target.value)}
        />
        {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
      </div>

      {formData.role === 'provider' && (
        <div className="relative">
          <p className="block text-sm font-medium text-black mb-1">
            {t('auth.form.categoriesYouCanDo')}
          </p>
          <p className="text-xs text-gray-600 mb-2">
            {t('auth.form.categoriesHelp')}
          </p>
          <button
            type="button"
            onClick={() => setShowSpecialties((v) => !v)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 flex items-center justify-between bg-white"
          >
            <span className="truncate text-sm">{t('auth.common.choose')}</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-500 ml-2" />
          </button>
          {showSpecialties && (
            <div className="absolute z-20 mt-1 w-full rounded-md border-2 border-violet-300 bg-white shadow-md max-h-56 overflow-auto">
              {allSpecialties.map((label) => {
                const selected = formData.specialties.includes(label);
                const key = CATEGORY_LABEL_TO_KEY[label];
                const displayLabel = key ? t(key) : label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleSpecialty(label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-violet-50 text-black ${
                      selected ? 'bg-violet-50' : ''
                    }`}
                  >
                    <span>{displayLabel}</span>
                    {selected && <CheckIcon className="h-4 w-4 text-violet-600" />}
                  </button>
                );
              })}
            </div>
          )}
          {formData.specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.specialties.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 border border-violet-300"
                >
                  {(() => {
                    const key = CATEGORY_LABEL_TO_KEY[label];
                    return key ? t(key) : label;
                  })()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
      >
        {t('auth.signup.createAccount')}
      </button>
    </form>
  );
} 