import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { ToolbarButtonProps, ToolbarSelectProps, ToolbarDropdownProps, ColorPickerProps } from '../../../types/EditorTypes';

// Toolbar Button Component
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
  size = 'sm',
  variant = 'default'
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`${size === 'sm' ? 'p-1.5 text-xs' : 'p-2 text-sm'} rounded border font-medium transition-all duration-200 ${isActive
      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
      : variant === 'primary'
        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        : variant === 'danger'
          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

// Toolbar Select Component
export const ToolbarSelect: React.FC<ToolbarSelectProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select...',
  width = 'min-w-[100px]'
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={`px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${width}`}
  >
    <option value="">{placeholder}</option>
    {options.map((option: { value: string; label: string }) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Dropdown Component for More Options
export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({
  label,
  children,
  icon,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {isOpen && (
        <div className={`absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px] max-h-80 overflow-y-auto ${align === 'right' ? 'right-0' : 'left-0'
          }`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Color Picker Component
export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorSelect,
  currentColor = '#000000'
}) => {
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61e4d', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
  ];

  return (
    <div className="p-3">
      <div className="grid grid-cols-10 gap-1 mb-3">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
              }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="space-y-2">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onColorSelect(e.target.value)}
          className="w-full h-8 rounded border border-gray-300 cursor-pointer"
        />
        <button
          onClick={() => onColorSelect('')}
          className="w-full px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
        >
          Remove Color
        </button>
      </div>
    </div>
  );
};