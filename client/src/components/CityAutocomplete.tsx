/**
 * City Autocomplete Component
 * Intelligent suggestions for Indian cities filtered by state
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { searchCities } from '@/lib/india-cities';
import { Search, X } from 'lucide-react';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  state?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  state,
  placeholder = 'Type city name...',
  disabled = false,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update suggestions when input or state changes
  useEffect(() => {
    if (inputValue.length >= 1) {
      const filtered = searchCities(inputValue, state);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [inputValue, state]);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSelectSuggestion = (city: string) => {
    setInputValue(city);
    onChange(city);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 1 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="h-10 sm:h-9 pl-9 pr-9"
          data-testid="input-city"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
            data-testid="button-clear-city"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-64 overflow-y-auto"
          data-testid="dropdown-cities"
        >
          {suggestions.map((city, index) => (
            <button
              key={city}
              onClick={() => handleSelectSuggestion(city)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                selectedIndex === index
                  ? 'bg-[#601a29] text-white'
                  : 'hover:bg-gray-50'
              }`}
              type="button"
              data-testid={`option-city-${city}`}
            >
              {city}
              {state && (
                <span className="text-xs ml-2 opacity-60">
                  {state}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {inputValue.length >= 1 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 p-3">
          <p className="text-xs text-gray-500 text-center">
            No cities found for "{inputValue}"
          </p>
        </div>
      )}
    </div>
  );
};
