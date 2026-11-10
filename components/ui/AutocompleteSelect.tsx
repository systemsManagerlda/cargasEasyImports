/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
} from 'react';

import { cn } from '../../lib/utils/cn';
import {
  Search,
  X,
  ChevronDown,
} from 'lucide-react';

export interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
  data?: any;
}

interface AutocompleteSelectProps {
  label: string;
  options: AutocompleteOption[];
  value: string;
  onChange: (
    value: string,
    option?: AutocompleteOption
  ) => void;
  placeholder?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  renderOption?: (
    option: AutocompleteOption
  ) => React.ReactNode;
  noOptionsMessage?: string;
}

export const AutocompleteSelect: React.FC<
  AutocompleteSelectProps
> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  error,
  loading = false,
  disabled = false,
  required = false,
  className,
  containerClassName,
  renderOption,
  noOptionsMessage = 'Nenhuma opção encontrada',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * filteredOptions é um valor derivado de:
   * - options
   * - searchTerm
   *
   * Portanto não precisa ser armazenado em state.
   */
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return options;
    }

    return options.filter((option) => {
      const labelMatch = option.label
        .toLowerCase()
        .includes(term);

      const sublabelMatch = option.sublabel
        ?.toLowerCase()
        .includes(term);

      return labelMatch || sublabelMatch;
    });
  }, [options, searchTerm]);

  /*
   * Fecha o dropdown quando o usuário clica fora.
   *
   * Este effect é válido porque ele:
   * - registra um listener externo
   * - remove o listener no cleanup
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const handleSelect = (
    option: AutocompleteOption
  ) => {
    onChange(option.value, option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('', undefined);
    setSearchTerm('');

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const selectedOption = useMemo(
    () =>
      options.find(
        (option) => option.value === value
      ),
    [options, value]
  );

  return (
    <div
      className={cn(
        'w-full relative',
        containerClassName
      )}
      ref={wrapperRef}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}

          {required && (
            <span className="text-red-500 ml-1">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-text',
            'focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-transparent',
            'transition-all duration-200',
            disabled &&
              'bg-gray-100 cursor-not-allowed',
            error &&
              'border-red-500 focus-within:ring-red-500',
            'bg-gray-50 border-gray-200',
            className
          )}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />

          <input
            ref={inputRef}
            type="text"
            className={cn(
              'flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400',
              'min-w-0',
              disabled &&
                'cursor-not-allowed'
            )}
            placeholder={
              selectedOption
                ? selectedOption.label
                : placeholder
            }
            value={
              isOpen
                ? searchTerm
                : selectedOption?.label || ''
            }
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
          />

          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {noOptionsMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors',
                    'border-b border-gray-50 last:border-0',
                    option.value === value &&
                      'bg-gray-50'
                  )}
                  onClick={() =>
                    handleSelect(option)
                  }
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div>
                      <div className="text-sm text-gray-700">
                        {option.label}
                      </div>

                      {option.sublabel && (
                        <div className="text-xs text-gray-400">
                          {option.sublabel}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};