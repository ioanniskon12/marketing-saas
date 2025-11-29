'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
`;

const Hint = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$checked ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const Radio = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const RadioLabel = styled.div`
  flex: 1;
`;

const RadioTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const RadioDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
`;

export default function BulkScheduling({ selectedPosts, onSchedule, onClose }) {
  const [scheduleMode, setScheduleMode] = useState('same'); // 'same' or 'interval'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [intervalDays, setIntervalDays] = useState('1');
  const [scheduling, setScheduling] = useState(false);

  const handleSchedule = async () => {
    if (scheduleMode === 'same' && (!scheduleDate || !scheduleTime)) {
      showToast.error('Please select both date and time');
      return;
    }

    if (scheduleMode === 'interval' && (!scheduleDate || !scheduleTime || !intervalDays)) {
      showToast.error('Please fill in all fields');
      return;
    }

    setScheduling(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < selectedPosts.length; i++) {
        const post = selectedPosts[i];

        let scheduledFor;
        if (scheduleMode === 'same') {
          // Same date/time for all posts
          scheduledFor = `${scheduleDate}T${scheduleTime}`;
        } else {
          // Interval mode - each post scheduled X days apart
          const baseDate = new Date(`${scheduleDate}T${scheduleTime}`);
          baseDate.setDate(baseDate.getDate() + (i * parseInt(intervalDays)));
          scheduledFor = baseDate.toISOString();
        }

        try {
          const response = await fetch(`/api/posts/${post.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scheduled_for: scheduledFor,
              status: 'scheduled',
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error scheduling post:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast.success(`Scheduled ${successCount} post${successCount > 1 ? 's' : ''}!`);
        onSchedule();
        onClose();
      }

      if (errorCount > 0) {
        showToast.error(`Failed to schedule ${errorCount} post${errorCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Bulk scheduling error:', error);
      showToast.error('Failed to schedule posts');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Schedule {selectedPosts.length} Posts</Title>
        <Description>
          Set publish dates and times for selected posts
        </Description>
      </Header>

      <Form>
        <FormGroup>
          <Label>Scheduling Mode</Label>
          <RadioGroup>
            <RadioOption $checked={scheduleMode === 'same'}>
              <Radio
                type="radio"
                name="scheduleMode"
                value="same"
                checked={scheduleMode === 'same'}
                onChange={(e) => setScheduleMode(e.target.value)}
              />
              <RadioLabel>
                <RadioTitle>Same Date & Time</RadioTitle>
                <RadioDescription>
                  All posts will be scheduled for the same date and time
                </RadioDescription>
              </RadioLabel>
            </RadioOption>

            <RadioOption $checked={scheduleMode === 'interval'}>
              <Radio
                type="radio"
                name="scheduleMode"
                value="interval"
                checked={scheduleMode === 'interval'}
                onChange={(e) => setScheduleMode(e.target.value)}
              />
              <RadioLabel>
                <RadioTitle>Interval Scheduling</RadioTitle>
                <RadioDescription>
                  Posts will be scheduled at regular intervals starting from a date
                </RadioDescription>
              </RadioLabel>
            </RadioOption>
          </RadioGroup>
        </FormGroup>

        <FormGroup>
          <Label>
            {scheduleMode === 'same' ? 'Schedule Date & Time' : 'Starting Date & Time'}
          </Label>
          <InputGrid>
            <Input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </InputGrid>
        </FormGroup>

        {scheduleMode === 'interval' && (
          <FormGroup>
            <Label>Interval (Days)</Label>
            <Input
              type="number"
              min="1"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
              placeholder="Number of days between posts"
            />
            <Hint>
              Posts will be scheduled {intervalDays} day(s) apart. First post on {scheduleDate || 'selected date'},
              second post {intervalDays} day(s) later, etc.
            </Hint>
          </FormGroup>
        )}
      </Form>

      <ButtonGroup>
        <Button variant="ghost" onClick={onClose} disabled={scheduling}>
          Cancel
        </Button>
        <Button onClick={handleSchedule} loading={scheduling}>
          <Check size={20} />
          Schedule {selectedPosts.length} Posts
        </Button>
      </ButtonGroup>
    </Container>
  );
}
