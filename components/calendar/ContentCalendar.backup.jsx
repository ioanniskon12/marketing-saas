/**
 * Content Calendar Component
 *
 * Drag-and-drop calendar for managing scheduled posts.
 */

'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Plus, Instagram, Facebook, Linkedin, Twitter, Edit2, Youtube, Music, Calendar, Trash2 } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui';

const CalendarContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const MonthTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const NavButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}20`};
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const DatePickerInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  max-width: 150px;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: ${props => props.theme.shadows.neon};
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity ${props => props.theme.transitions.fast};
    filter: ${props => props.theme.colors.background.default === '#000000' ? 'invert(1)' : 'none'};

    &:hover {
      opacity: 1;
    }
  }
`;

const ViewModeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  padding: 4px;
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const ViewModeButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary.contrast : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.dark : `${props.theme.colors.primary.main}20`};
    color: ${props => props.$active ? props.theme.colors.primary.contrast : props.theme.colors.primary.main};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: ${props => props.$viewMode === 'month' ? 'auto' : '1fr'};
  height: ${props => props.$viewMode === 'month' ? 'auto' : '500px'};
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
`;

const DayCell = styled.div`
  height: ${props => props.$viewMode === 'month' ? 'auto' : '100%'};
  min-height: ${props => props.$viewMode === 'month' ? '120px' : 'auto'};
  padding: 0;
  background: ${props => {
    if (props.$isSelected) return props.theme.colors.background.elevated;
    if (props.$isOver) return props.theme.colors.background.elevated;
    return props.$isCurrentMonth ? props.theme.colors.background.paper : props.theme.colors.background.default;
  }};
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.5};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: ${props => props.$isSelected ? `2px solid ${props.theme.colors.primary.main}` : `1px solid ${props.theme.colors.border.default}`};
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.$isSelected ? props.theme.colors.primary.main : props.theme.colors.primary.main}40;
  }

  ${props => props.$isOver && `
    border: 3px dashed ${props.theme.colors.primary.main};
    box-shadow: ${props.theme.shadows.neon};
  `}
`;

const DayNumber = styled.div`
  font-size: ${props => props.$viewMode === 'month' ? props.theme.typography.fontSize.lg : props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  transition: all ${props => props.theme.transitions.fast};

  ${props => props.$isToday && `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: ${props.$viewMode === 'month' ? '28px' : '40px'};
    height: ${props.$viewMode === 'month' ? '28px' : '40px'};
    border-radius: ${props.theme.borderRadius.full};
    background: linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.primary.dark});
    padding: 0 8px;
    box-shadow: ${props.theme.shadows.lg};
  `}
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => {
    // If there are multiple posts (passed as $postCount), reduce gap in month view
    if (props.$viewMode === 'month' && props.$postCount > 1) return props.theme.spacing.xs;
    if (props.$viewMode === 'week') return props.theme.spacing.md;
    return props.theme.spacing.sm;
  }};
`;

const PostCard = styled.div`
  padding: ${props => {
    // Bigger padding for better visibility
    if (props.$viewMode === 'month' && props.$isMultiple) return `${props.theme.spacing.md} ${props.theme.spacing.lg}`;
    if (props.$viewMode === 'month') return `${props.theme.spacing.lg} ${props.theme.spacing.xl}`;
    return props.theme.spacing.lg;
  }};
  min-height: ${props => {
    // Minimum height for better visibility
    if (props.$viewMode === 'month' && props.$isMultiple) return '80px';
    if (props.$viewMode === 'month') return '120px';
    return '100px';
  }};
  background: ${props => {
    // Add subtle gradient background for visual distinction
    const baseColor = props.theme.colors.background.paper;
    if (props.$isMultiple) return `linear-gradient(135deg, ${baseColor}, ${props.theme.colors.neutral[50]})`;
    return baseColor;
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  font-size: ${props => {
    // Bigger font for readability
    if (props.$viewMode === 'month' && props.$isMultiple) return props.theme.typography.fontSize.sm;
    return props.theme.typography.fontSize.base;
  }};
  line-height: ${props => props.$isMultiple ? 1.4 : 1.5};
  transition: all ${props => props.theme.transitions.fast};
  border-left: ${props => {
    // Use left border for status indicator when multiple posts
    if (props.$isMultiple) {
      switch (props.$status) {
        case 'published': return `5px solid ${props.theme.colors.success.main}`;
        case 'scheduled': return `5px solid ${props.theme.colors.primary.main}`;
        case 'failed': return `5px solid ${props.theme.colors.error.main}`;
        default: return `5px solid ${props.theme.colors.neutral[300]}`;
      }
    }
    return 'none';
  }};
  border: ${props => {
    if (props.$isMultiple) return `2px solid ${props.theme.colors.border.default}`;
    switch (props.$status) {
      case 'published': return `3px solid ${props.theme.colors.success.main}`;
      case 'scheduled': return `3px solid ${props.theme.colors.primary.main}`;
      case 'failed': return `3px solid ${props.theme.colors.error.main}`;
      default: return `3px solid ${props.theme.colors.border.default}`;
    }
  }};
  position: relative;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  box-shadow: ${props => props.$isMultiple ? props.theme.shadows.sm : props.theme.shadows.md};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows['2xl']};
    z-index: 10;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:active {
    cursor: grabbing;
  }
`;

const PostContent = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.$isMultiple ? 1 : 2};
  -webkit-box-orient: vertical;
  margin-bottom: ${props => {
    // Reduce margin when multiple posts
    if (props.$isMultiple) return props.theme.spacing.xs;
    return props.theme.spacing.sm;
  }};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.default};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const PostTime = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const PostPlatforms = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  align-items: center;
`;

const PlatformIconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlatformIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    transform: scale(1.2);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const PlatformCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$color};
  min-width: 16px;
  text-align: center;
`;

const ActionButtonsContainer = styled.div`
  position: absolute;
  top: 50%;
  right: ${props => props.theme.spacing.md};
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

const CircularMenu = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  ${PostCard}:hover & {
    opacity: 1;
    transform: scale(1);
  }
`;

const MenuCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.primary.dark});
  box-shadow: ${props => props.theme.shadows.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: ${props => props.theme.shadows['2xl']};
  }
`;

const ActionButton = styled.button`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$color || props.theme.colors.background.paper};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.lg};
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);

  ${CircularMenu}:hover & {
    opacity: 1;
  }

  &:nth-child(2) {
    ${CircularMenu}:hover & {
      transform: translate(-50%, -50%) translate(-60px, -30px) scale(1);
    }
  }

  &:nth-child(3) {
    ${CircularMenu}:hover & {
      transform: translate(-50%, -50%) translate(-60px, 30px) scale(1);
    }
  }

  &:nth-child(4) {
    ${CircularMenu}:hover & {
      transform: translate(-50%, -50%) translate(0px, -70px) scale(1);
    }
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.15) !important;
    box-shadow: ${props => props.theme.shadows.xl};
    filter: brightness(1.1);
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.95) !important;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const DayCellHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$isSelected
    ? `linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.primary.dark})`
    : props.theme.colors.background.elevated};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const DayNameNumber = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$isSelected ? props.theme.colors.primary.contrast : props.theme.colors.text.primary};
`;

const DayName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-transform: uppercase;
  color: ${props => props.$isSelected ? props.theme.colors.primary.contrast : props.theme.colors.text.secondary};
`;

const PostCount = styled.div`
  background: ${props => props.$isSelected ? 'rgba(255,255,255,0.2)' : `linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.primary.dark})`};
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  min-width: ${props => props.$viewMode === 'week' ? '28px' : '20px'};
  height: ${props => props.$viewMode === 'week' ? '28px' : '20px'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${props => props.theme.spacing.xs};
  font-size: ${props => props.$viewMode === 'week' ? props.theme.typography.fontSize.sm : props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  box-shadow: ${props => props.$viewMode === 'week' ? props.theme.shadows.md : props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }
`;

const DayCellContent = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.sm};
  overflow-y: auto;
  position: relative;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.full};

    &:hover {
      background: ${props => props.theme.colors.primary.main};
    }
  }
`;

const AddPostButton = styled.button`
  position: absolute;
  bottom: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.primary.dark});
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 10;

  ${DayCell}:hover & {
    opacity: 1;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const DragOverlayContent = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  min-width: 150px;
  cursor: grabbing;
`;

const HoverPreview = styled.div`
  position: fixed;
  z-index: 1000;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows['2xl']};
  padding: ${props => props.theme.spacing.lg};
  max-width: 400px;
  min-width: 300px;
  pointer-events: none;
  border: 2px solid ${props => props.theme.colors.primary.main};

  ${props => props.$position && `
    left: ${props.$position.x}px;
    top: ${props.$position.y}px;
  `}
`;

const PreviewContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.6;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const PreviewMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.default};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const PreviewAccount = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$color || props.theme.colors.text.primary};
`;

const PreviewStatus = styled.span`
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
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

const PlatformsSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const PlatformsTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PlatformsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const PlatformItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}15`};
    transform: translateX(4px);
  }
`;

const PlatformName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  text-transform: capitalize;
  flex: 1;
`;

const PlatformBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${props => props.$color}15;
  border: 1px solid ${props => props.$color}40;
  border-radius: ${props => props.theme.borderRadius.full};
  color: ${props => props.$color};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const PlatformIconLarge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 13px;
    height: 13px;
  }
`;

// Day View Styled Components
const DayViewContainer = styled.div`
  display: flex;
  height: calc(100vh - 250px);
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const TimeColumn = styled.div`
  width: 80px;
  border-right: 2px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.elevated};
  overflow-y: auto;
`;

const TimeSlot = styled.div`
  height: 60px;
  padding: ${props => props.theme.spacing.xs};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
`;

const DayColumn = styled.div`
  flex: 1;
  position: relative;
  overflow-y: auto;
`;

const DayGrid = styled.div`
  position: relative;
  min-height: 100%;
`;

const GridRow = styled.div`
  height: 60px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  position: relative;

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}08`};
  }
`;

const DayPostCard = styled.div`
  position: absolute;
  left: 4px;
  right: 4px;
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main},
    ${props => props.theme.colors.primary.light}
  );
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.sm};
  box-shadow: ${props => props.theme.shadows.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  overflow: hidden;
  z-index: 1;

  &:hover {
    transform: translateX(4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const DayPostTime = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DayPostContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: '#E4405F' },
  facebook: { icon: Facebook, color: '#1877F2' },
  linkedin: { icon: Linkedin, color: '#0A66C2' },
  twitter: { icon: Twitter, color: '#1DA1F2' },
  x: { icon: Twitter, color: '#000000' },
  youtube: { icon: Youtube, color: '#FF0000' },
  tiktok: { icon: Music, color: '#000000' },
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Account color generator - creates consistent colors for each account
const ACCOUNT_COLORS = [
  '#DBEAFE', // Light blue
  '#FCE7F3', // Light pink
  '#E0E7FF', // Light indigo
  '#FEF3C7', // Light yellow
  '#D1FAE5', // Light green
  '#FBCFE8', // Light rose
  '#DDD6FE', // Light purple
  '#FED7AA', // Light orange
  '#CCFBF1', // Light teal
  '#E9D5FF', // Light violet
];

const getAccountColor = (accountId) => {
  if (!accountId) return ACCOUNT_COLORS[0];
  // Create a hash from the accountId
  const hash = accountId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % ACCOUNT_COLORS.length;
  return ACCOUNT_COLORS[index];
};

// Draggable Post Component
function DraggablePost({ post, platforms, postTime, onClick, onEdit, onReschedule, onDelete, accountColor, isMultiple, viewMode, platformCounts = {} }) {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: post.id,
    data: { post }
  });

  return (
    <PostCard
      ref={setNodeRef}
      $status={post.status}
      $accountColor={accountColor}
      $isDragging={isDragging}
      $isMultiple={isMultiple}
      $viewMode={viewMode}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(post);
      }}
      {...listeners}
      {...attributes}
    >
      <ActionButtonsContainer>
        <CircularMenu>
          <MenuCenter>•••</MenuCenter>

          <ActionButton
            $color="linear-gradient(135deg, #3B82F6, #2563EB)"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(post);
            }}
            title="Edit post"
          >
            <Edit2 />
          </ActionButton>

          <ActionButton
            $color="linear-gradient(135deg, #F59E0B, #D97706)"
            onClick={(e) => {
              e.stopPropagation();
              onReschedule?.(post);
            }}
            title="Reschedule post"
          >
            <Calendar />
          </ActionButton>

          <ActionButton
            $color="linear-gradient(135deg, #EF4444, #DC2626)"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(post);
            }}
            title="Delete post"
          >
            <Trash2 />
          </ActionButton>
        </CircularMenu>
      </ActionButtonsContainer>

      <PostContent $isMultiple={isMultiple}>
        {post.content || 'No content'}
      </PostContent>

      <PostMeta>
        <PostTime>{postTime}</PostTime>
        <PostPlatforms>
          {platforms.map((platform, idx) => {
            const config = PLATFORM_CONFIG[platform.toLowerCase()];
            if (!config) return null;

            const Icon = config.icon;
            const count = platformCounts[platform.toLowerCase()] || 0;
            return (
              <PlatformIconWrapper key={idx}>
                <PlatformIcon
                  $color={config.color}
                  title={platform}
                >
                  <Icon />
                </PlatformIcon>
                {count > 0 && (
                  <PlatformCount $color={config.color}>{count}</PlatformCount>
                )}
              </PlatformIconWrapper>
            );
          })}
        </PostPlatforms>
      </PostMeta>
    </PostCard>
  );
}

// Droppable Day Cell Component
function DroppableDay({ date, children, isCurrentMonth, viewMode, onClick, isSelected }) {
  const {isOver, setNodeRef} = useDroppable({
    id: date.toISOString(),
  });

  return (
    <DayCell
      ref={setNodeRef}
      $isCurrentMonth={isCurrentMonth}
      $isOver={isOver}
      $viewMode={viewMode}
      $isSelected={isSelected}
      data-date={date.toISOString()}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </DayCell>
  );
}

export default function ContentCalendar({ posts = [], onPostClick, onPostEdit, onPostReschedule, onPostDelete, onDateClick, onPostMove, viewMode = 'month', onViewModeChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activePost, setActivePost] = useState(null);
  const [hoverPost, setHoverPost] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);

  // Initialize with 7 consecutive dates starting from today
  const [selectedDates, setSelectedDates] = useState(() => {
    const today = new Date();
    const initialDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      initialDates.push(date.toDateString());
    }
    return initialDates;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle date click - select 7 consecutive dates
  const handleDateClick = (clickedDate) => {
    const newSelectedDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(clickedDate);
      date.setDate(clickedDate.getDate() + i);
      newSelectedDates.push(date.toDateString());
    }
    setSelectedDates(newSelectedDates);

    // Also call the parent onDateClick if provided
    if (onDateClick) {
      onDateClick(clickedDate);
    }
  };

  // Check if a date is selected
  const isDateSelected = (date) => {
    return selectedDates.includes(date.toDateString());
  };

  // Get calendar data - show 7 days or full month based on viewMode
  const calendarData = useMemo(() => {
    console.log('calendarData recalculating, currentDate:', currentDate, 'viewMode:', viewMode);
    const days = [];

    if (viewMode === 'month') {
      // Show full month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Start from Sunday of the week containing the 1st
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - firstDay.getDay());

      // End on Saturday of the week containing the last day
      const endDate = new Date(lastDay);
      endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

      // Generate all days
      const currentDay = new Date(startDate);
      while (currentDay <= endDate) {
        days.push({
          date: new Date(currentDay),
          isCurrentMonth: currentDay.getMonth() === month,
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
    } else {
      // Show 7-day week view
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        days.push({
          date: dayDate,
          isCurrentMonth: true,
        });
      }
    }

    return days;
  }, [currentDate, viewMode]);

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

  const handlePrevious = () => {
    console.log('Previous clicked, current date:', currentDate);

    if (viewMode === 'month') {
      // Go to previous month
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      console.log('New month date:', newDate);
      setCurrentDate(newDate);
    } else if (viewMode === 'day') {
      // Go to previous day
      const newDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
      console.log('New day date:', newDate);
      setCurrentDate(newDate);
    } else {
      // Shift back by 7 days (week view)
      const newDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      console.log('New week date:', newDate);
      setCurrentDate(newDate);

      // Update selectedDates for the selection indicator
      const newSelectedDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(newDate.getTime() + (i * 24 * 60 * 60 * 1000));
        newSelectedDates.push(date.toDateString());
      }
      setSelectedDates(newSelectedDates);
    }

    setCalendarKey(prev => prev + 1);
  };

  const handleNext = () => {
    console.log('Next clicked, current date:', currentDate);

    if (viewMode === 'month') {
      // Go to next month
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      console.log('New month date:', newDate);
      setCurrentDate(newDate);
    } else if (viewMode === 'day') {
      // Go to next day
      const newDate = new Date(currentDate.getTime() + (24 * 60 * 60 * 1000));
      console.log('New day date:', newDate);
      setCurrentDate(newDate);
    } else {
      // Shift forward by 7 days (week view)
      const newDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      console.log('New week date:', newDate);
      setCurrentDate(newDate);

      // Update selectedDates for the selection indicator
      const newSelectedDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(newDate.getTime() + (i * 24 * 60 * 60 * 1000));
        newSelectedDates.push(date.toDateString());
      }
      setSelectedDates(newSelectedDates);
    }

    setCalendarKey(prev => prev + 1);
  };

  const handleToday = () => {
    // Reset to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);

    // Update selectedDates for the selection indicator
    const newSelectedDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      newSelectedDates.push(date.toDateString());
    }
    setSelectedDates(newSelectedDates);
    setCalendarKey(prev => prev + 1);
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate.getTime())) {
      setCurrentDate(selectedDate);
    }
  };

  const handleDragStart = (event) => {
    const post = posts.find(p => p.id === event.active.id);
    setActivePost(post);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const post = posts.find(p => p.id === active.id);
      const targetDate = new Date(over.id);

      if (post && onPostMove) {
        onPostMove(post, targetDate);
      }
    }

    setActivePost(null);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPlatformsForPost = (post) => {
    // Get platforms from post data
    if (post.platforms && Array.isArray(post.platforms)) {
      return post.platforms;
    }
    // Fallback: Try to get from social_accounts if available
    if (post.social_accounts && Array.isArray(post.social_accounts)) {
      return post.social_accounts.map(account => account.platform);
    }
    return [];
  };

  const formatPostTime = (scheduledFor) => {
    if (!scheduledFor) return '';
    const date = new Date(scheduledFor);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateRange = () => {
    if (viewMode === 'month') {
      // Show month and year for month view
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'day') {
      // Show full date for day view
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      // Calculate the actual range being displayed for week view
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CalendarContainer>
        <CalendarHeader>
          <NavButtons>
            <NavButton onClick={handlePrevious}>
              <ChevronLeft size={20} />
            </NavButton>
            <MonthTitle>{formatDateRange()}</MonthTitle>
            {viewMode === 'day' && (
              <DatePickerInput
                type="date"
                value={currentDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                title="Select a date"
              />
            )}
            <NavButton onClick={handleNext}>
              <ChevronRight size={20} />
            </NavButton>
          </NavButtons>
          <HeaderActions>
            <ViewModeSelector>
              <ViewModeButton
                $active={viewMode === 'day'}
                onClick={() => onViewModeChange?.('day')}
              >
                1 Day
              </ViewModeButton>
              <ViewModeButton
                $active={viewMode === 'week'}
                onClick={() => onViewModeChange?.('week')}
              >
                7 Days
              </ViewModeButton>
              <ViewModeButton
                $active={viewMode === 'month'}
                onClick={() => onViewModeChange?.('month')}
              >
                Month
              </ViewModeButton>
            </ViewModeSelector>
            <Button variant="outline" size="sm" onClick={handleToday}>
              TODAY
            </Button>
          </HeaderActions>
        </CalendarHeader>

        {/* Day View with Time Slots */}
        {viewMode === 'day' ? (
          <DayViewContainer key={calendarKey}>
            {/* Time Column */}
            <TimeColumn>
              {Array.from({ length: 48 }, (_, i) => {
                const hour = Math.floor(i / 2);
                const minute = i % 2 === 0 ? '00' : '30';
                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                return (
                  <TimeSlot key={i}>
                    {time}
                  </TimeSlot>
                );
              })}
            </TimeColumn>

            {/* Day Column with Posts */}
            <DayColumn>
              <DayGrid>
                {/* Grid rows for each 30-min slot */}
                {Array.from({ length: 48 }, (_, i) => (
                  <GridRow key={i} />
                ))}

                {/* Posts positioned by time */}
                {(() => {
                  const dateKey = currentDate.toDateString();
                  const dayPosts = postsByDate[dateKey] || [];

                  return dayPosts.map(post => {
                    const scheduledDate = new Date(post.scheduled_for);
                    const hour = scheduledDate.getHours();
                    const minute = scheduledDate.getMinutes();

                    // Calculate position (each slot is 60px, represents 30 minutes)
                    const slotIndex = (hour * 2) + (minute >= 30 ? 1 : 0);
                    const topPosition = slotIndex * 60;

                    // Calculate height (minimum 1 slot = 60px)
                    const height = 56; // Slightly less than slot height for visual separation

                    const platforms = getPlatformsForPost(post);
                    const postTime = formatPostTime(post.scheduled_for);

                    return (
                      <DayPostCard
                        key={post.id}
                        style={{
                          top: `${topPosition}px`,
                          height: `${height}px`,
                        }}
                        onClick={() => onPostEdit?.(post)}
                      >
                        <DayPostTime>{postTime}</DayPostTime>
                        <DayPostContent>{post.content}</DayPostContent>
                        <PostPlatforms style={{ marginTop: '8px' }}>
                          {platforms.map((platform, idx) => {
                            const config = PLATFORM_CONFIG[platform.toLowerCase()];
                            if (!config) return null;
                            const Icon = config.icon;
                            return (
                              <PlatformIcon
                                key={idx}
                                $color={config.color}
                                title={platform}
                              >
                                <Icon />
                              </PlatformIcon>
                            );
                          })}
                        </PostPlatforms>
                      </DayPostCard>
                    );
                  });
                })()}
              </DayGrid>
            </DayColumn>
          </DayViewContainer>
        ) : (
          <CalendarGrid $viewMode={viewMode} key={calendarKey}>
            {/* Calendar days */}
            {calendarData.map((day, index) => {
            const dateKey = day.date.toDateString();
            const dayPosts = postsByDate[dateKey] || [];
            const isTodayDate = isToday(day.date);
            const dayOfWeek = DAYS_OF_WEEK[day.date.getDay()];
            const isSelected = isDateSelected(day.date);

            return (
              <DroppableDay
                key={dateKey}
                date={day.date}
                isCurrentMonth={day.isCurrentMonth}
                viewMode={viewMode}
                onClick={() => handleDateClick(day.date)}
                isSelected={isSelected}
              >
                <DayCellHeader $isSelected={isSelected}>
                  <DayNameNumber $isSelected={isSelected}>
                    <DayName $isSelected={isSelected}>{dayOfWeek}</DayName>
                    <DayNumber $isToday={isTodayDate} $isCurrentMonth={day.isCurrentMonth} $viewMode={viewMode}>
                      {day.date.getDate()}
                    </DayNumber>
                  </DayNameNumber>
                  {dayPosts.length > 0 && day.isCurrentMonth && (
                    <PostCount $viewMode={viewMode} $isSelected={isSelected}>{dayPosts.length}</PostCount>
                  )}
                </DayCellHeader>

                <DayCellContent>
                  <PostsList $viewMode={viewMode} $postCount={dayPosts.length}>
                  {(() => {
                    // Calculate platform counts for this day
                    const platformCounts = {};
                    dayPosts.forEach(post => {
                      const postPlatforms = getPlatformsForPost(post);
                      postPlatforms.forEach(platform => {
                        const key = platform.toLowerCase();
                        platformCounts[key] = (platformCounts[key] || 0) + 1;
                      });
                    });

                    return dayPosts.map(post => {
                      const platforms = getPlatformsForPost(post);
                      const postTime = formatPostTime(post.scheduled_for);
                      const accountId = post.account_id || post.workspace_id || post.id;
                      const accountColor = getAccountColor(accountId);
                      const isMultiple = dayPosts.length > 1;

                      return (
                      <div
                        key={post.id}
                        onMouseEnter={(e) => {
                          setHoverPost(post);
                          const rect = e.currentTarget.getBoundingClientRect();
                          const windowWidth = window.innerWidth;
                          const windowHeight = window.innerHeight;
                          const previewWidth = 400; // Max width of preview
                          const previewHeight = 200; // Estimated height of preview
                          const gap = 5; // Gap between post and preview

                          // Check if preview would go off-screen on the right
                          const wouldOverflowRight = rect.right + previewWidth + gap > windowWidth;

                          // Check if preview would go off-screen at the bottom
                          let yPosition = rect.top;
                          if (rect.top + previewHeight > windowHeight) {
                            // Position it above or align to bottom
                            yPosition = Math.max(10, windowHeight - previewHeight - 10);
                          }

                          setHoverPosition({
                            x: wouldOverflowRight ? rect.left - previewWidth - gap : rect.right + gap,
                            y: yPosition,
                            isLeft: wouldOverflowRight
                          });
                        }}
                        onMouseLeave={() => {
                          setHoverPost(null);
                          setHoverPosition(null);
                        }}
                      >
                        <DraggablePost
                          post={post}
                          platforms={platforms}
                          postTime={postTime}
                          onClick={onPostClick}
                          onEdit={onPostEdit}
                          onReschedule={onPostReschedule}
                          onDelete={onPostDelete}
                          accountColor={accountColor}
                          isMultiple={isMultiple}
                          viewMode={viewMode}
                          platformCounts={platformCounts}
                        />
                      </div>
                    );
                    });
                  })()}
                </PostsList>

                  {day.isCurrentMonth && (
                    <AddPostButton
                      onClick={() => onDateClick?.(day.date)}
                      title="Add post"
                    >
                      <Plus size={18} />
                    </AddPostButton>
                  )}
                </DayCellContent>
              </DroppableDay>
            );
          })}
          </CalendarGrid>
        )}
      </CalendarContainer>

      <DragOverlay>
        {activePost && (
          <DragOverlayContent>
            {activePost.content.substring(0, 50)}
            {activePost.content.length > 50 && '...'}
          </DragOverlayContent>
        )}
      </DragOverlay>

      {/* Hover Preview */}
      {hoverPost && hoverPosition && (
        <HoverPreview $position={hoverPosition}>
          <PreviewContent>{hoverPost.content}</PreviewContent>
          <PreviewMeta>
            <div>
              <PreviewAccount $color={getAccountColor(hoverPost.account_id || hoverPost.id)}>
                {hoverPost.account_name || 'Account'}
              </PreviewAccount>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                {formatPostTime(hoverPost.scheduled_for)}
              </div>
            </div>
            <PreviewStatus $status={hoverPost.status}>
              {hoverPost.status}
            </PreviewStatus>
          </PreviewMeta>

          {/* Platform List */}
          {getPlatformsForPost(hoverPost).length > 0 && (
            <PlatformsSection>
              <PlatformsTitle>Publishing To</PlatformsTitle>
              <PlatformsList>
                {getPlatformsForPost(hoverPost).map((platform, idx) => {
                  const config = PLATFORM_CONFIG[platform.toLowerCase()];
                  if (!config) return null;

                  const Icon = config.icon;
                  return (
                    <PlatformItem key={idx}>
                      <PlatformIconLarge $color={config.color}>
                        <Icon />
                      </PlatformIconLarge>
                      <PlatformName>{platform}</PlatformName>
                      <PlatformBadge $color={config.color}>
                        Scheduled
                      </PlatformBadge>
                    </PlatformItem>
                  );
                })}
              </PlatformsList>
            </PlatformsSection>
          )}
        </HoverPreview>
      )}
    </DndContext>
  );
}
