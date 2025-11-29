/**
 * Button Component
 *
 * Reusable button with multiple variants and states.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 *
 * @example
 * <Button variant="outline" size="lg" disabled>
 *   Disabled
 * </Button>
 */

'use client';

import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: all ${props => props.theme.transitions.base};
  cursor: pointer;
  border: none;
  font-family: ${props => props.theme.typography.fontFamily.sans};
  line-height: 1;
  white-space: nowrap;

  /* Size variants */
  ${props => props.$size === 'xs' && `
    padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
    font-size: ${props.theme.typography.fontSize.xs};
  `}

  ${props => props.$size === 'sm' && `
    padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
    font-size: ${props.theme.typography.fontSize.sm};
  `}

  ${props => props.$size === 'md' && `
    padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
    font-size: ${props.theme.typography.fontSize.base};
  `}

  ${props => props.$size === 'lg' && `
    padding: ${props.theme.spacing.lg} ${props.theme.spacing.xl};
    font-size: ${props.theme.typography.fontSize.lg};
  `}

  ${props => props.$size === 'xl' && `
    padding: ${props.theme.spacing.xl} ${props.theme.spacing['2xl']};
    font-size: ${props.theme.typography.fontSize.xl};
  `}

  /* Primary variant */
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.primary.dark});
    color: white;
    box-shadow: ${props.theme.shadows.md};

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${props.theme.colors.primary.dark}, ${props.theme.colors.primary.main});
      transform: translateY(-3px);
      box-shadow: ${props.theme.shadows.xl};
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}

  /* Secondary variant */
  ${props => props.$variant === 'secondary' && `
    background: linear-gradient(135deg, ${props.theme.colors.secondary.main}, ${props.theme.colors.secondary.dark});
    color: white;
    box-shadow: ${props.theme.shadows.md};

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${props.theme.colors.secondary.dark}, ${props.theme.colors.secondary.main});
      transform: translateY(-3px);
      box-shadow: ${props.theme.shadows.xl};
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}

  /* Outline variant */
  ${props => props.$variant === 'outline' && `
    background: transparent;
    color: ${props.theme.colors.primary.main};
    border: 2px solid ${props.theme.colors.primary.main};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.primary.main}10;
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}

  /* Ghost variant */
  ${props => props.$variant === 'ghost' && `
    background: transparent;
    color: ${props.theme.colors.text.primary};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.neutral[100]};
    }

    &:active:not(:disabled) {
      background: ${props.theme.colors.neutral[200]};
    }
  `}

  /* Danger variant */
  ${props => props.$variant === 'danger' && `
    background: ${props.theme.colors.error.main};
    color: white;

    &:hover:not(:disabled) {
      background: ${props.theme.colors.error.dark};
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${props.theme.shadows.md};
    }
  `}

  /* Success variant */
  ${props => props.$variant === 'success' && `
    background: ${props.theme.colors.success.main};
    color: white;

    &:hover:not(:disabled) {
      background: ${props.theme.colors.success.dark};
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${props.theme.shadows.md};
    }
  `}

  /* Full width */
  ${props => props.$fullWidth && `
    width: 100%;
  `}

  /* Loading state */
  ${props => props.$loading && `
    cursor: not-allowed;
    opacity: 0.7;
    pointer-events: none;
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Focus state */
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Button Component
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'} props.variant - Button style variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.size - Button size
 * @param {boolean} props.fullWidth - Make button full width
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {React.ReactNode} props.children - Button content
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
}
