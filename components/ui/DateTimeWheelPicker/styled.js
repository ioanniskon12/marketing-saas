/**
 * iOS-Style Date Time Wheel Picker - Styled Components
 */

import styled from 'styled-components';

export const PickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  background: #1C1F24;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 480px;
`;

export const WheelsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  position: relative;
  width: 100%;
  justify-content: center;
  margin: ${props => props.theme.spacing.xl} 0;
`;

export const HighlightBar = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 48px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

export const WheelColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  height: 240px;
  width: ${props => props.$width || '110px'};
  flex-shrink: 0;

  &:before,
  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 96px;
    pointer-events: none;
    z-index: 2;
  }

  &:before {
    top: 0;
    background: linear-gradient(to bottom,
      #1C1F24 0%,
      rgba(28, 31, 36, 0.95) 30%,
      rgba(28, 31, 36, 0) 100%
    );
  }

  &:after {
    bottom: 0;
    background: linear-gradient(to top,
      #1C1F24 0%,
      rgba(28, 31, 36, 0.95) 30%,
      rgba(28, 31, 36, 0) 100%
    );
  }
`;

export const WheelScroller = styled.div`
  display: flex;
  flex-direction: column;
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
  position: relative;
  transition: ${props => props.$isSnapping ? 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'};
  transform: translateY(${props => props.$offset}px);

  &:active {
    cursor: grabbing;
  }
`;

export const WheelItem = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$isCenter ? '22px' : '20px'};
  font-weight: ${props => props.$isCenter ? '600' : '500'};
  color: ${props => props.theme.colors.text.primary};
  opacity: ${props => {
    if (props.$isCenter) return 1;
    const distance = Math.abs(props.$distance);
    if (distance === 1) return 0.6;
    if (distance === 2) return 0.4;
    return 0.3;
  }};
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 0 ${props => props.theme.spacing.sm};
`;

export const PickerHeader = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PickerTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const CloseButton = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.text.primary};
  }

  &:active {
    background: rgba(255, 255, 255, 0.03);
    transform: translateY(-50%) scale(0.95);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ValidationWarning = styled.div`
  background: ${props => props.theme.colors.error.main}15;
  border: 1px solid ${props => props.theme.colors.error.main};
  color: ${props => props.theme.colors.error.main};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 8px;
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  animation: slideIn 0.2s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
`;

export const PickerActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  margin-top: ${props => props.theme.spacing.xl};
`;

export const ActionButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: 12px;
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  ${props => props.$variant === 'primary' ? `
    background: ${props.theme.colors.primary.main};
    color: white;

    &:hover {
      background: ${props.theme.colors.primary.dark};
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: ${props.theme.colors.text.primary};

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &:active {
      background: rgba(255, 255, 255, 0.03);
    }
  `}

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${props => props.theme.spacing.xl};

  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ScheduledTimeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.primary.main};
  }

  .time {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
  }
`;
