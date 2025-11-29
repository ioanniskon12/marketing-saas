/**
 * Select Component
 *
 * Styled select dropdown with label and error states.
 *
 * @example
 * <Select
 *   label="Platform"
 *   value={platform}
 *   onChange={(e) => setPlatform(e.target.value)}
 *   options={[
 *     { value: 'facebook', label: 'Facebook' },
 *     { value: 'twitter', label: 'Twitter' },
 *   ]}
 * />
 */

'use client';

import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Required = styled.span`
  color: ${props => props.theme.colors.error.main};
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-right: ${props => props.theme.spacing['2xl']};
  border: 2px solid ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.paper};
  cursor: pointer;
  appearance: none;
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.$error
      ? `${props.theme.colors.error.main}20`
      : `${props.theme.colors.primary.main}20`};
  }

  &:disabled {
    background: ${props => props.theme.colors.neutral[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Style for placeholder option */
  option[value=''][disabled] {
    color: ${props => props.theme.colors.neutral[400]};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  color: ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[400]};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const ErrorMessage = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error.main};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const HelperText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

/**
 * Select Component
 *
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.value - Selected value
 * @param {function} props.onChange - Change handler
 * @param {Array<{value: string, label: string}>} props.options - Select options
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Mark as required
 * @param {boolean} props.disabled - Disable select
 */
export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <Container>
      {label && (
        <Label>
          {label}
          {required && <Required>*</Required>}
        </Label>
      )}

      <SelectWrapper>
        <StyledSelect
          value={value}
          onChange={onChange}
          disabled={disabled}
          $error={error}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>

        <IconWrapper $error={error}>
          <ChevronDown size={20} />
        </IconWrapper>
      </SelectWrapper>

      {error && (
        <ErrorMessage id="error-message" role="alert">
          {error}
        </ErrorMessage>
      )}

      {helperText && !error && (
        <HelperText id="helper-text">{helperText}</HelperText>
      )}
    </Container>
  );
}
