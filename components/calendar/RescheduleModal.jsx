/**
 * Reschedule Modal Component
 *
 * Modal for rescheduling posts with date and time picker
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, X } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'all' : 'none'};
  transition: opacity 0.2s ease;
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows['2xl']};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.95)'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: all 0.2s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error.light};
    border-color: ${props => props.theme.colors.error.main};
    color: ${props => props.theme.colors.error.main};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: ${props => props.theme.shadows.neon};
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: ${props => props.theme.colors.background.default === '#000000' ? 'invert(1)' : 'none'};
  }
`;

const PostPreview = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PostContent = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  padding: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => {
    switch (props.$status) {
      case 'published': return props.theme.colors.success.light;
      case 'scheduled': return props.theme.colors.primary.light;
      case 'failed': return props.theme.colors.error.light;
      default: return props.theme.colors.neutral[200];
    }
  }};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: capitalize;
`;

export default function RescheduleModal({ isOpen, onClose, post, onReschedule }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (post && post.scheduled_for) {
      const scheduledDate = new Date(post.scheduled_for);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = scheduledDate.toTimeString().slice(0, 5);
      setDate(dateStr);
      setTime(timeStr);
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      showToast.error('Please select both date and time');
      return;
    }

    setIsLoading(true);

    try {
      const scheduledFor = new Date(`${date}T${time}`);

      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled', // Reset status to scheduled if it was failed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule post');
      }

      showToast.success('Post rescheduled successfully');
      onReschedule?.();
      onClose();
    } catch (error) {
      console.error('Error rescheduling post:', error);
      showToast.error(error.message || 'Failed to reschedule post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!post) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal $isOpen={isOpen}>
        <ModalHeader>
          <ModalTitle>
            <Calendar size={24} />
            Reschedule Post
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <PostPreview>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '14px' }}>Post Preview</strong>
              <StatusBadge $status={post.status}>{post.status}</StatusBadge>
            </div>
            <PostContent>{post.content || 'No content'}</PostContent>
          </PostPreview>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                <Calendar size={16} />
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={16} />
                Time
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </FormGroup>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Rescheduling...' : 'Reschedule Post'}
          </Button>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}
