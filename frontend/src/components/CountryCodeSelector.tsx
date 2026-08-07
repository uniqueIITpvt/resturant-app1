'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    dialCode: '+1',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    dialCode: '+1',
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    dialCode: '+91',
  },
];

interface CountryCodeSelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  disabled?: boolean;
}

export default function CountryCodeSelector({
  selectedCountry,
  onCountryChange,
  disabled = false,
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center px-3 py-3 border-2 border-r-0 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'border-orange-500' : 'border-gray-200'}`}
      >
        <span className='text-lg mr-2'>{selectedCountry.flag}</span>
        <span className='text-sm font-medium text-gray-700 mr-1'>
          {selectedCountry.dialCode}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50'>
          <div className='py-1'>
            {countries.map((country) => (
              <button
                key={country.code}
                type='button'
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedCountry.code === country.code
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700'
                }`}
              >
                <span className='text-lg mr-3'>{country.flag}</span>
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{country.name}</div>
                  <div className='text-xs text-gray-500'>
                    {country.dialCode}
                  </div>
                </div>
                {selectedCountry.code === country.code && (
                  <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the countries array and Country type for use in other components
export { countries, type Country };
