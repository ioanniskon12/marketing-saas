/**
 * Toast Component
 *
 * Wrapper around react-hot-toast with custom styling.
 * This provides the configuration for toast notifications.
 *
 * Usage: Import toast from 'react-hot-toast' in your components
 *
 * @example
 * import toast from 'react-hot-toast';
 *
 * // Success toast
 * toast.success('Post published successfully!');
 *
 * // Error toast
 * toast.error('Failed to publish post');
 *
 * // Custom toast
 * toast.custom((t) => (
 *   <CustomToast visible={t.visible}>
 *     Your custom content
 *   </CustomToast>
 * ));
 *
 * // Toast with action
 * toast((t) => (
 *   <div>
 *     <span>Post scheduled!</span>
 *     <button onClick={() => toast.dismiss(t.id)}>Undo</button>
 *   </div>
 * ));
 */

'use client';

import styled from 'styled-components';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

// Custom toast container
const ToastContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  min-width: 300px;
  max-width: 500px;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all ${props => props.theme.transitions.base};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: ${props => props.$color || props.theme.colors.text.primary};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Title = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const Message = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Custom toast functions with icons
export const showToast = {
  success: (message, title = 'Success') => {
    return toast.custom((t) => (
      <ToastContainer $visible={t.visible}>
        <IconWrapper $color="#10B981">
          <CheckCircle size={24} />
        </IconWrapper>
        <Content>
          <Title>{title}</Title>
          <Message>{message}</Message>
        </Content>
        <CloseButton onClick={() => toast.dismiss(t.id)}>
          <X size={16} />
        </CloseButton>
      </ToastContainer>
    ));
  },

  error: (message, title = 'Error') => {
    return toast.custom((t) => (
      <ToastContainer $visible={t.visible}>
        <IconWrapper $color="#EF4444">
          <XCircle size={24} />
        </IconWrapper>
        <Content>
          <Title>{title}</Title>
          <Message>{message}</Message>
        </Content>
        <CloseButton onClick={() => toast.dismiss(t.id)}>
          <X size={16} />
        </CloseButton>
      </ToastContainer>
    ));
  },

  info: (message, title = 'Info') => {
    return toast.custom((t) => (
      <ToastContainer $visible={t.visible}>
        <IconWrapper $color="#3B82F6">
          <Info size={24} />
        </IconWrapper>
        <Content>
          <Title>{title}</Title>
          <Message>{message}</Message>
        </Content>
        <CloseButton onClick={() => toast.dismiss(t.id)}>
          <X size={16} />
        </CloseButton>
      </ToastContainer>
    ));
  },

  warning: (message, title = 'Warning') => {
    return toast.custom((t) => (
      <ToastContainer $visible={t.visible}>
        <IconWrapper $color="#F59E0B">
          <AlertCircle size={24} />
        </IconWrapper>
        <Content>
          <Title>{title}</Title>
          <Message>{message}</Message>
        </Content>
        <CloseButton onClick={() => toast.dismiss(t.id)}>
          <X size={16} />
        </CloseButton>
      </ToastContainer>
    ));
  },

  // Promise toast for async operations
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error!',
    });
  },
};

// Re-export toast for convenience
export { toast };
export default showToast;
