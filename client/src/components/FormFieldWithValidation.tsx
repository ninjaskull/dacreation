/**
 * Form Field with Real-time Validation Feedback
 * Shows progressive validation messages as user types
 */

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ValidationFeedback, validateField } from '@/lib/validation-rules';

interface FormFieldWithValidationProps {
  fieldName: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}

export const FormFieldWithValidation: React.FC<FormFieldWithValidationProps> = ({
  fieldName,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
}) => {
  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Only validate if field has content or is required
      if (newValue || required) {
        const result = validateField(fieldName, newValue);
        setFeedback(result);
      } else {
        setFeedback(null);
      }
    },
    [fieldName, onChange, required]
  );

  const handleBlur = () => {
    if (value) {
      const result = validateField(fieldName, value);
      setFeedback(result);
    }
  };

  const getIconColor = () => {
    if (!feedback) return 'text-gray-400';
    switch (feedback.severity) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  const getFeedbackColor = () => {
    if (!feedback) return '';
    switch (feedback.severity) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="h-10 sm:h-9"
          data-testid={`input-${fieldName}`}
        />
        {feedback && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${getIconColor()}`}>
            {feedback.severity === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {feedback.severity === 'error' && <AlertCircle className="w-5 h-5" />}
            {feedback.severity === 'warning' && <AlertCircle className="w-5 h-5" />}
            {feedback.severity === 'info' && <Info className="w-5 h-5" />}
          </div>
        )}
      </div>
      {feedback && (
        <p className={`text-xs ${getFeedbackColor()}`}>{feedback.message}</p>
      )}
    </div>
  );
};
