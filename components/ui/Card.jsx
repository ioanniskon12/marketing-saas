/**
 * Card Component
 *
 * Reusable container component with consistent styling.
 *
 * @example
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * @example
 * <Card variant="outlined" padding="lg" hoverable>
 *   Content with hover effect
 * </Card>
 */

'use client';

import styled from 'styled-components';

const StyledCard = styled.div`
  background: ${props => props.$variant === 'outlined' ? 'transparent' : props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  transition: all ${props => props.theme.transitions.base};

  /* Padding variants */
  ${props => props.$padding === 'none' && `
    padding: 0;
  `}

  ${props => props.$padding === 'sm' && `
    padding: ${props.theme.spacing.sm};
  `}

  ${props => props.$padding === 'md' && `
    padding: ${props.theme.spacing.md};
  `}

  ${props => props.$padding === 'lg' && `
    padding: ${props.theme.spacing.lg};
  `}

  ${props => props.$padding === 'xl' && `
    padding: ${props.theme.spacing.xl};
  `}

  ${props => props.$padding === '2xl' && `
    padding: ${props.theme.spacing['2xl']};
  `}

  /* Variant: default */
  ${props => props.$variant === 'default' && `
    box-shadow: ${props.theme.shadows.md};
    border: 2px solid ${props.theme.colors.neutral[200]};
  `}

  /* Variant: outlined */
  ${props => props.$variant === 'outlined' && `
    border: 2px solid ${props.theme.colors.neutral[300]};
    box-shadow: none;
  `}

  /* Variant: elevated */
  ${props => props.$variant === 'elevated' && `
    box-shadow: ${props.theme.shadows.xl};
    border: none;
  `}

  /* Variant: ghost (no border or shadow) */
  ${props => props.$variant === 'ghost' && `
    border: none;
    box-shadow: none;
  `}

  /* Hoverable effect */
  ${props => props.$hoverable && `
    cursor: pointer;
    box-shadow: ${props.theme.shadows.md};

    &:hover {
      transform: translateY(-6px);
      box-shadow: ${props.theme.shadows.xl};
      border-color: ${props.theme.colors.primary.main};
    }

    &:active {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}

  /* Clickable effect */
  ${props => props.$clickable && `
    cursor: pointer;
    box-shadow: ${props.theme.shadows.sm};

    &:hover {
      box-shadow: ${props.theme.shadows.lg};
      transform: translateY(-2px);
      border-color: ${props.theme.colors.primary.light};
    }

    &:active {
      transform: scale(0.98) translateY(0);
      box-shadow: ${props.theme.shadows.md};
    }
  `}

  /* Full width */
  ${props => props.$fullWidth && `
    width: 100%;
  `}
`;

const CardHeader = styled.div`
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
`;

const CardDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const CardBody = styled.div`
  color: ${props => props.theme.colors.text.primary};
`;

const CardFooter = styled.div`
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-top: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

/**
 * Card Component
 *
 * @param {Object} props
 * @param {'default'|'outlined'|'elevated'|'ghost'} props.variant - Card style variant
 * @param {'none'|'sm'|'md'|'lg'|'xl'|'2xl'} props.padding - Padding size
 * @param {boolean} props.hoverable - Add hover effect
 * @param {boolean} props.clickable - Add click effect
 * @param {boolean} props.fullWidth - Make card full width
 * @param {React.ReactNode} props.children - Card content
 */
export default function Card({
  variant = 'default',
  padding = 'xl',
  hoverable = false,
  clickable = false,
  fullWidth = false,
  children,
  ...props
}) {
  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $hoverable={hoverable}
      $clickable={clickable}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledCard>
  );
}

// Export subcomponents
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;
