/**
 * Input Component
 *
 * Reusable input field with label, error states, and icons.
 *
 * @example
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * @example
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 *   leftIcon={<Lock size={20} />}
 * />
 */

'use client';

import styled from 'styled-components';

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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-left: ${props => props.$hasLeftIcon ? props.theme.spacing['2xl'] : props.theme.spacing.md};
  padding-right: ${props => props.$hasRightIcon ? props.theme.spacing['2xl'] : props.theme.spacing.md};
  border: 2px solid ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.paper};
  transition: all ${props => props.theme.transitions.fast};

  &::placeholder {
    color: ${props => props.theme.colors.neutral[400]};
  }

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

  /* Remove number input arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const IconLeft = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[400]};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const IconRight = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  color: ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[400]};
  display: flex;
  align-items: center;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  pointer-events: ${props => props.$clickable ? 'auto' : 'none'};
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};

  ${props => props.$clickable && `
    &:hover {
      background: ${props.theme.colors.neutral[100]};
      color: ${props.theme.colors.neutral[600]};
    }
  `}
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
 * Input Component
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, number, etc.)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Mark as required
 * @param {boolean} props.disabled - Disable input
 * @param {React.ReactNode} props.leftIcon - Icon on the left side
 * @param {React.ReactNode} props.rightIcon - Icon on the right side
 * @param {function} props.onRightIconClick - Click handler for right icon
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconClick,
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

      <InputWrapper>
        {leftIcon && <IconLeft $error={error}>{leftIcon}</IconLeft>}

        <StyledInput
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          $error={error}
          $hasLeftIcon={leftIcon}
          $hasRightIcon={rightIcon}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          {...props}
        />

        {rightIcon && (
          <IconRight
            $error={error}
            $clickable={!!onRightIconClick}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </IconRight>
        )}
      </InputWrapper>

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
