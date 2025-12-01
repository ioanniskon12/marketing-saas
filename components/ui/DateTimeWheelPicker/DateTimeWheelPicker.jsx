/**
 * iOS-Style Date Time Wheel Picker
 * Main component that orchestrates date, hour, minute, and period wheels
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import WheelColumn from './WheelColumn';
import {
  PickerContainer,
  PickerHeader,
  PickerTitle,
  CloseButton,
  ValidationWarning,
  WheelsContainer,
  HighlightBar,
  PickerActions,
  ActionButton,
} from './styled';

// Generate next 30 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    let label;
    if (i === 0) {
      label = 'Today';
    } else if (i === 1) {
      label = 'Tomorrow';
    } else {
      // Format as "Mon, Jan 15"
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      label = `${dayName}, ${monthName} ${day}`;
    }

    dates.push({
      label,
      value: date.toISOString().split('T')[0], // YYYY-MM-DD
      date,
    });
  }

  return dates;
};

// Generate hours (1-12 for 12-hour, 0-23 for 24-hour)
const generateHours = (use24Hour) => {
  const hours = [];
  const max = use24Hour ? 24 : 12;
  const start = use24Hour ? 0 : 1;

  for (let i = start; i < (use24Hour ? max : max + 1); i++) {
    const displayValue = use24Hour ? i : i;
    hours.push({
      label: displayValue.toString().padStart(2, '0'),
      value: i,
    });
  }

  return hours;
};

// Generate minutes based on interval
const generateMinutes = (interval = 1) => {
  const minutes = [];
  for (let i = 0; i < 60; i += interval) {
    minutes.push({
      label: i.toString().padStart(2, '0'),
      value: i,
    });
  }
  return minutes;
};

const PERIODS = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

export default function DateTimeWheelPicker({
  initialValue,
  onChange,
  onCancel,
  minuteInterval = 1,
  use24Hour = false,
  disablePastDates = true,
  title = 'Schedule Post',
  showActions = true,
}) {
  const dates = useMemo(() => generateDates(), []);
  const hours = useMemo(() => generateHours(use24Hour), [use24Hour]);
  const minutes = useMemo(() => generateMinutes(minuteInterval), [minuteInterval]);

  // Initialize from initialValue or use current time + 1 hour
  const initializeValues = useCallback(() => {
    const init = initialValue ? new Date(initialValue) : new Date();

    // If no initial value, default to 1 hour from now
    if (!initialValue) {
      init.setHours(init.getHours() + 1);
      init.setMinutes(0);
    }

    const dateStr = init.toISOString().split('T')[0];
    let hour = init.getHours();
    const minute = Math.floor(init.getMinutes() / minuteInterval) * minuteInterval;
    let period = 'AM';

    if (!use24Hour) {
      period = hour >= 12 ? 'PM' : 'AM';
      hour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    }

    return { dateStr, hour, minute, period };
  }, [initialValue, use24Hour, minuteInterval]);

  const { dateStr: initDate, hour: initHour, minute: initMinute, period: initPeriod } = initializeValues();

  const [selectedDate, setSelectedDate] = useState(initDate);
  const [selectedHour, setSelectedHour] = useState(initHour);
  const [selectedMinute, setSelectedMinute] = useState(initMinute);
  const [selectedPeriod, setSelectedPeriod] = useState(initPeriod);
  const [validationError, setValidationError] = useState('');

  // Build the complete datetime whenever values change
  const buildDateTime = useCallback(() => {
    const dateObj = new Date(selectedDate);

    let hour24 = selectedHour;
    if (!use24Hour) {
      if (selectedPeriod === 'PM' && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      } else if (selectedPeriod === 'AM' && selectedHour === 12) {
        hour24 = 0;
      }
    }

    dateObj.setHours(hour24, selectedMinute, 0, 0);

    return {
      datetime: dateObj.toISOString(),
      date: selectedDate,
      time: `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`,
      hour: hour24,
      minutes: selectedMinute,
      period: selectedPeriod,
    };
  }, [selectedDate, selectedHour, selectedMinute, selectedPeriod, use24Hour]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // Restore original values
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const handleConfirm = () => {
    const result = buildDateTime();

    // Validate that selected time is not in the past
    if (disablePastDates) {
      const selectedTime = new Date(result.datetime);
      const now = new Date();

      if (selectedTime < now) {
        setValidationError('Please select a future date and time');
        return;
      }
    }

    // Clear any previous errors and proceed
    setValidationError('');
    onChange?.(result);
  };

  return (
    <PickerContainer>
      {title && (
        <PickerHeader>
          <PickerTitle>{title}</PickerTitle>
          <CloseButton onClick={onCancel} aria-label="Close">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>
        </PickerHeader>
      )}

      <WheelsContainer>
        <HighlightBar />

        {/* Date Wheel */}
        <WheelColumn
          items={dates}
          value={selectedDate}
          onChange={setSelectedDate}
          width="160px"
        />

        {/* Hour Wheel */}
        <WheelColumn
          items={hours}
          value={selectedHour}
          onChange={setSelectedHour}
          width="80px"
        />

        {/* Minute Wheel */}
        <WheelColumn
          items={minutes}
          value={selectedMinute}
          onChange={setSelectedMinute}
          width="80px"
        />

        {/* AM/PM Wheel (only for 12-hour format) */}
        {!use24Hour && (
          <WheelColumn
            items={PERIODS}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            width="80px"
          />
        )}
      </WheelsContainer>

      {/* Validation Warning */}
      {validationError && (
        <ValidationWarning>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationError}</span>
        </ValidationWarning>
      )}

      {showActions && (
        <PickerActions>
          <ActionButton onClick={onCancel}>
            Cancel
          </ActionButton>
          <ActionButton $variant="primary" onClick={handleConfirm}>
            Set Schedule
          </ActionButton>
        </PickerActions>
      )}
    </PickerContainer>
  );
}
