/**
 * Add Post Button Component
 *
 * Reusable green "+" button for Day, Week, and Month views with:
 * - View-specific sizing
 * - onCreate callback with date/time
 * - Keyboard accessibility (Tab + Enter/Space)
 */

'use client';

import styled, { css } from 'styled-components';
import { Plus } from 'lucide-react';

// View-specific styles
const viewStyles = {
  day: css`
    width: 36px;
    height: 36px;
    border-radius: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  `,
  week: css`
    width: 24px;
    height: 24px;
    border-radius: 6px;

    svg {
      width: 14px;
      height: 14px;
    }
  `,
  month: css`
    width: 20px;
    height: 20px;
    border-radius: 4px;

    svg {
      width: 12px;
      height: 12px;
    }
  `,
};

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.success.main};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.$alwaysVisible ? 1 : 0.7};
  flex-shrink: 0;
  ${props => viewStyles[props.$view || 'day']}

  &:hover {
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 2px 8px ${props => props.theme.colors.success.main}50;
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.success.light};
    outline-offset: 2px;
    opacity: 1;
  }

  &:active {
    transform: scale(1.05);
  }
`;

// Wrapper for positioning in time slots
const SlotWrapper = styled.div`
  position: absolute;
  ${props => {
    switch (props.$position) {
      case 'center':
        return css`
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
      case 'top-right':
        return css`
          top: 4px;
          right: 4px;
        `;
      case 'bottom-right':
        return css`
          bottom: 4px;
          right: 4px;
        `;
      default:
        return css`
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
        `;
    }
  }}
  z-index: 5;
  opacity: 0;
  transition: opacity 0.2s;

  ${props => props.$parentHover && css`
    .time-slot:hover &,
    .day-cell:hover & {
      opacity: 1;
    }
  `}

  ${props => props.$alwaysVisible && css`
    opacity: 1;
  `}
`;

export default function AddPostButton({
  view = 'day',
  dateTime,
  date,
  onCreate,
  position = 'right', // 'center', 'top-right', 'bottom-right', 'right'
  alwaysVisible = false,
  parentHover = true,
  className,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onCreate) {
      // For month view, pass just the date; for day/week, pass full dateTime
      onCreate(dateTime || date);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  // If position is specified, wrap in SlotWrapper for absolute positioning
  if (position && position !== 'inline') {
    return (
      <SlotWrapper
        $position={position}
        $alwaysVisible={alwaysVisible}
        $parentHover={parentHover}
        className={className}
      >
        <Button
          $view={view}
          $alwaysVisible={alwaysVisible}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Add post for ${dateTime ? dateTime.toLocaleString() : date?.toLocaleDateString()}`}
        >
          <Plus />
        </Button>
      </SlotWrapper>
    );
  }

  // Inline button without wrapper
  return (
    <Button
      $view={view}
      $alwaysVisible={alwaysVisible}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Add post for ${dateTime ? dateTime.toLocaleString() : date?.toLocaleDateString()}`}
      className={className}
    >
      <Plus />
    </Button>
  );
}

// Export a simple inline version for use in grids
export function InlineAddButton({ view = 'day', dateTime, date, onCreate }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onCreate?.(dateTime || date);
  };

  return (
    <Button
      $view={view}
      $alwaysVisible
      onClick={handleClick}
      tabIndex={0}
      aria-label="Add new post"
    >
      <Plus />
    </Button>
  );
}
