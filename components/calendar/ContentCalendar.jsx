/**
 * Content Calendar Component - Redesigned to match UI mockups
 *
 * Features:
 * - Weekly view with time-slot grid
 * - Monthly view with event count pills
 * - Upcoming events sidebar
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Settings, Instagram, Facebook, Linkedin, Twitter, Plus, Calendar, X, Clock, Globe } from 'lucide-react';
import BestTimesModal from './BestTimesModal';
import CalendarPostCard from './CalendarPostCard';
import AddPostButton from './AddPostButton';
import CalendarPostPill, { MorePostsIndicator } from './CalendarPostPill';
import DayPostsModal from './DayPostsModal';
import { countries, getDayByDayPostingTimes } from '@/lib/data/best-posting-times';

// ==================== STYLED COMPONENTS ====================

const CalendarWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const CalendarMain = styled.div`
  width: 100%;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const MonthTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  min-width: 120px;
  text-align: center;
`;

const TimezoneBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.success.main}15, ${props => props.theme.colors.success.main}25);
  border: 1px solid ${props => props.theme.colors.success.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.success.dark};
  white-space: nowrap;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  background: ${props => props.theme.colors.background.default};
  padding: 4px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const ViewButton = styled.button`
  padding: 8px 20px;
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.dark : props.theme.colors.background.hover};
  }
`;

const SettingsButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  border-radius: 10px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    border-color: ${props => props.theme.colors.border.hover};
  }
`;

const UpcomingButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  border-radius: 10px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    border-color: ${props => props.theme.colors.border.hover};
  }
`;

const BestTimesButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid ${props => props.theme.colors.success.main};
  background: linear-gradient(135deg, ${props => props.theme.colors.success.main}10, ${props => props.theme.colors.success.main}20);
  border-radius: 10px;
  cursor: pointer;
  color: ${props => props.theme.colors.success.dark};
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, ${props => props.theme.colors.success.main}20, ${props => props.theme.colors.success.main}30);
    border-color: ${props => props.theme.colors.success.dark};
  }
`;

const TimeFormatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  border-radius: 10px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    border-color: ${props => props.theme.colors.border.hover};
  }
`;

// ==================== WEEKLY VIEW COMPONENTS ====================

const WeeklyViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow: hidden;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const WeeklyHeader = styled.div`
  display: flex;
  background: ${props => props.theme.colors.background.default};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  position: sticky;
  top: 0;
  z-index: 20;
`;

const TimeColumnHeader = styled.div`
  min-width: 70px;
  flex-shrink: 0;
  border-right: 1px solid ${props => props.theme.colors.border.default};
  padding: ${props => props.theme.spacing.md};
`;

const WeeklyHeaderGrid = styled.div`
  display: flex;
  flex: 1;
`;

const WeeklyScrollContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.default};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.default};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.border.hover};
  }
`;

const TimeColumn = styled.div`
  min-width: 70px;
  flex-shrink: 0;
  background: ${props => props.theme.colors.background.paper};
  border-right: 1px solid ${props => props.theme.colors.border.default};
  position: sticky;
  left: 0;
  z-index: 10;
`;

const TimeLabel = styled.div`
  height: 100px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  font-size: 11px;
  color: ${props => props.$isBestTime ? '#10B981' : props.theme.colors.text.secondary};
  font-weight: ${props => props.$isBestTime ? '700' : '500'};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: relative;
  background: ${props => props.$isBestTime ? 'rgba(16, 185, 129, 0.08)' : 'transparent'};

  /* Best time indicator dot */
  ${props => props.$isBestTime && `
    &::before {
      content: '';
      position: absolute;
      right: 4px;
      top: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 4px rgba(16, 185, 129, 0.5);
    }
  `}
`;

const WeeklyGrid = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
`;

const DayHeaderCell = styled.div`
  min-width: 150px;
  flex: 1;
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  border-right: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.$isToday ? `${props.theme.colors.primary.main}15` : 'transparent'};
  box-sizing: border-box;

  ${props => props.$isToday && `
    border-left: 2px solid ${props.theme.colors.primary.main};
    border-right: 2px solid ${props.theme.colors.primary.main};
  `}

  &:last-child {
    border-right: 1px solid ${props => props.theme.colors.border.default};
  }
`;

const WeekDayColumn = styled.div`
  min-width: 150px;
  flex: 1;
  position: relative;
  border-right: 1px solid ${props => props.theme.colors.border.default};
  min-height: calc(100px * 24); /* 24 hours * 100px per hour */
  background: ${props => props.$isToday ? `${props.theme.colors.primary.main}08` : 'transparent'};
  box-sizing: border-box;

  ${props => props.$isToday && `
    border-left: 2px solid ${props.theme.colors.primary.main};
    border-right: 2px solid ${props.theme.colors.primary.main};
  `}

  &:last-child {
    border-right: 1px solid ${props => props.theme.colors.border.default};
  }
`;

const DayLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const DayTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const TimeSlots = styled.div`
  position: relative;
  width: 100%;
`;

const TimeSlot = styled.div`
  min-height: 100px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  position: relative;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  padding: 6px 8px;

  /* Best time slot highlight - more visible */
  ${props => props.$isBestTime && `
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.18)) !important;
    border-left: 4px solid #10B981 !important;
    box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.2);
  `}

  &:hover {
    background: ${props => props.$isBestTime
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.25))'
      : props.$isEmpty
        ? `linear-gradient(135deg, ${props.theme.colors.success.main}08, ${props.theme.colors.success.main}12)`
        : props.theme.colors.background.hover};
  }

  &:hover .slot-add-btn {
    opacity: 1;
  }

  /* Enhanced empty slot hover */
  &.empty-slot:hover {
    background: linear-gradient(135deg, ${props => props.theme.colors.success.main}08, ${props => props.theme.colors.success.main}12);
    border-radius: 8px;
  }

  &.drag-over {
    background: ${props => `${props.theme.colors.primary.main}20`};
    border: 2px dashed ${props => props.theme.colors.primary.main};
    border-radius: 8px;
    box-shadow: inset 0 0 20px ${props => `${props.theme.colors.primary.main}15`},
                0 4px 12px ${props => `${props.theme.colors.primary.main}25`};
    transform: scale(1.01);

    &::before {
      content: 'Drop here to reschedule';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${props => props.theme.colors.primary.main};
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0.9;
      z-index: 5;
    }
  }
`;

// Horizontal container for posts in a time slot
const SlotPostsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  padding: 4px;
  overflow: hidden;
`;

const SlotAddButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px dashed ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  z-index: 5;

  &:hover {
    transform: translate(-50%, -50%) scale(1.15);
    background: ${props => props.theme.colors.success.main};
    color: white;
    border-color: ${props => props.theme.colors.success.main};
    border-style: solid;
    box-shadow: 0 4px 12px ${props => props.theme.colors.success.main}40;
    opacity: 1;
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.success.light};
    outline-offset: 2px;
    opacity: 1;
  }
`;

const EventCard = styled.div`
  position: absolute;
  left: 4px;
  right: 4px;
  z-index: 10;
  pointer-events: auto;
  background: ${props => {
    switch(props.$color) {
      case 'orange': return 'linear-gradient(135deg, #FFF4E6 0%, #FFEDD5 100%)';
      case 'purple': return 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)';
      case 'red': return 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)';
      case 'green': return 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)';
      case 'blue': return 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)';
      default: return 'linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.$color) {
      case 'orange': return '#FB923C';
      case 'purple': return '#A78BFA';
      case 'red': return '#F87171';
      case 'green': return '#34D399';
      case 'blue': return '#60A5FA';
      default: return '#D1D5DB';
    }
  }};
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 15;
  }

  &:active {
    transform: translateX(1px);
  }
`;

// Wrapper for CalendarPostCard positioning in time slots (absolute for week view)
const PostCardWrapper = styled.div`
  position: absolute;
  left: 4px;
  right: 4px;
  z-index: 10;
  pointer-events: auto;
`;

const EventTime = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const EventTitle = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EventAvatars = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color || '#D1D5DB'};
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  font-weight: 600;
`;

const AvatarCount = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$color || '#4A5568'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
`;

// ==================== MONTHLY VIEW COMPONENTS ====================

const MonthlyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${props => props.theme.colors.border.default};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const MonthDayHeader = styled.div`
  background: ${props => props.theme.colors.background.default};
  padding: ${props => props.theme.spacing.md};
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const MonthDayCell = styled.div`
  background: ${props => {
    if (props.$isToday) return `${props.theme.colors.primary.main}15`;
    return props.theme.colors.background.paper;
  }};
  min-height: 120px;
  padding: ${props => props.theme.spacing.sm};
  position: relative;
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.4};
  cursor: pointer;
  transition: background 0.2s;
  border: ${props => props.$isToday ? `2px solid ${props.theme.colors.primary.main}` : 'none'};

  &:hover {
    background: ${props => props.$isToday ? `${props.theme.colors.primary.main}25` : props.theme.colors.background.hover};
  }

  &:hover .month-add-btn {
    opacity: 1;
  }

  .month-add-btn {
    opacity: 0;
    transition: opacity 0.2s;
  }
`;

const MonthDayCellHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DayNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const EventPills = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EventPill = styled.div`
  background: ${props => {
    switch(props.$color) {
      case 'orange': return '#FB923C';
      case 'yellow': return '#FBBF24';
      case 'blue': return '#60A5FA';
      default: return '#D1D5DB';
    }
  }};
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 28px;
  text-align: center;
`;

// Current Time Indicator
const CurrentTimeLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: ${props => props.theme.colors.error.main};
  z-index: 15;
  pointer-events: none;
  box-shadow: 0 0 8px ${props => props.theme.colors.error.main}80;

  &::before {
    content: '';
    position: absolute;
    left: -2px;
    top: -5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.theme.colors.error.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.error.main}30,
                0 0 12px ${props => props.theme.colors.error.main}60;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  &::after {
    content: attr(data-time);
    position: absolute;
    left: 20px;
    top: -8px;
    background: ${props => props.theme.colors.error.main};
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.8;
    }
  }
`;

// ==================== SIDEBAR COMPONENTS ====================

const Sidebar = styled.div`
  width: 350px;
  flex-shrink: 0;
`;

const SidebarSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  padding: ${props => props.theme.spacing.xl};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const SubsectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const UpcomingEvent = styled.div`
  background: ${props => {
    switch(props.$color) {
      case 'yellow': return '#FEF3C7';
      case 'blue': return '#DBEAFE';
      case 'pink': return '#FCE7F3';
      default: return '#F5F5F5';
    }
  }};
  border-radius: 12px;
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const EventLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    width: 24px;
    height: 24px;
  }
`;

const EventDetails = styled.div`
  flex: 1;
`;

const EventName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const EventTimeRange = styled.div`
  font-size: 13px;
  color: #666;
`;

const EventDate = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  flex-shrink: 0;
`;

// ==================== MODAL COMPONENTS ====================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.xl};
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  padding: ${props => props.theme.spacing.xl};
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

// ==================== SETTINGS MODAL COMPONENTS ====================

const SettingGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const SettingDescription = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Switch = styled.button`
  width: 48px;
  height: 26px;
  background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border: none;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &:after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '25px' : '3px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
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
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
`;

const RadioInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.border.hover};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const ExportButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
`;

// ==================== MAIN COMPONENT ====================

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PLATFORM_COLORS = ['orange', 'purple', 'red', 'green', 'blue'];

export default function ContentCalendar({
  posts = [],
  accounts = [],
  onPostClick,
  onPostEdit,
  onPostReschedule,
  onPostDelete,
  onDateClick,
  onPostMove,
  viewMode = 'week',
  onViewModeChange
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBestTimesModal, setShowBestTimesModal] = useState(false);
  const [showDayPostsModal, setShowDayPostsModal] = useState(false);
  const [selectedDayForModal, setSelectedDayForModal] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('Europe/Rome');
  const [selectedLocation, setSelectedLocation] = useState('Rome (Italy)');
  const [selectedRegion, setSelectedRegion] = useState('europe');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IT-ROM');
  const [aiBestTimes, setAiBestTimes] = useState(null);
  const [loadingBestTimes, setLoadingBestTimes] = useState(false);
  const scrollContainerRef = useRef(null);
  const hasScrolledRef = useRef(false);

  // Helper function to get platform from post's account IDs
  const getPlatformFromPost = (post) => {
    if (!post.platforms || !Array.isArray(post.platforms) || post.platforms.length === 0) {
      return 'instagram'; // Default fallback
    }

    // Get first account ID from the post's platforms array
    const accountId = post.platforms[0];

    // Look up the account in the accounts array
    const account = accounts.find(acc => acc.id === accountId);

    // Return the platform or default to instagram
    return account?.platform || 'instagram';
  };

  // Calendar Settings State (load from localStorage or use defaults)
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendarSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      timeFormat: '12', // '12' or '24'
      showWeekends: true,
      weekStartDay: 'monday', // 'sunday' or 'monday'
      timeSlotDuration: 60, // minutes
      colorCoding: 'platform' // 'platform', 'status', or 'account'
    };
  });

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarSettings', JSON.stringify(newSettings));
    }
  };

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Reset scroll flag when view mode changes
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [viewMode]);

  // Fetch AI-generated best times when country changes
  useEffect(() => {
    const fetchAIBestTimes = async () => {
      if (!selectedLocation || !selectedTimezone) return;

      setLoadingBestTimes(true);
      try {
        const response = await fetch('/api/ai/best-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: selectedLocation,
            countryCode: selectedCountryCode,
            timezone: selectedTimezone,
            platform: 'instagram',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.bestTimes) {
            setAiBestTimes(data.bestTimes);
            console.log('AI best times loaded for:', selectedLocation, data.bestTimes);
          }
        } else {
          console.log('AI best times not available, using fallback');
          setAiBestTimes(null);
        }
      } catch (error) {
        console.error('Error fetching AI best times:', error);
        setAiBestTimes(null);
      } finally {
        setLoadingBestTimes(false);
      }
    };

    fetchAIBestTimes();
  }, [selectedLocation, selectedTimezone, selectedCountryCode]);

  // Get best posting times - prefer AI-generated, fallback to static data
  const bestTimesData = useMemo(() => {
    // If we have AI-generated times, use those
    if (aiBestTimes) {
      console.log('Using AI-generated best times for:', selectedLocation);
      return aiBestTimes;
    }

    // Fallback to static region-based data
    const data = getDayByDayPostingTimes(selectedRegion, 'instagram');
    console.log('Using fallback best times for region:', selectedRegion, data);
    return data;
  }, [aiBestTimes, selectedRegion, selectedLocation]);

  // Helper function to parse hour from time slot
  const parseHourFromTimeSlot = (timeSlot) => {
    let hour = null;

    if (timeSlot.time) {
      // Parse from time field like "08:00", "13:00"
      const [h] = timeSlot.time.split(':');
      hour = parseInt(h, 10);
    }

    if (hour === null && timeSlot.label) {
      // Parse from label like "8:00 AM", "1:00 PM"
      const match = timeSlot.label.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hour = parseInt(match[1], 10);
        const period = match[3];
        if (period && period.toUpperCase() === 'PM' && hour !== 12) {
          hour += 12;
        } else if (period && period.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }
      }
    }

    return hour;
  };

  // Helper function to check if a time slot is a "best time" slot
  const isBestTimeSlot = (dayOfWeek, slotHour) => {
    if (!bestTimesData) return false;

    // Map day of week number (0=Sunday) to key
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];

    const dayTimes = bestTimesData[dayKey];
    if (!dayTimes || !Array.isArray(dayTimes)) return false;

    // Check if any of the best times fall within this slot hour
    return dayTimes.some(timeSlot => {
      const hour = parseHourFromTimeSlot(timeSlot);
      return hour !== null && hour === slotHour;
    });
  };

  // Auto-scroll to current time on initial load and when view changes
  useEffect(() => {
    // Only scroll for week/day view
    if (viewMode === 'month') return;

    const scrollToCurrentTime = () => {
      if (!scrollContainerRef.current || hasScrolledRef.current) return;

      // Get current time in selected timezone
      const now = new Date();
      const timeStr = now.toLocaleString('en-US', {
        timeZone: selectedTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const [hours, minutes] = timeStr.split(':').map(Number);

      // Calculate scroll position using same formula as current time indicator
      // Each slot is 100px, slot duration is in minutes
      const slotHeight = 100;
      const minutesSinceMidnight = hours * 60 + minutes;
      const pixelsPerMinute = slotHeight / settings.timeSlotDuration;

      // Scroll to 1 hour before current time to show context
      const currentTimePosition = minutesSinceMidnight * pixelsPerMinute;
      const scrollTo = Math.max(0, currentTimePosition - 150); // 150px offset to show time above

      scrollContainerRef.current.scrollTop = scrollTo;
      hasScrolledRef.current = true;
      console.log('Auto-scrolled to:', scrollTo, 'for time:', hours + ':' + minutes, 'in timezone:', selectedTimezone);
    };

    // Use multiple attempts to ensure DOM is ready
    const timeouts = [100, 300, 500];
    timeouts.forEach(delay => {
      setTimeout(scrollToCurrentTime, delay);
    });
  }, [viewMode, settings.timeSlotDuration, selectedTimezone]);

  // Get current month/week/day data
  const calendarData = useMemo(() => {
    if (viewMode === 'day') {
      // Generate only 1 day (current date)
      return [new Date(currentDate)];
    } else if (viewMode === 'week') {
      // Generate days for the week
      const days = [];
      const targetDays = settings.showWeekends ? 7 : 5; // 7 days with weekends, 5 without
      let daysAdded = 0;
      let offset = 0;

      // Keep adding days until we have the target number
      while (daysAdded < targetDays) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + offset);

        const dayOfWeek = date.getDay();

        // If weekends are disabled, skip Saturday and Sunday
        if (!settings.showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
          offset++;
          continue;
        }

        days.push(date);
        daysAdded++;
        offset++;
      }

      return days;
    } else {
      // Generate full month grid
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Start from Monday of the week containing the 1st
      const startDate = new Date(firstDay);
      const dayOfWeek = firstDay.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
      startDate.setDate(firstDay.getDate() + diff);

      // Generate 42 days (6 weeks)
      const days = [];
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push({
          date,
          isCurrentMonth: date.getMonth() === month
        });
      }
      return days;
    }
  }, [currentDate, viewMode, settings.showWeekends]);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped = {};
    posts.forEach(post => {
      if (post.scheduled_for) {
        const dateKey = new Date(post.scheduled_for).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(post);
      }
    });
    return grouped;
  }, [posts]);

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      // Navigate by the number of days being displayed
      const daysToMove = settings.showWeekends ? 7 : 5;
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - daysToMove);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    } else if (viewMode === 'week') {
      // Navigate by the number of days being displayed
      const daysToMove = settings.showWeekends ? 7 : 5;
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + daysToMove);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(newDate);
    }
  };

  // Handle timezone change from Best Times modal
  const handleTimezoneChange = (timezone, location) => {
    setSelectedTimezone(timezone);
    setSelectedLocation(location);
    // Find the country and get its region and code
    const country = countries.find(c => c.timezone === timezone && c.name === location);
    if (country) {
      setSelectedRegion(country.region);
      setSelectedCountryCode(country.code);
      // Clear AI times to trigger a new fetch
      setAiBestTimes(null);
    }
  };

  // Helper function to format date in selected timezone
  const formatInTimezone = (date, options) => {
    return date.toLocaleString('en-US', {
      ...options,
      timeZone: selectedTimezone
    });
  };

  // Get current date in selected timezone
  const getCurrentDateInTimezone = () => {
    const now = new Date();
    // Get the date string in the selected timezone
    const dateStr = now.toLocaleString('en-US', {
      timeZone: selectedTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return new Date(dateStr);
  };

  // Get current hour and minute in selected timezone
  const getCurrentTimeInTimezone = () => {
    const now = new Date();
    const timeStr = now.toLocaleString('en-US', {
      timeZone: selectedTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  // Format month title
  const monthTitle = viewMode === 'month'
    ? formatInTimezone(currentDate, { month: 'long', year: 'numeric' })
    : formatInTimezone(currentDate, { month: 'long' });

  // Get upcoming posts
  const upcomingPosts = useMemo(() => {
    const now = new Date();
    return posts
      .filter(post => new Date(post.scheduled_for) >= now)
      .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))
      .slice(0, 5);
  }, [posts]);

  // Render weekly view
  const renderWeeklyView = () => {
    // Calculate number of time slots based on duration setting
    const minutesInDay = 24 * 60;
    const slotCount = minutesInDay / settings.timeSlotDuration;
    const slotHeight = 100; // Base height in pixels

    // Generate time labels based on slot duration
    const timeLabels = Array.from({ length: slotCount }, (_, index) => {
      const totalMinutes = index * settings.timeSlotDuration;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;

      if (settings.timeFormat === '24') {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      } else {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
      }
    });

    return (
      <WeeklyViewWrapper>
        {/* Header with day names */}
        <WeeklyHeader>
          <TimeColumnHeader />
          <WeeklyHeaderGrid>
            {calendarData.map((date, index) => {
              // Check if this date is "today" in the selected timezone
              const todayInTimezone = formatInTimezone(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
              const thisDateInTimezone = formatInTimezone(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
              const isToday = todayInTimezone === thisDateInTimezone;
              return (
                <DayHeaderCell key={index} $isToday={isToday}>
                  <DayLabel>{formatInTimezone(date, { weekday: 'short' })}</DayLabel>
                  <DayTime>
                    {formatInTimezone(date, { month: 'short', day: 'numeric' })}
                  </DayTime>
                </DayHeaderCell>
              );
            })}
          </WeeklyHeaderGrid>
        </WeeklyHeader>

        {/* Scrollable content */}
        <WeeklyScrollContainer ref={scrollContainerRef}>
          {/* Time column */}
          <TimeColumn>
            {timeLabels.map((label, index) => {
              // Calculate the hour for this slot
              const totalMinutes = index * settings.timeSlotDuration;
              const hour = Math.floor(totalMinutes / 60);

              // Check if this hour is a best time for any of the visible days
              const isAnyDayBestTime = calendarData.some(date => {
                const dayOfWeek = date.getDay();
                return isBestTimeSlot(dayOfWeek, hour);
              });

              return (
                <TimeLabel key={index} $isBestTime={isAnyDayBestTime}>
                  {label}
                </TimeLabel>
              );
            })}
          </TimeColumn>

          {/* Day columns */}
          <WeeklyGrid>
            {calendarData.map((date, index) => {
              const dateKey = date.toDateString();
              const dayPosts = postsByDate[dateKey] || [];

              // Check if this date is "today" in the selected timezone
              const todayInTimezone = formatInTimezone(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
              const thisDateInTimezone = formatInTimezone(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
              const isToday = todayInTimezone === thisDateInTimezone;

              // Calculate current time position (in pixels from top) using selected timezone
              // Each slot is slotHeight pixels, and slot duration is in minutes
              const { hours, minutes } = getCurrentTimeInTimezone();
              const minutesSinceMidnight = hours * 60 + minutes;
              const pixelsPerMinute = slotHeight / settings.timeSlotDuration;
              const currentTimeTop = minutesSinceMidnight * pixelsPerMinute;

              return (
                <WeekDayColumn key={index} $isToday={isToday} style={{ minHeight: `${slotCount * slotHeight}px` }}>
                  <TimeSlots>
                    {/* Render time slots based on duration setting */}
                    {Array.from({ length: slotCount }, (_, slotIndex) => {
                      const slotHour = Math.floor((slotIndex * settings.timeSlotDuration) / 60);
                      const slotMinute = (slotIndex * settings.timeSlotDuration) % 60;
                      const slotStartMinutes = slotIndex * settings.timeSlotDuration;
                      const slotEndMinutes = slotStartMinutes + settings.timeSlotDuration;

                      // Get posts for this time slot
                      const slotPosts = dayPosts.filter(post => {
                        const postDate = new Date(post.scheduled_for);
                        const postMinutes = postDate.getHours() * 60 + postDate.getMinutes();
                        return postMinutes >= slotStartMinutes && postMinutes < slotEndMinutes;
                      });

                      // Create the target date for this slot
                      const slotDateTime = new Date(date);
                      slotDateTime.setHours(slotHour, slotMinute, 0, 0);

                      const isEmpty = slotPosts.length === 0;

                      // Check if this slot is a best time slot
                      const dayOfWeek = date.getDay(); // 0 = Sunday
                      const isBestTime = isBestTimeSlot(dayOfWeek, slotHour);

                      return (
                        <TimeSlot
                          key={slotIndex}
                          className={isEmpty ? 'empty-slot' : ''}
                          $isEmpty={isEmpty}
                          $isBestTime={isBestTime}
                          style={{ minHeight: `${slotHeight}px` }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('drag-over');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('drag-over');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('drag-over');
                            try {
                              const data = JSON.parse(e.dataTransfer.getData('application/json'));
                              if (data.post && onPostReschedule) {
                                onPostReschedule(data.post, slotDateTime);
                              }
                            } catch (err) {
                              console.error('Drop error:', err);
                            }
                          }}
                        >
                          <SlotPostsRow>
                            {/* Render first 2 posts */}
                            {slotPosts.slice(0, 2).map((post) => (
                              <CalendarPostPill
                                key={post.id}
                                post={post}
                                platform={getPlatformFromPost(post)}
                                showTime={true}
                                onEdit={onPostEdit}
                                onDelete={onPostDelete}
                                onReschedule={onPostReschedule}
                              />
                            ))}
                            {/* Show "+N more" if there are more than 2 posts */}
                            {slotPosts.length > 2 && (
                              <MorePostsIndicator
                                count={slotPosts.length - 2}
                                date={date}
                                onClick={() => {
                                  setSelectedDayForModal({ date, posts: slotPosts });
                                  setShowDayPostsModal(true);
                                }}
                              />
                            )}
                          </SlotPostsRow>
                          {/* Only show add button for empty slots */}
                          {isEmpty && (
                            <SlotAddButton
                              className="slot-add-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const clickDate = new Date(date);
                                clickDate.setHours(slotHour, slotMinute, 0, 0);
                                onDateClick?.(clickDate);
                              }}
                              tabIndex={0}
                              aria-label={`Add post for ${slotHour}:${String(slotMinute).padStart(2, '0')}`}
                            >
                              <Plus size={18} />
                            </SlotAddButton>
                          )}
                        </TimeSlot>
                      );
                    })}

                    {/* Current time indicator - only show for today */}
                    {isToday && (
                      <CurrentTimeLine style={{ top: `${currentTimeTop}px` }} />
                    )}
                  </TimeSlots>
                </WeekDayColumn>
              );
            })}
          </WeeklyGrid>
        </WeeklyScrollContainer>
      </WeeklyViewWrapper>
    );
  };

  // Render monthly view
  const renderMonthlyView = () => (
    <>
      <MonthlyGrid>
        {DAYS_OF_WEEK.map(day => (
          <MonthDayHeader key={day}>{day}</MonthDayHeader>
        ))}
        {calendarData.map((dayData, index) => {
          const { date, isCurrentMonth } = dayData;
          const dateKey = date.toDateString();
          const dayPosts = postsByDate[dateKey] || [];

          // Check if this date is "today" in the selected timezone
          const todayInTimezone = formatInTimezone(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
          const thisDateInTimezone = formatInTimezone(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
          const isToday = todayInTimezone === thisDateInTimezone;

          return (
            <MonthDayCell
              key={index}
              $isCurrentMonth={isCurrentMonth}
              $isToday={isToday}
              className="day-cell"
            >
              <MonthDayCellHeader>
                <DayNumber>{date.getDate()}</DayNumber>
                <AddPostButton
                  view="month"
                  date={date}
                  onCreate={onDateClick}
                  position="inline"
                  alwaysVisible={false}
                  className="month-add-btn"
                />
              </MonthDayCellHeader>
              <EventPills>
                {dayPosts.slice(0, 3).map((post) => (
                  <CalendarPostPill
                    key={post.id}
                    post={post}
                    platform={getPlatformFromPost(post)}
                    showTime={true}
                    onEdit={onPostEdit}
                    onDelete={onPostDelete}
                    onReschedule={onPostReschedule}
                  />
                ))}
                {dayPosts.length > 3 && (
                  <MorePostsIndicator
                    count={dayPosts.length - 3}
                    date={date}
                    onClick={() => {
                      // Open modal with all posts for this day
                      setSelectedDayForModal({ date, posts: dayPosts });
                      setShowDayPostsModal(true);
                    }}
                  />
                )}
              </EventPills>
            </MonthDayCell>
          );
        })}
      </MonthlyGrid>
    </>
  );

  // Render upcoming posts modal
  const renderUpcomingModal = () => {
    if (!showUpcomingModal) return null;

    return (
      <ModalOverlay onClick={() => setShowUpcomingModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Upcoming Posts</ModalTitle>
            <CloseButton onClick={() => setShowUpcomingModal(false)}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            {upcomingPosts.length === 0 ? (
              <EmptyState>No upcoming posts scheduled</EmptyState>
            ) : (
              upcomingPosts.map((post, idx) => {
                const postDate = new Date(post.scheduled_for);
                const colors = ['yellow', 'blue', 'pink'];
                const platform = getPlatformFromPost(post);

                // Get platform icon component
                const PlatformIcon = {
                  instagram: Instagram,
                  facebook: Facebook,
                  linkedin: Linkedin,
                  twitter: Twitter,
                }[platform] || Instagram;

                return (
                  <UpcomingEvent
                    key={post.id}
                    $color={colors[idx % colors.length]}
                    onClick={() => {
                      (onPostClick || onPostEdit)?.(post);
                      setShowUpcomingModal(false);
                    }}
                  >
                    <EventLogo>
                      <PlatformIcon />
                    </EventLogo>
                    <EventDetails>
                      <EventName>{post.content?.substring(0, 30) || 'Post'}...</EventName>
                      <EventTimeRange>
                        {postDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: settings.timeFormat === '12'
                        })}
                      </EventTimeRange>
                    </EventDetails>
                    <EventDate>
                      {postDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </EventDate>
                  </UpcomingEvent>
                );
              })
            )}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  };

  // Render settings modal
  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <ModalOverlay onClick={() => setShowSettingsModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Calendar Settings</ModalTitle>
            <CloseButton onClick={() => setShowSettingsModal(false)}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            {/* Time Format */}
            <SettingGroup>
              <SettingLabel>Time Format</SettingLabel>
              <SettingDescription>Choose between 12-hour or 24-hour time display</SettingDescription>
              <RadioGroup>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="timeFormat"
                    value="12"
                    checked={settings.timeFormat === '12'}
                    onChange={(e) => updateSettings({ ...settings, timeFormat: e.target.value })}
                  />
                  12-hour (1:00 PM)
                </RadioOption>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="timeFormat"
                    value="24"
                    checked={settings.timeFormat === '24'}
                    onChange={(e) => updateSettings({ ...settings, timeFormat: e.target.value })}
                  />
                  24-hour (13:00)
                </RadioOption>
              </RadioGroup>
            </SettingGroup>

            {/* Show Weekends */}
            <SettingGroup>
              <SettingLabel>Show Weekends</SettingLabel>
              <SettingDescription>Toggle weekend display in week view</SettingDescription>
              <ToggleSwitch>
                <Switch
                  $active={settings.showWeekends}
                  onClick={() => updateSettings({ ...settings, showWeekends: !settings.showWeekends })}
                />
                <span>{settings.showWeekends ? 'Enabled' : 'Disabled'}</span>
              </ToggleSwitch>
            </SettingGroup>

            {/* Week Start Day */}
            <SettingGroup>
              <SettingLabel>Week Start Day</SettingLabel>
              <SettingDescription>Choose which day starts the week</SettingDescription>
              <RadioGroup>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="weekStartDay"
                    value="sunday"
                    checked={settings.weekStartDay === 'sunday'}
                    onChange={(e) => updateSettings({ ...settings, weekStartDay: e.target.value })}
                  />
                  Sunday
                </RadioOption>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="weekStartDay"
                    value="monday"
                    checked={settings.weekStartDay === 'monday'}
                    onChange={(e) => updateSettings({ ...settings, weekStartDay: e.target.value })}
                  />
                  Monday
                </RadioOption>
              </RadioGroup>
            </SettingGroup>

            {/* Time Slot Duration */}
            <SettingGroup>
              <SettingLabel>Time Slot Duration</SettingLabel>
              <SettingDescription>Set the time interval for calendar slots</SettingDescription>
              <Select
                value={settings.timeSlotDuration}
                onChange={(e) => updateSettings({ ...settings, timeSlotDuration: Number(e.target.value) })}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </Select>
            </SettingGroup>

            {/* Color Coding */}
            <SettingGroup>
              <SettingLabel>Color Coding</SettingLabel>
              <SettingDescription>Choose how posts are color-coded</SettingDescription>
              <Select
                value={settings.colorCoding}
                onChange={(e) => updateSettings({ ...settings, colorCoding: e.target.value })}
              >
                <option value="platform">By Platform</option>
                <option value="status">By Status</option>
                <option value="account">By Account</option>
              </Select>
            </SettingGroup>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  };

  return (
    <>
      <CalendarWrapper>
        <CalendarMain>
          <CalendarHeader>
            <MonthNavigation>
              <NavButton onClick={handlePrevious}>
                <ChevronLeft size={20} />
              </NavButton>
              <MonthTitle>{monthTitle}</MonthTitle>
              <NavButton onClick={handleNext}>
                <ChevronRight size={20} />
              </NavButton>
              <TimezoneBadge>
                <Globe size={12} />
                {selectedLocation}
                {loadingBestTimes && ' (loading...)'}
              </TimezoneBadge>
            </MonthNavigation>

            <HeaderActions>
              <BestTimesButton onClick={() => setShowBestTimesModal(true)}>
                <Clock size={18} />
              </BestTimesButton>
              <TimeFormatButton
                onClick={() => updateSettings({ ...settings, timeFormat: settings.timeFormat === '12' ? '24' : '12' })}
                title={`Switch to ${settings.timeFormat === '12' ? '24-hour' : '12-hour'} format`}
              >
                {settings.timeFormat === '12' ? '12h' : '24h'}
              </TimeFormatButton>
              <UpcomingButton onClick={() => setShowUpcomingModal(true)}>
                <Calendar size={16} />
                Upcoming Posts
              </UpcomingButton>
              <ViewToggle>
                <ViewButton
                  $active={viewMode === 'week'}
                  onClick={() => onViewModeChange?.('week')}
                >
                  Week
                </ViewButton>
                <ViewButton
                  $active={viewMode === 'month'}
                  onClick={() => onViewModeChange?.('month')}
                >
                  Month
                </ViewButton>
              </ViewToggle>
              <SettingsButton onClick={() => setShowSettingsModal(true)}>
                <Settings size={18} />
              </SettingsButton>
            </HeaderActions>
          </CalendarHeader>

          {viewMode === 'month' ? renderMonthlyView() : renderWeeklyView()}
        </CalendarMain>
      </CalendarWrapper>

      {/* Upcoming Posts Modal */}
      {renderUpcomingModal()}

      {/* Settings Modal */}
      {renderSettingsModal()}

      {/* Best Times Modal */}
      <BestTimesModal
        isOpen={showBestTimesModal}
        onClose={() => setShowBestTimesModal(false)}
        onTimezoneChange={handleTimezoneChange}
      />

      {/* Day Posts Modal (for +N more in Month view) */}
      <DayPostsModal
        date={selectedDayForModal?.date}
        posts={selectedDayForModal?.posts || []}
        isOpen={showDayPostsModal}
        onClose={() => {
          setShowDayPostsModal(false);
          setSelectedDayForModal(null);
        }}
        onEdit={(postId) => {
          const post = selectedDayForModal?.posts?.find(p => p.id === postId);
          if (post) {
            (onPostClick || onPostEdit)?.(post);
          }
        }}
        onDelete={(postId) => {
          onPostDelete?.(postId);
        }}
        onCreate={onDateClick}
      />
    </>
  );
}
