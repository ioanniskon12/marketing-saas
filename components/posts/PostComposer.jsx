/**
 * Post Composer Component
 *
 * Modal for creating and editing posts.
 */

'use client';

import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Calendar, Clock, Instagram, Facebook, Linkedin, Hash, Pin, ImageIcon, X, Info, ChevronLeft, Plus, Check, Send, Trash2 } from 'lucide-react';

// Platform descriptions for consistency across the app
const PLATFORM_DESCRIPTIONS = {
  instagram: 'Photos, Reels, Stories',
  facebook: 'Posts, Reels, Stories',
  linkedin: 'Professional content',
  twitter: 'Tweets & threads',
  tiktok: 'Short videos',
  youtube: 'Videos & Shorts'
};
import { Modal, Button, Input, Select } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { PLATFORM_CONFIG } from '@/lib/config/platforms';
import MediaUploader from './MediaUploader';
import CaptionGenerator from './CaptionGenerator';
import MediaLibrarySelector from './MediaLibrarySelector';
import SocialMediaPreview from './SocialMediaPreview';

// Platform-specific composers
import TwitterComposer from './composers/TwitterComposer';
import YouTubeComposer from './composers/YouTubeComposer';
import TikTokComposer from './composers/TikTokComposer';
import InstagramComposer from './composers/InstagramComposer';
import FacebookComposer from './composers/FacebookComposer';
import LinkedInComposer from './composers/LinkedInComposer';

// Global styles for native date/time picker popups
const DateTimePickerStyles = createGlobalStyle`
  /* Webkit Calendar Picker Styling */
  ::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
    background-size: 20px 20px;
    background-position: center;
    background-repeat: no-repeat;
    width: 24px;
    height: 24px;
    padding: 0;
    margin-left: 8px;
  }

  input[type="time"]::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-family: inherit;
  resize: vertical;
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: block;
`;

// Platform Tabs for multi-platform posting
const PlatformTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  border-bottom: 2px solid ${props => props.theme.colors.neutral[200]};
  margin-bottom: ${props => props.theme.spacing.xl};
  overflow-x: auto;
  padding-bottom: 0;
`;

const PlatformTab = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  background: transparent;
  border-bottom: 3px solid ${props => props.$active ? props.$color : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  margin-bottom: -2px;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
    background: ${props => `${props.$color}10`};
  }

  svg {
    color: ${props => props.$color};
  }
`;

const PlatformTabContent = styled.div`
  display: ${props => props.$active ? 'block' : 'none'};
`;

const PlatformSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const PlatformCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}10` : props.theme.colors.background.paper};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlatformIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlatformName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const PlatformAccount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const ScheduleSection = styled.div`
  background: ${props => props.theme.colors.neutral[50]};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  transition: all ${props => props.theme.transitions.fast};

  &:focus-within {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.background.paper};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary.main}15`};
  }
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ScheduleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ScheduleIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScheduleHint = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.primary.main}10`};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.primary.main};
    flex-shrink: 0;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const InputLabel = styled.label`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledDateTimeInput = styled.div`
  position: relative;

  input[type="date"],
  input[type="time"] {
    cursor: pointer;
    position: relative;

    /* Style the calendar/clock icon */
    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity ${props => props.theme.transitions.fast};

      &:hover {
        opacity: 1;
      }
    }

    /* Remove default clear button */
    &::-webkit-clear-button {
      display: none;
    }

    /* Firefox date picker styling */
    &::-moz-focus-inner {
      border: 0;
    }
  }

  /* Custom date picker styling for supported browsers */
  input[type="date"]::-webkit-datetime-edit {
    padding: 0;
  }

  input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }

  input[type="date"]::-webkit-datetime-edit-text {
    color: ${props => props.theme.colors.text.secondary};
    padding: 0 4px;
  }

  input[type="date"]::-webkit-datetime-edit-month-field,
  input[type="date"]::-webkit-datetime-edit-day-field,
  input[type="date"]::-webkit-datetime-edit-year-field {
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    padding: 2px 4px;
    border-radius: 4px;
    transition: background ${props => props.theme.transitions.fast};

    &:focus {
      background: ${props => `${props.theme.colors.primary.main}15`};
      color: ${props => props.theme.colors.primary.main};
      outline: none;
    }
  }

  /* Time picker styling */
  input[type="time"]::-webkit-datetime-edit-hour-field,
  input[type="time"]::-webkit-datetime-edit-minute-field,
  input[type="time"]::-webkit-datetime-edit-ampm-field {
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    padding: 2px 4px;
    border-radius: 4px;
    transition: background ${props => props.theme.transitions.fast};

    &:focus {
      background: ${props => `${props.theme.colors.primary.main}15`};
      color: ${props => props.theme.colors.primary.main};
      outline: none;
    }
  }

  input[type="time"]::-webkit-datetime-edit-text {
    color: ${props => props.theme.colors.text.secondary};
    padding: 0 4px;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$error ? props.theme.colors.error.main : props.theme.colors.text.secondary};
`;

const PlatformRequirements = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const PlatformRequirementHeader = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const PlatformRequirementItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 3px solid ${props => props.$color || props.theme.colors.neutral[300]};
`;

const PlatformRequirementIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PlatformRequirementContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const PlatformRequirementTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const PlatformRequirementDetail = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &.success {
    color: ${props => props.theme.colors.success.main};
  }

  &.warning {
    color: ${props => props.theme.colors.warning.main};
  }

  &.error {
    color: ${props => props.theme.colors.error.main};
  }
`;

const CharacterLimitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const CharacterLimitCard = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => {
    if (props.$status === 'error') return `${props.theme.colors.error.light}15`;
    if (props.$status === 'warning') return `${props.theme.colors.warning.light}15`;
    return props.theme.colors.background.paper;
  }};
  border: 1px solid ${props => {
    if (props.$status === 'error') return props.theme.colors.error.main;
    if (props.$status === 'warning') return props.theme.colors.warning.main;
    return props.theme.colors.neutral[200];
  }};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CharacterLimitIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CharacterLimitInfo = styled.div`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.xs};

  .platform-name {
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
  }

  .char-count {
    color: ${props => {
      if (props.$status === 'error') return props.theme.colors.error.main;
      if (props.$status === 'warning') return props.theme.colors.warning.main;
      return props.theme.colors.text.secondary;
    }};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const HashtagInput = styled.div`
  position: relative;
`;

const HashtagChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const HashtagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  button {
    background: none;
    border: none;
    color: ${props => props.theme.colors.primary.main};
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
`;

const MediaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MediaActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const MediaPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const MediaPreviewItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.neutral[200]};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MediaInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  color: white;
  padding: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.xs};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const InstagramOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  svg {
    color: ${props => props.theme.colors.primary.main};
  }
`;

// Step 1: Account Selection Styles
const AccountSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const StepHeader = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg} 0;
`;

const StepTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StepDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const PlatformGroupsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${props => props.theme.spacing.md};
  max-height: 420px;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.sm};
`;

const PlatformGroup = styled.div`
  border: 2px solid ${props => props.$selected ? props.$color : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.$selected ? `${props.$color}12` : props.theme.colors.background.paper};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$selected ? props.$color : 'transparent'};
    transition: all 0.2s ease;
  }

  &:hover {
    border-color: ${props => props.$color};
    box-shadow: 0 4px 12px ${props => `${props.$color}20`};
    transform: translateY(-2px);
    background: ${props => `${props.$color}08`};
  }
`;

const PlatformGroupHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const PlatformGroupIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$selected ? `${props.$color}25` : props.theme.colors.neutral[100]};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    width: 28px;
    height: 28px;
  }
`;

const PlatformGroupTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  h4 {
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.$selected ? props.$color : props.theme.colors.text.primary};
    margin: 0;
  }

  p {
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    margin: 0;
    line-height: 1.3;
  }
`;

const PlatformSelectedBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PlatformAccountInfo = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.neutral[100]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AccountCheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const AccountCheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$checked ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$checked ? `${props.theme.colors.primary.main}10` : 'transparent'};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

const AccountInfo = styled.div`
  flex: 1;

  .account-name {
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .account-username {
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};

  h3 {
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  p {
    font-size: ${props => props.theme.typography.fontSize.base};
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: ${props => props.theme.spacing.xl};
  }
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StepDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
`;

const StepLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConnectAccountSection = styled.div`
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
  margin-top: ${props => props.theme.spacing.md};
`;

const ConnectAccountButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border: 2px dashed ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.primary.main};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}10`};
    border-color: ${props => props.theme.colors.primary.dark};
    color: ${props => props.theme.colors.primary.dark};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ConnectPlatformButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.success.main};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-top: ${props => props.theme.spacing.sm};

  &:hover {
    background: ${props => props.theme.colors.success.dark};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PostTimingToggle = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PostTimingButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$active ? `${props.theme.colors.primary.main}15` : props.theme.colors.background.paper};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
    color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Preview Styles
const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const PreviewSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
`;

const PreviewHeader = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const PostPreviewCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const PostPreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const PostPreviewAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$color || props.theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const PostPreviewAccountInfo = styled.div`
  flex: 1;

  .account-name {
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: 2px;
  }

  .post-date {
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const PostPreviewContent = styled.div`
  padding: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const PostPreviewMedia = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$count === 1 ? '1fr' : props.$count === 2 ? '1fr 1fr' : 'repeat(3, 1fr)'};
  gap: 2px;
  background: ${props => props.theme.colors.neutral[200]};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};

  img, video {
    width: 100%;
    max-height: 200px;
    height: ${props => props.$count === 1 ? 'auto' : '200px'};
    object-fit: cover;
    display: block;
  }
`;

const ScheduleInfoCard = styled.div`
  background: ${props => `${props.theme.colors.primary.main}10`};
  border: 2px solid ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const ScheduleDateDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ScheduleTimeDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ScheduleTimezoneDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const PlatformsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const PlatformBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border: 1px solid ${props => props.$color};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default function PostComposer({
  isOpen,
  onClose,
  post = null,
  editPost = null,
  onSave,
  onSuccess,
  preSelectedPlatform = null,
  preSelectedAccount = null,
  preSelectedDate = null
}) {
  const { currentWorkspace } = useWorkspace();
  const supabase = createClient();

  // Use editPost if provided, otherwise fall back to post
  const postToEdit = editPost || post;

  // Start at step 2 when editing (skip account selection), step 1 for new posts
  const initialStep = postToEdit ? 2 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [media, setMedia] = useState([]);
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [errors, setErrors] = useState({});
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [instagramPinFirst, setInstagramPinFirst] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState(null); // Track which platform tab is active
  const [platformData, setPlatformData] = useState({}); // Store per-platform data: { accountId: { content, media, hashtags, etc. }
  const [postNow, setPostNow] = useState(false); // Toggle between "Post Now" and "Schedule for Later"

  // Load connected accounts
  useEffect(() => {
    if (isOpen && currentWorkspace) {
      loadConnectedAccounts();
    }
  }, [isOpen, currentWorkspace]);

  // Load post data when editing or set pre-selected values
  useEffect(() => {
    if (isOpen && postToEdit) {
      setContent(postToEdit.content || '');
      setSelectedPlatforms(postToEdit.platforms || []);
      setMedia(postToEdit.post_media || []);
      setStatus(postToEdit.status || 'draft');
      setHashtags(postToEdit.hashtags || []);
      setInstagramPinFirst(postToEdit.instagram_pin_first || false);
      setTimezone(postToEdit.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setCurrentStep(2); // Always start at step 2 when editing

      // Initialize platform data when editing
      if (postToEdit.platform_data) {
        // If we have platform-specific data from the backend, use it
        setPlatformData(postToEdit.platform_data);
      } else {
        // Otherwise, populate all platforms with the same content
        const initialData = {};
        (postToEdit.platforms || []).forEach(accountId => {
          initialData[accountId] = {
            content: postToEdit.content || '',
            media: postToEdit.post_media || [],
            hashtags: postToEdit.hashtags || [],
          };
        });
        setPlatformData(initialData);
      }

      if (postToEdit.scheduled_for) {
        const date = new Date(postToEdit.scheduled_for);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
        setPostNow(false); // Ensure "Schedule for Later" is selected when editing a scheduled post
      } else {
        // If no scheduled date, default to schedule mode with empty fields
        setPostNow(false);
        setScheduledDate('');
        setScheduledTime('');
      }
    } else if (isOpen && !postToEdit) {
      // Set pre-selected platform if provided
      if (preSelectedPlatform && preSelectedPlatform !== 'all') {
        // Check if preSelectedPlatform is a platform type or account ID
        const matchingAccount = connectedAccounts.find(acc =>
          acc.id === preSelectedPlatform || acc.platform === preSelectedPlatform
        );

        if (matchingAccount) {
          setSelectedPlatforms([matchingAccount.id]);
          setCurrentStep(2); // Skip to step 2 only if we found a valid account
        } else {
          // Platform type with no accounts, stay on step 1
          setCurrentStep(1);
        }
      }

      // Set pre-selected date if provided
      if (preSelectedDate) {
        const dateStr = preSelectedDate.toISOString().split('T')[0];
        setScheduledDate(dateStr);
        // Set default time to noon if not set
        if (!scheduledTime) {
          setScheduledTime('12:00');
        }
      }
    } else if (!isOpen) {
      // Reset form when closed
      setCurrentStep(initialStep);
      setContent('');
      setSelectedPlatforms([]);
      setScheduledDate('');
      setScheduledTime('');
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      setMedia([]);
      setStatus('draft');
      setErrors({});
      setHashtags([]);
      setHashtagInput('');
      setInstagramPinFirst(false);
      setActivePlatformTab(null);
      setPlatformData({});
      setPostNow(false); // Reset post now toggle
    }
  }, [isOpen, postToEdit, preSelectedPlatform, preSelectedDate, initialStep, connectedAccounts]);

  const loadConnectedAccounts = async () => {
    try {
      setLoadingAccounts(true);

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('is_active', true);

      if (error) throw error;

      setConnectedAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setConnectedAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Initialize platform data when selected platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      // Set first platform as active tab if none selected
      if (!activePlatformTab || !selectedPlatforms.includes(activePlatformTab)) {
        setActivePlatformTab(selectedPlatforms[0]);
      }

      // Initialize platform data for new selections (only for platforms not yet in platformData)
      setPlatformData(prev => {
        const newPlatformData = { ...prev };

        selectedPlatforms.forEach(accountId => {
          if (!newPlatformData[accountId]) {
            newPlatformData[accountId] = {
              content: '',
              media: [],
              hashtags: [],
              // Add platform-specific fields as needed
            };
          }
        });

        // Remove deselected platforms
        Object.keys(newPlatformData).forEach(accountId => {
          if (!selectedPlatforms.includes(accountId)) {
            delete newPlatformData[accountId];
          }
        });

        return newPlatformData;
      });
    }
  }, [selectedPlatforms]);

  const togglePlatform = (accountId) => {
    if (selectedPlatforms.includes(accountId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== accountId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, accountId]);
    }
    // Clear platform error when user selects one
    if (errors.platforms) {
      setErrors({ ...errors, platforms: null });
    }
  };

  // Get data for active platform
  const getActivePlatformData = () => {
    return platformData[activePlatformTab] || { content: '', media: [], hashtags: [] };
  };

  // Update data for active platform
  const updateActivePlatformData = (updates) => {
    setPlatformData(prev => ({
      ...prev,
      [activePlatformTab]: {
        ...prev[activePlatformTab],
        ...updates
      }
    }));
  };

  // Get platform type from account ID
  const getPlatformTypeForAccount = (accountId) => {
    const account = connectedAccounts.find(acc => acc.id === accountId);
    return account?.platform || null;
  };

  const handleHashtagInput = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleMediaLibrarySelect = (selectedMedia) => {
    // Convert media library items to the format expected by media state
    // Mark as existing media from library to prevent duplication
    const currentMedia = platformData[activePlatformTab]?.media || [];
    const formattedMedia = selectedMedia.map((item, index) => ({
      id: item.id,
      media_id: item.id, // Reference to existing media library item
      from_library: true, // Flag to indicate this is existing media
      media_type: item.mime_type?.startsWith('video/') ? 'video' : 'image',
      file_url: item.file_url,
      file_name: item.file_name,
      file_size: item.file_size,
      mime_type: item.mime_type,
      thumbnail_url: item.thumbnail_url,
      width: item.width,
      height: item.height,
      display_order: currentMedia.length + index,
    }));

    // Update the active platform's media
    updateActivePlatformData({ media: [...currentMedia, ...formattedMedia] });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasInstagramAccount = () => {
    return selectedPlatforms.some(accountId => {
      const account = connectedAccounts.find(a => a.id === accountId);
      return account && account.platform === 'instagram';
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedPlatforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }

    // Check platform-specific data validation
    for (const accountId of selectedPlatforms) {
      const account = connectedAccounts.find(a => a.id === accountId);
      const data = platformData[accountId];

      if (account && data) {
        const platformConfig = PLATFORM_CONFIG[account.platform];

        // Check if content is provided
        if (!data.content || !data.content.trim()) {
          newErrors.content = `Content is required for ${platformConfig.name}`;
          break;
        }

        // Check character limits
        if (data.content.length > platformConfig.maxLength) {
          newErrors.content = `Content for ${platformConfig.name} exceeds limit of ${platformConfig.maxLength} characters`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let scheduledFor = null;
      let postStatus = status;

      if (postNow) {
        // Post immediately - set status to published and no scheduled date
        postStatus = 'published';
        scheduledFor = null;
      } else if (scheduledDate && scheduledTime) {
        // Schedule for later
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        // Preserve 'published' status if editing a published post, otherwise use 'scheduled'
        if (postToEdit && postToEdit.status === 'published' && postToEdit.published_at) {
          postStatus = 'published';
        } else {
          postStatus = 'scheduled';
        }
      }

      // Prepare platform-specific posts data
      // For now, we'll create separate posts for each platform
      // Or if your backend supports it, send platform-specific data
      const posts = selectedPlatforms.map(accountId => {
        const data = platformData[accountId] || { content: '', media: [], hashtags: [] };
        return {
          workspace_id: currentWorkspace.id,
          platforms: [accountId], // Single platform per post
          content: data.content,
          media: data.media,
          hashtags: data.hashtags,
          scheduled_for: scheduledFor,
          timezone: timezone,
          status: postStatus,
          instagram_pin_first: instagramPinFirst,
        };
      });

      // Submit each post (you may want to adjust this based on your API)
      let responses;
      if (postToEdit) {
        // For editing, we'll update with the active platform's data
        const activeData = platformData[activePlatformTab] || { content: '', media: [], hashtags: [] };

        // Preserve the original scheduled_for if not changed
        const finalScheduledFor = scheduledFor !== null ? scheduledFor : postToEdit.scheduled_for;

        console.log('Edit mode - saving post:', {
          postId: postToEdit.id,
          originalScheduledFor: postToEdit.scheduled_for,
          calculatedScheduledFor: scheduledFor,
          finalScheduledFor: finalScheduledFor,
          postNow: postNow,
          postStatus: postStatus,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime
        });

        responses = [await fetch(`/api/posts/${postToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace_id: currentWorkspace.id,
            content: activeData.content,
            content_type: activeData.content_type || 'feed',
            platforms: selectedPlatforms,
            scheduled_for: finalScheduledFor,
            timezone: timezone,
            status: postStatus,
            media: activeData.media,
            hashtags: activeData.hashtags,
            instagram_pin_first: instagramPinFirst,
            platform_data: platformData, // Send all platform-specific data
          }),
        })];
      } else {
        // Create new posts - send all platform data
        // Get content_type from the first selected platform's data
        const firstPlatformData = platformData[selectedPlatforms[0]] || {};
        responses = [await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace_id: currentWorkspace.id,
            content_type: firstPlatformData.content_type || 'feed',
            platforms: selectedPlatforms,
            scheduled_for: scheduledFor,
            timezone: timezone,
            status: postStatus,
            instagram_pin_first: instagramPinFirst,
            platform_data: platformData, // Send all platform-specific data
            post_now: postNow, // Add post_now parameter
          }),
        })];
      }

      const results = await Promise.all(responses.map(r => r.json()));

      if (responses.some(r => !r.ok)) {
        throw new Error(results[0]?.error || 'Failed to save post');
      }

      showToast.success(postToEdit ? 'Post updated successfully' : 'Post created successfully');
      onSave?.(results[0]?.post);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      showToast.error(error.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postToEdit) return;

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/posts/${postToEdit.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post');
      }

      showToast.success('Post deleted successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast.error(error.message || 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const getMaxCharacterCount = () => {
    if (selectedPlatforms.length === 0) return null;

    const limits = selectedPlatforms.map(accountId => {
      const account = connectedAccounts.find(a => a.id === accountId);
      if (account) {
        return PLATFORM_CONFIG[account.platform].maxLength;
      }
      return Infinity;
    });

    return Math.min(...limits);
  };

  const maxChars = getMaxCharacterCount();
  const charCount = content.length;
  const isOverLimit = maxChars && charCount > maxChars;

  // Group accounts by platform
  const getAccountsByPlatform = () => {
    const grouped = {};
    connectedAccounts.forEach(account => {
      if (!grouped[account.platform]) {
        grouped[account.platform] = [];
      }
      grouped[account.platform].push(account);
    });
    return grouped;
  };

  const accountsByPlatform = getAccountsByPlatform();

  // Handle proceeding to Step 2
  const handleProceedToStep2 = () => {
    if (selectedPlatforms.length === 0) {
      setErrors({ ...errors, platforms: 'Please select at least one account' });
      return;
    }
    setErrors({ ...errors, platforms: null });
    setCurrentStep(2);
  };

  // Get platform-specific requirements
  const getPlatformRequirements = () => {
    const requirements = selectedPlatforms.map(accountId => {
      const account = connectedAccounts.find(a => a.id === accountId);
      if (!account) return null;

      const config = PLATFORM_CONFIG[account.platform];
      if (!config) return null;

      const charCount = content.length;
      const charLimit = config.maxLength;
      const charStatus = charCount > charLimit ? 'error' : charCount > charLimit * 0.9 ? 'warning' : 'ok';

      // Check media requirements
      const hasMedia = media.length > 0;
      const mediaRequired = config.requiresMedia;
      const mediaStatus = mediaRequired && !hasMedia ? 'error' : 'ok';

      // Check media count
      const mediaCount = media.length;
      const maxMedia = config.maxMedia || 10;
      const mediaCountStatus = mediaCount > maxMedia ? 'error' : 'ok';

      return {
        accountId,
        platform: account.platform,
        config,
        account,
        charCount,
        charLimit,
        charStatus,
        hasMedia,
        mediaRequired,
        mediaStatus,
        mediaCount,
        maxMedia,
        mediaCountStatus,
      };
    }).filter(Boolean);

    return requirements;
  };

  // Render platform requirements section
  const renderPlatformRequirements = () => {
    const requirements = getPlatformRequirements();
    if (requirements.length === 0) return null;

    return (
      <PlatformRequirements>
        <PlatformRequirementHeader>
          <Info size={16} />
          Platform Requirements
        </PlatformRequirementHeader>

        {requirements.map(req => {
          const Icon = req.config.icon;
          const hasIssues = req.charStatus === 'error' || req.mediaStatus === 'error' || req.mediaCountStatus === 'error';

          return (
            <PlatformRequirementItem key={req.accountId} $color={req.config.color}>
              <PlatformRequirementIcon $color={req.config.color}>
                <Icon size={18} />
              </PlatformRequirementIcon>
              <PlatformRequirementContent>
                <PlatformRequirementTitle>{req.config.name}</PlatformRequirementTitle>

                {/* Character limit */}
                <PlatformRequirementDetail className={req.charStatus}>
                  {req.charStatus === 'error' && '❌'}
                  {req.charStatus === 'warning' && '⚠️'}
                  {req.charStatus === 'ok' && '✓'}
                  {' '}Character limit: {req.charCount} / {req.charLimit}
                </PlatformRequirementDetail>

                {/* Media requirement */}
                {req.mediaRequired && (
                  <PlatformRequirementDetail className={req.mediaStatus}>
                    {req.mediaStatus === 'error' && '❌ Media required'}
                    {req.mediaStatus === 'ok' && `✓ Media attached (${req.mediaCount})`}
                  </PlatformRequirementDetail>
                )}

                {/* Media count */}
                {!req.mediaRequired && req.hasMedia && (
                  <PlatformRequirementDetail className={req.mediaCountStatus}>
                    {req.mediaCountStatus === 'error' && `❌ Too many media files (max ${req.maxMedia})`}
                    {req.mediaCountStatus === 'ok' && `✓ Media: ${req.mediaCount} / ${req.maxMedia}`}
                  </PlatformRequirementDetail>
                )}

                {/* Best practices */}
                {req.platform === 'twitter' && req.hasMedia && (
                  <PlatformRequirementDetail className="success">
                    💡 Tweets with images get 150% more engagement
                  </PlatformRequirementDetail>
                )}

                {req.platform === 'instagram' && hashtags.length > 0 && (
                  <PlatformRequirementDetail className="success">
                    💡 Using {hashtags.length} hashtag{hashtags.length > 1 ? 's' : ''} (recommended: 5-10)
                  </PlatformRequirementDetail>
                )}

                {req.platform === 'linkedin' && req.charCount > 1300 && (
                  <PlatformRequirementDetail className="warning">
                    ⚠️ Long posts may be truncated in feed. Keep under 1,300 chars for full visibility
                  </PlatformRequirementDetail>
                )}
              </PlatformRequirementContent>
            </PlatformRequirementItem>
          );
        })}
      </PlatformRequirements>
    );
  };

  // Render character limits for each platform
  const renderCharacterLimits = () => {
    const requirements = getPlatformRequirements();
    if (requirements.length === 0) return null;

    return (
      <CharacterLimitsGrid>
        {requirements.map(req => {
          const Icon = req.config.icon;
          return (
            <CharacterLimitCard key={req.accountId} $status={req.charStatus}>
              <CharacterLimitIcon $color={req.config.color}>
                <Icon />
              </CharacterLimitIcon>
              <CharacterLimitInfo $status={req.charStatus}>
                <div className="platform-name">{req.config.name}</div>
                <div className="char-count">
                  {req.charCount} / {req.charLimit}
                </div>
              </CharacterLimitInfo>
            </CharacterLimitCard>
          );
        })}
      </CharacterLimitsGrid>
    );
  };

  // Render Step 1: Account Selection
  const renderAccountSelection = () => {
    if (connectedAccounts.length === 0) {
      return (
        <AccountSelectionContainer>
          <EmptyState>
            <h3>No accounts connected yet</h3>
            <p>Connect your social media accounts to start scheduling posts</p>
            <Button onClick={() => {
              onClose();
              // Navigate to accounts page - you might need to use router here
              window.location.href = '/dashboard/accounts';
            }}>
              Connect Account
            </Button>
          </EmptyState>
        </AccountSelectionContainer>
      );
    }

    return (
      <AccountSelectionContainer>
        <StepHeader>
          <StepTitle>Select platforms & accounts</StepTitle>
          <StepDescription>Choose which accounts you want to post to</StepDescription>
        </StepHeader>

        {errors.platforms && <ErrorMessage style={{ textAlign: 'center' }}>{errors.platforms}</ErrorMessage>}

        <PlatformGroupsContainer>
          {Object.entries(PLATFORM_CONFIG).map(([platformId, config]) => {
            const Icon = config.icon;
            const platformAccounts = accountsByPlatform[platformId] || [];
            const realPlatformAccounts = platformAccounts.filter(acc => !acc.is_demo);

            // Get the first connected account for this platform (one account per platform)
            const primaryAccount = realPlatformAccounts[0];
            const isConnected = realPlatformAccounts.length > 0;
            const isSelected = primaryAccount && selectedPlatforms.includes(primaryAccount.id);

            return (
              <PlatformGroup
                key={platformId}
                $selected={isSelected}
                $color={config.color}
                onClick={() => {
                  if (isConnected) {
                    togglePlatform(primaryAccount.id);
                  } else {
                    onClose();
                    window.location.href = '/dashboard/accounts';
                  }
                }}
              >
                {isSelected && (
                  <PlatformSelectedBadge $color={config.color}>
                    <Check />
                  </PlatformSelectedBadge>
                )}
                <PlatformGroupHeader>
                  <PlatformGroupIcon $color={config.color} $selected={isSelected}>
                    <Icon />
                  </PlatformGroupIcon>
                  <PlatformGroupTitle $selected={isSelected} $color={config.color}>
                    <h4>{config.name}</h4>
                    <p>{PLATFORM_DESCRIPTIONS[platformId]}</p>
                  </PlatformGroupTitle>
                </PlatformGroupHeader>

                {isConnected ? (
                  <PlatformAccountInfo>
                    @{primaryAccount.platform_username || primaryAccount.username || 'connected'}
                  </PlatformAccountInfo>
                ) : (
                  <PlatformAccountInfo style={{ color: config.color, fontWeight: 500 }}>
                    + Connect
                  </PlatformAccountInfo>
                )}
              </PlatformGroup>
            );
          })}
        </PlatformGroupsContainer>

        <ConnectAccountSection>
          <ConnectAccountButton
            type="button"
            onClick={() => {
              onClose();
              window.location.href = '/dashboard/accounts';
            }}
          >
            <Plus size={18} />
            Connect New Account
          </ConnectAccountButton>
        </ConnectAccountSection>
      </AccountSelectionContainer>
    );
  };

  // Get the selected platform type (if only one platform selected)
  const getSelectedPlatformType = () => {
    if (selectedPlatforms.length !== 1) return null;
    const account = connectedAccounts.find(a => a.id === selectedPlatforms[0]);
    return account?.platform || null;
  };

  // Render Step 2: Composer with Platform Tabs
  const renderComposer = () => {
    if (selectedPlatforms.length === 0) {
      return <div>Please select at least one platform</div>;
    }

    // Render tabs if multiple platforms selected
    const renderPlatformTabs = () => {
      if (selectedPlatforms.length <= 1) return null;

      return (
        <PlatformTabs>
          {selectedPlatforms.map(accountId => {
            const account = connectedAccounts.find(acc => acc.id === accountId);
            if (!account) return null;

            const config = PLATFORM_CONFIG[account.platform];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <PlatformTab
                key={accountId}
                type="button"
                $active={activePlatformTab === accountId}
                $color={config.color}
                onClick={() => setActivePlatformTab(accountId)}
              >
                <Icon size={20} />
                {config.name}
              </PlatformTab>
            );
          })}
        </PlatformTabs>
      );
    };

    // Render composer for each platform
    const renderPlatformComposer = (accountId) => {
      const account = connectedAccounts.find(acc => acc.id === accountId);
      if (!account) return null;

      const platformType = account.platform;
      const data = platformData[accountId] || { content: '', media: [], hashtags: [] };

      return (
        <PlatformTabContent key={accountId} $active={activePlatformTab === accountId}>
          <Form onSubmit={handleSubmit}>
            {/* Platform-Specific Composers */}
            {platformType === 'twitter' && (
              <TwitterComposer
                value={data.content}
                onChange={(val) => updateActivePlatformData({ content: val })}
                media={data.media}
                onMediaChange={(val) => updateActivePlatformData({ media: val })}
                onMediaUpload={() => setShowMediaLibrary(true)}
              />
            )}

            {platformType === 'youtube' && (
              <YouTubeComposer
                video={data.media[0]}
                title={data.content.split('\n')[0] || ''}
                description={data.content.split('\n').slice(1).join('\n') || data.content}
                tags={data.hashtags}
                onVideoChange={(video) => updateActivePlatformData({ media: [video] })}
                onTitleChange={(title) => {
                  const desc = data.content.split('\n').slice(1).join('\n');
                  updateActivePlatformData({ content: desc ? `${title}\n${desc}` : title });
                }}
                onDescriptionChange={(desc) => {
                  const title = data.content.split('\n')[0];
                  updateActivePlatformData({ content: title ? `${title}\n${desc}` : desc });
                }}
                onTagsChange={(val) => updateActivePlatformData({ hashtags: val })}
                onVideoUpload={() => setShowMediaLibrary(true)}
              />
            )}

            {platformType === 'tiktok' && (
              <TikTokComposer
                video={data.media[0]}
                caption={data.content}
                hashtags={data.hashtags}
                onVideoChange={(video) => updateActivePlatformData({ media: [video] })}
                onCaptionChange={(val) => updateActivePlatformData({ content: val })}
                onHashtagsChange={(val) => updateActivePlatformData({ hashtags: val })}
                onVideoUpload={() => setShowMediaLibrary(true)}
              />
            )}

            {platformType === 'instagram' && (
              <InstagramComposer
                media={data.media}
                caption={data.content}
                hashtags={data.hashtags}
                postType={data.content_type || 'feed'}
                location={data.location || ''}
                altText={data.altText || ''}
                coverFrame={data.coverFrame}
                firstComment={data.firstComment || ''}
                taggedUsers={data.taggedUsers || []}
                onMediaChange={(val) => updateActivePlatformData({ media: val })}
                onCaptionChange={(val) => updateActivePlatformData({ content: val })}
                onHashtagsChange={(val) => updateActivePlatformData({ hashtags: val })}
                onPostTypeChange={(val) => updateActivePlatformData({ content_type: val })}
                onLocationChange={(val) => updateActivePlatformData({ location: val })}
                onAltTextChange={(val) => updateActivePlatformData({ altText: val })}
                onCoverFrameChange={(val) => updateActivePlatformData({ coverFrame: val })}
                onFirstCommentChange={(val) => updateActivePlatformData({ firstComment: val })}
                onTaggedUsersChange={(val) => updateActivePlatformData({ taggedUsers: val })}
                onMediaUpload={() => setShowMediaLibrary(true)}
                onCoverFrameUpload={() => setShowMediaLibrary(true)}
              />
            )}

            {platformType === 'facebook' && (
              <FacebookComposer
                content={data.content}
                media={data.media}
                postType={data.content_type || 'post'}
                audience={data.audience || 'public'}
                feeling={data.feeling}
                location={data.location || ''}
                taggedPeople={data.taggedPeople || []}
                hashtags={data.hashtags || []}
                onContentChange={(val) => updateActivePlatformData({ content: val })}
                onMediaChange={(val) => updateActivePlatformData({ media: val })}
                onPostTypeChange={(val) => updateActivePlatformData({ content_type: val })}
                onAudienceChange={(val) => updateActivePlatformData({ audience: val })}
                onFeelingChange={(val) => updateActivePlatformData({ feeling: val })}
                onLocationChange={(val) => updateActivePlatformData({ location: val })}
                onTagPeople={(val) => updateActivePlatformData({ taggedPeople: val })}
                onHashtagsChange={(val) => updateActivePlatformData({ hashtags: val })}
                onMediaUpload={() => setShowMediaLibrary(true)}
              />
            )}

            {platformType === 'linkedin' && (
              <LinkedInComposer
                content={data.content}
                hashtags={data.hashtags}
                media={data.media}
                onContentChange={(val) => updateActivePlatformData({ content: val })}
                onHashtagsChange={(val) => updateActivePlatformData({ hashtags: val })}
                onMediaChange={(val) => updateActivePlatformData({ media: val })}
                onMediaUpload={() => setShowMediaLibrary(true)}
              />
            )}

            {/* Schedule Section - Common for all platforms */}
            <ScheduleSection>
              <ScheduleHeader>
                <ScheduleIcon>
                  <Calendar size={18} />
                </ScheduleIcon>
                <span>When to Post</span>
              </ScheduleHeader>

              {/* Toggle between Post Now and Schedule */}
              <PostTimingToggle>
                <PostTimingButton
                  type="button"
                  $active={postNow}
                  onClick={() => {
                    setPostNow(true);
                    setScheduledDate('');
                    setScheduledTime('');
                  }}
                >
                  <Send size={18} />
                  Post Now
                </PostTimingButton>
                <PostTimingButton
                  type="button"
                  $active={!postNow}
                  onClick={() => setPostNow(false)}
                >
                  <Clock size={18} />
                  Schedule for Later
                </PostTimingButton>
              </PostTimingToggle>

              {/* Show scheduling fields only when "Schedule for Later" is selected */}
              {!postNow && (
                <>
                  <ScheduleGrid>
                    <InputGroup>
                      <InputLabel>Date</InputLabel>
                      <StyledDateTimeInput>
                        <Input
                          type="date"
                          leftIcon={<Calendar size={20} />}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          disabled={loading}
                        />
                      </StyledDateTimeInput>
                    </InputGroup>

                    <InputGroup>
                      <InputLabel>Time</InputLabel>
                      <StyledDateTimeInput>
                        <Input
                          type="time"
                          leftIcon={<Clock size={20} />}
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          disabled={loading}
                        />
                      </StyledDateTimeInput>
                    </InputGroup>

                    <InputGroup>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        options={[
                          { value: 'America/New_York', label: 'Eastern Time (ET)' },
                          { value: 'America/Chicago', label: 'Central Time (CT)' },
                          { value: 'America/Denver', label: 'Mountain Time (MT)' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                          { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
                          { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
                          { value: 'Europe/London', label: 'London (GMT/BST)' },
                          { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
                          { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
                          { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
                          { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
                          { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
                          { value: 'Asia/Dubai', label: 'Dubai (GST)' },
                          { value: 'Asia/Kolkata', label: 'India (IST)' },
                          { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
                          { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                          { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
                          { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
                          { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
                          { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)' },
                          { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
                          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
                        ]}
                        disabled={loading}
                      />
                    </InputGroup>
                  </ScheduleGrid>

                  {!scheduledDate && !scheduledTime ? (
                    <ScheduleHint>
                      <Info size={16} />
                      <span>Select a date and time to schedule automatic posting.</span>
                    </ScheduleHint>
                  ) : (
                    <ScheduleHint>
                      <Info size={16} />
                      <span>
                        Your post will be published on{' '}
                        <strong>
                          {new Date(`${scheduledDate}T${scheduledTime || '00:00'}`).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: timezone
                          })}
                        </strong>
                        {' '}({timezone.split('/').pop().replace(/_/g, ' ')})
                      </span>
                    </ScheduleHint>
                  )}
                </>
              )}

              {/* Show hint for Post Now */}
              {postNow && (
                <ScheduleHint>
                  <Info size={16} />
                  <span>Your post will be published immediately after you click "Save Post".</span>
                </ScheduleHint>
              )}
            </ScheduleSection>
          </Form>
        </PlatformTabContent>
      );
    };

    return (
      <>
        {renderPlatformTabs()}
        {selectedPlatforms.map(accountId => renderPlatformComposer(accountId))}
      </>
    );
  };

  // Render Step 3: Preview
  const renderPreview = () => {
    return (
      <PreviewContainer>
        {/* Schedule Information */}
        <PreviewSection>
          <PreviewHeader>
            <Calendar size={18} />
            {postNow ? 'Posting Now' : 'Scheduled For'}
          </PreviewHeader>

          {postNow ? (
            <ScheduleInfoCard>
              <ScheduleDateDisplay>
                <Send size={32} style={{ display: 'inline-block', marginBottom: '8px' }} />
              </ScheduleDateDisplay>
              <ScheduleTimeDisplay>Post Immediately</ScheduleTimeDisplay>
              <ScheduleTimezoneDisplay>
                Your post will be published as soon as you click "Schedule Post"
              </ScheduleTimezoneDisplay>
            </ScheduleInfoCard>
          ) : (
            <ScheduleInfoCard>
              <ScheduleDateDisplay>
                {scheduledDate && new Date(scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </ScheduleDateDisplay>
              <ScheduleTimeDisplay>
                {scheduledTime && new Date(`${scheduledDate}T${scheduledTime}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </ScheduleTimeDisplay>
              <ScheduleTimezoneDisplay>
                {timezone.split('/').pop().replace(/_/g, ' ')}
              </ScheduleTimezoneDisplay>
            </ScheduleInfoCard>
          )}

          {/* Platform Badges */}
          <PlatformsList>
            {selectedPlatforms.map(accountId => {
              const account = connectedAccounts.find(a => a.id === accountId);
              if (!account) return null;

              const config = PLATFORM_CONFIG[account.platform];
              if (!config) return null;

              const Icon = config.icon;

              return (
                <PlatformBadge key={accountId} $color={config.color}>
                  <Icon />
                  {config.name}
                </PlatformBadge>
              );
            })}
          </PlatformsList>
        </PreviewSection>

        {/* Post Previews */}
        {selectedPlatforms.map(accountId => {
          const account = connectedAccounts.find(a => a.id === accountId);
          if (!account) return null;

          const data = platformData[accountId] || { content: '', media: [], hashtags: [] };
          const config = PLATFORM_CONFIG[account.platform];
          if (!config) return null;

          const Icon = config.icon;

          // Format content with hashtags
          let displayContent = data.content || '';
          if (data.hashtags && data.hashtags.length > 0) {
            const hashtagString = data.hashtags.map(tag => `#${tag}`).join(' ');
            if (displayContent && !displayContent.includes('#')) {
              displayContent = `${displayContent}\n\n${hashtagString}`;
            }
          }

          return (
            <PreviewSection key={accountId}>
              <PreviewHeader>
                <Icon size={18} />
                {config.name} Preview
              </PreviewHeader>

              <PostPreviewCard>
                <PostPreviewHeader>
                  <PostPreviewAvatar $color={config.color}>
                    <Icon size={20} />
                  </PostPreviewAvatar>
                  <PostPreviewAccountInfo>
                    <div className="account-name">
                      {account.platform_username || account.username || config.name}
                    </div>
                    <div className="post-date">
                      {postNow ? 'Just now' : 'Scheduled'}
                    </div>
                  </PostPreviewAccountInfo>
                </PostPreviewHeader>

                {displayContent && (
                  <PostPreviewContent>
                    {displayContent}
                  </PostPreviewContent>
                )}

                {data.media && data.media.length > 0 && (
                  <PostPreviewMedia $count={data.media.length}>
                    {data.media.slice(0, 4).map((item, index) => {
                      if (item.media_type === 'video' || item.mime_type?.startsWith('video/')) {
                        return (
                          <video key={index} src={item.file_url || item.thumbnail_url}>
                            Your browser does not support the video tag.
                          </video>
                        );
                      }
                      return (
                        <img
                          key={index}
                          src={item.file_url || item.thumbnail_url}
                          alt={item.alt_text || `Media ${index + 1}`}
                        />
                      );
                    })}
                  </PostPreviewMedia>
                )}
              </PostPreviewCard>
            </PreviewSection>
          );
        })}
      </PreviewContainer>
    );
  };

  return (
    <>
    <DateTimePickerStyles />
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        currentStep === 1 ? 'Select Accounts' :
        currentStep === 2 ? (postToEdit ? 'Edit Post' : 'Create Post') :
        'Preview Post'
      }
      size="lg"
      closeOnOverlayClick={false}
      footer={
        currentStep === 1 ? (
          <>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceedToStep2}
              disabled={loadingAccounts || selectedPlatforms.length === 0}
            >
              {postToEdit ? 'Next: Edit Post' : 'Next: Create Post'}
            </Button>
          </>
        ) : currentStep === 2 ? (
          <>
            {!postToEdit && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
              >
                <ChevronLeft size={16} />
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {postToEdit ? (
              // Edit mode: Show only Save Changes button
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={loadingAccounts}
              >
                Save Changes
              </Button>
            ) : (
              // Create mode: Show Next: Preview button
              <Button
                onClick={() => {
                  if (validateForm()) {
                    setCurrentStep(3);
                  }
                }}
                disabled={loadingAccounts}
              >
                Next: Preview
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(2)}
              disabled={loading}
            >
              <ChevronLeft size={16} />
              Back to Edit
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loadingAccounts}
            >
              Schedule Post
            </Button>
          </>
        )
      }
    >
      {/* Step Indicator */}
      <StepIndicator>
        <StepDot $active={currentStep === 1} />
        <StepLabel $active={currentStep === 1}>Select Accounts</StepLabel>
        <span style={{ color: '#d1d5db' }}>→</span>
        <StepDot $active={currentStep === 2} />
        <StepLabel $active={currentStep === 2}>Create Post</StepLabel>
        <span style={{ color: '#d1d5db' }}>→</span>
        <StepDot $active={currentStep === 3} />
        <StepLabel $active={currentStep === 3}>Preview</StepLabel>
      </StepIndicator>

      {/* Conditional Rendering based on Step */}
      {currentStep === 1 ? renderAccountSelection() : currentStep === 2 ? renderComposer() : renderPreview()}
    </Modal>

    {/* Media Library Selector Modal */}
    <MediaLibrarySelector
      isOpen={showMediaLibrary}
      onClose={() => setShowMediaLibrary(false)}
      onSelect={handleMediaLibrarySelect}
      multiple={true}
    />
    </>
  );
}
