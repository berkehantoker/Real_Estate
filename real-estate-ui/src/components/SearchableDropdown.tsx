"use client";

import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  openOnInput?: boolean;
  className?: string;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Ara...',
  disabled = false,
  openOnInput = false,
  className = '',
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapanır
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Arama filtresi - Türkçe karakter uyumlu
  const filteredOptions = searchTerm.trim()
    ? options.filter((opt) =>
        opt.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
      )
    : options;

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => {
          if (!disabled && !openOnInput) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
          }
        }}
        className={`flex items-center w-full px-4 py-3 bg-gray-50 border rounded-xl cursor-pointer transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-blue-400 focus-within:border-blue-500'
        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200'}`}
      >
        {openOnInput || isOpen ? (
          <input
            type="text"
            value={isOpen ? searchTerm : (openOnInput ? searchTerm : value)}
            onChange={(e) => {
              const val = e.target.value;
              setSearchTerm(val);
              if (openOnInput && val.trim()) setIsOpen(true);
              if (openOnInput && !val.trim()) setIsOpen(false);
            }}
            placeholder={value || placeholder}
            className="flex-1 bg-transparent border-none outline-none text-gray-700"
            autoFocus={isOpen}
            onFocus={() => {
              if (openOnInput && searchTerm.trim()) setIsOpen(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (openOnInput && searchTerm.trim()) setIsOpen(true);
            }}
          />
        ) : (
          <span className={`flex-1 text-left ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
        )}

        <div className="flex items-center gap-1">
          {value && !isOpen && (
            <button onClick={handleClear} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
              <FiX className="text-sm" />
            </button>
          )}
          <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">Sonuç bulunamadı</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors hover:bg-blue-50 ${
                  option === value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}