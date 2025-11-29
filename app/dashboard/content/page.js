'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { useTheme } from 'styled-components';
import { Plus, Search, Instagram, Facebook, Linkedin, Twitter, Edit, Trash2, Calendar, Hash, Download, Upload, FileSpreadsheet, GripVertical, X, Heart, MessageCircle, Repeat2, Share2, Bookmark, MoreHorizontal, ThumbsUp, Send, Youtube, Music, Play } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import PostComposer from '@/components/posts/PostComposer';
import ExcelImport from '@/components/posts/ExcelImport';
import { Modal } from '@/components/ui';
import { PageSpinner } from '@/components/ui';
import { exportPostsPlannerFormat, downloadImportTemplate } from '@/lib/utils/excelExport';
import { PLATFORM_TABS_NO_ALL, getPlatformConfig } from '@/lib/config/platforms';
import AccountSelector from '@/components/common/AccountSelector';

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
`;

// Two-column layout
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: ${props => props.theme.spacing.lg};
  min-height: calc(100vh - 200px);

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: ${props => props.theme.spacing.sm};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.neutral[100]};
    border-radius: ${props => props.theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.sm};

    &:hover {
      background: ${props => props.theme.colors.neutral[400]};
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    max-height: none;
    overflow-y: visible;
  }
`;

const RightColumn = styled.div`
  position: sticky;
  top: 20px;
  align-self: start;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    position: relative;
    top: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.$variant === 'primary' ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  color: ${props => props.$variant === 'primary' ? 'white' : props.theme.colors.text.primary};
  border: ${props => props.$variant === 'primary' ? 'none' : `2px solid ${props.theme.colors.neutral[200]}`};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    ${props => props.$variant === 'primary' ? `
      background: ${props.theme.colors.primary.dark};
    ` : `
      border-color: ${props.theme.colors.primary.main};
      color: ${props.theme.colors.primary.main};
    `}
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-left: ${props => props.theme.spacing['2xl']};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.neutral[400]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.neutral[400]};
`;

// View Tabs (Feed vs Stories)
const ViewTabsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ViewTab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.primary};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const RightPanelHeader = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 2px solid ${props => props.theme.colors.neutral[200]};
  padding-bottom: ${props => props.theme.spacing.sm};
`;

const RightPanelTab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.bold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: -2px;

  &:hover {
    color: ${props => props.theme.colors.primary.main};
  }
`;

// iPhone Mockup
const PhoneMockup = styled.div`
  width: 375px;
  max-width: 100%;
  margin: 0 auto;
  background: #000;
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 30px;
    background: #000;
    border-radius: 0 0 20px 20px;
    z-index: 10;
  }
`;

const PhoneScreen = styled.div`
  width: 100%;
  height: 750px;
  background: ${props => props.$bgColor || '#fff'};
  border-radius: 30px;
  overflow: hidden;
  position: relative;
`;

const PhoneHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$bgColor || '#fff'};
  border-bottom: 1px solid ${props => props.$borderColor || '#e0e0e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-top: 40px;
`;

const PhoneTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$color || '#000'};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const PhoneContent = styled.div`
  height: calc(100% - 60px);
  overflow-y: auto;
  background: ${props => props.$bgColor || '#fff'};

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.full};
  }
`;

// Instagram Profile Header
const InstagramProfileHeader = styled.div`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  background: #fff;
  border-bottom: 1px solid #dbdbdb;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProfilePicture = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E4405F, #C13584, #833AB4, #5851DB);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
`;

const ProfileStats = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #262626;
  margin-bottom: 4px;
`;

const ProfileBio = styled.div`
  font-size: 14px;
  color: #262626;
  line-height: 1.4;
`;

const ProfileStatsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.sm};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;

  strong {
    font-weight: 600;
    color: #262626;
  }

  span {
    color: #8e8e8e;
    font-size: 12px;
  }
`;

// Instagram Highlights
const HighlightsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: #fff;
  border-bottom: 1px solid #dbdbdb;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

const HighlightItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const HighlightCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HighlightInner = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const HighlightLabel = styled.div`
  font-size: 12px;
  color: #262626;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Instagram Grid
const InstagramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: #fff;
`;

const GridItem = styled.div`
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  transform: ${props => props.$isDragging ? 'scale(1.05)' : 'scale(1)'};
  transition: transform 200ms;

  &:hover > div.drag-handle {
    opacity: 1;
  }

  ${props => props.$isDragOver && `
    border: 2px dashed #E4405F;
  `}
`;

const GridImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const DragHandle = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 200ms;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: grab;
  z-index: 10;
  pointer-events: none;

  &:active {
    cursor: grabbing;
  }
`;

// Twitter Feed
const TweetList = styled.div`
  background: #fff;
`;

const Tweet = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid #eff3f4;
  cursor: pointer;
  transition: background 200ms;

  &:hover {
    background: #f7f9f9;
  }
`;

const TweetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TweetAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1DA1F2, #0d8bd9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const TweetAuthor = styled.div`
  flex: 1;
`;

const TweetName = styled.div`
  font-weight: bold;
  font-size: 15px;
  color: #0f1419;
`;

const TweetHandle = styled.div`
  font-size: 13px;
  color: #536471;
`;

const TweetContent = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #0f1419;
  margin-bottom: ${props => props.theme.spacing.sm};
  padding-left: 48px;
`;

const TweetImage = styled.img`
  width: 100%;
  border-radius: 16px;
  margin-bottom: ${props => props.theme.spacing.sm};
  margin-left: 48px;
  max-width: calc(100% - 48px);
`;

const TweetActions = styled.div`
  display: flex;
  justify-content: space-around;
  padding-left: 48px;
  margin-top: ${props => props.theme.spacing.sm};
`;

const TweetAction = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #536471;
  font-size: 13px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Facebook Feed
const FacebookPost = styled.div`
  background: white;
  margin-bottom: ${props => props.theme.spacing.md};
  border-radius: 8px;
`;

const FacebookHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FacebookAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1877F2, #0d65d9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const FacebookAuthor = styled.div`
  flex: 1;
`;

const FacebookName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #050505;
`;

const FacebookTime = styled.div`
  font-size: 13px;
  color: #65676b;
`;

const FacebookContent = styled.div`
  padding: 0 ${props => props.theme.spacing.md};
  font-size: 15px;
  line-height: 1.5;
  color: #050505;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const FacebookImage = styled.img`
  width: 100%;
  display: block;
`;

const FacebookActions = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #e4e6eb;
`;

const FacebookAction = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #65676b;
  font-size: 15px;
  font-weight: 600;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: 4px;
  cursor: pointer;
  transition: background 200ms;

  &:hover {
    background: #f2f2f2;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// LinkedIn Feed
const LinkedInPost = styled.div`
  background: white;
  margin-bottom: ${props => props.theme.spacing.md};
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const LinkedInHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const LinkedInAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0A66C2, #004182);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const LinkedInAuthor = styled.div`
  flex: 1;
`;

const LinkedInName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
`;

const LinkedInTitle = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
`;

const LinkedInContent = styled.div`
  padding: 0 ${props => props.theme.spacing.md};
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const LinkedInImage = styled.img`
  width: 100%;
  display: block;
`;

const LinkedInActions = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  border-top: 1px solid #e0e0e0;
`;

const LinkedInAction = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 600;
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  transition: background 200ms;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 4px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Stories View
const StoriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const StoryCard = styled.div`
  position: relative;
  aspect-ratio: 9/16;
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.lg};
  transition: transform ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoryOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.5) 100%);
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StoryAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
`;

const StoryAuthor = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const StoryActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const StoryActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['4xl']};
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
`;

const EmptyIcon = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.neutral[400]};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

// Post Preview View
const PostPreviewContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${props => props.theme.spacing.xl};
  min-height: 600px;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  max-height: 800px;
  overflow-y: auto;
  padding-right: ${props => props.theme.spacing.sm};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.neutral[100]};
    border-radius: ${props => props.theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.sm};

    &:hover {
      background: ${props => props.theme.colors.neutral[400]};
    }
  }
`;

const PostListItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.theme.colors.primary.main + '15' : props.theme.colors.background.paper};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    transform: translateX(4px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const PostListItemContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PostListItemMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
`;

const PostPreviewPane = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Posts List View
const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
`;

const PostCardItem = styled.div`
  position: relative;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      ${props => props.theme.colors.primary.main} 0%,
      ${props => props.theme.colors.secondary.main} 100%);
    opacity: 0;
    transition: opacity ${props => props.theme.transitions.fast};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    border-color: ${props => props.theme.colors.primary.main};

    &::before {
      opacity: 1;
    }
  }
`;

const PostCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
  padding-bottom: ${props => props.theme.spacing.sm};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
  position: relative;
`;

const PostPlatforms = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const PlatformBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px ${props => `${props.$color}40`};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 10px ${props => `${props.$color}60`};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PostActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.$variant === 'danger' ?
    props.theme.colors.error.main :
    props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.theme.shadows.md};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.sm};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PostContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.6;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-weight: ${props => props.theme.typography.fontWeight.normal};

  /* Multi-line ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostMedia = styled.div`
  width: 100%;
  height: 180px;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.neutral[100]}, ${props => props.theme.colors.neutral[50]});
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${props => props.theme.borderRadius.lg};
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const PostMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const PostMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  text-transform: capitalize;
  letter-spacing: 0.5px;
  background: ${props => {
    switch(props.$status) {
      case 'published':
        return `linear-gradient(135deg, ${props.theme.colors.success.main}, ${props.theme.colors.success.dark})`;
      case 'scheduled':
        return `linear-gradient(135deg, ${props.theme.colors.primary.main}, ${props.theme.colors.primary.dark})`;
      case 'draft':
        return `linear-gradient(135deg, ${props.theme.colors.neutral[400]}, ${props.theme.colors.neutral[500]})`;
      case 'failed':
        return `linear-gradient(135deg, ${props.theme.colors.error.main}, ${props.theme.colors.error.dark})`;
      default:
        return `linear-gradient(135deg, ${props.theme.colors.neutral[400]}, ${props.theme.colors.neutral[500]})`;
    }
  }};
  color: white;
  box-shadow: ${props => {
    switch(props.$status) {
      case 'published':
        return `0 2px 8px ${props.theme.colors.success.main}40`;
      case 'scheduled':
        return `0 2px 8px ${props.theme.colors.primary.main}40`;
      case 'failed':
        return `0 2px 8px ${props.theme.colors.error.main}40`;
      default:
        return `0 2px 8px rgba(0, 0, 0, 0.1)`;
    }
  }};
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const FeedItem = styled.div`
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};
  cursor: pointer;
  transition: transform ${props => props.theme.transitions.fast};

  &:hover {
    transform: scale(0.98);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover > div {
    opacity: 1;
  }
`;

const FeedOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.fast};
`;

const FeedStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  color: white;
`;

const FeedStat = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

export default function PostsPage() {
  const { currentWorkspace } = useWorkspace();
  const router = useRouter();
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('instagram');
  const [viewMode, setViewMode] = useState('posts'); // 'posts', 'preview', 'feed', 'stories', or 'instagram'
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedPostPreview, setSelectedPostPreview] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState('feed'); // 'feed' or 'stories' for Instagram view
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'scheduled', 'draft', 'published'

  useEffect(() => {
    if (currentWorkspace) {
      loadPosts();
      loadAccounts();
    }
  }, [currentWorkspace]);

  // Disabled auto-reload on tab switch to prevent disrupting user workflow
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden && currentWorkspace && !isComposerOpen) {
  //       loadAccounts();
  //       loadPosts();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   const handleFocus = () => {
  //     if (currentWorkspace && !isComposerOpen) {
  //       loadAccounts();
  //       loadPosts();
  //     }
  //   };

  //   window.addEventListener('focus', handleFocus);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     window.removeEventListener('focus', handleFocus);
  //   };
  // }, [currentWorkspace, isComposerOpen]);

  const loadPosts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        workspace_id: currentWorkspace.id,
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load posts');
      }

      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await fetch(`/api/social-accounts?workspace_id=${currentWorkspace.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load accounts');
      }

      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      // Don't show error toast for accounts as it's not critical
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Get all posts with media (same as what's displayed in the feed)
    const postsWithMedia = posts.filter(post =>
      post.post_media && post.post_media.length > 0
    );

    const newPosts = [...postsWithMedia];
    const [draggedPost] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(dropIndex, 0, draggedPost);

    const updatedPosts = newPosts.map((post, index) => ({
      ...post,
      feed_position: index,
    }));

    const allPosts = posts.map(post => {
      const updatedPost = updatedPosts.find(p => p.id === post.id);
      return updatedPost || post;
    });
    setPosts(allPosts);
    setDraggedIndex(null);
    setDragOverIndex(null);

    await saveFeedOrder(updatedPosts, platformFilter);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const saveFeedOrder = async (updatedPosts, platform) => {
    try {
      const accountId = `demo-${platform}`;

      const response = await fetch('/api/posts/feed-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: currentWorkspace.id,
          platform: platform,
          account_id: accountId,
          posts: updatedPosts.map((post, index) => ({
            id: post.id,
            feed_position: index,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save feed order');
      }

      showToast.success('Feed order saved!');
    } catch (error) {
      console.error('Error saving feed order:', error);
      showToast.error('Failed to save feed order');
    }
  };

  const handleCreatePost = () => {
    // Navigate to unified create post page
    router.push('/dashboard/create-post');
  };

  const handleComposerClose = () => {
    setIsComposerOpen(false);
    setSelectedPost(null);
  };

  const handlePostSave = async () => {
    setIsComposerOpen(false);
    setSelectedPost(null);
    await loadPosts();
  };

  const handleExcelImport = async (parsedPosts) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const parsedPost of parsedPosts) {
        try {
          const postData = {
            workspace_id: currentWorkspace.id,
            content: parsedPost.content,
            hashtags: parsedPost.hashtags,
            platforms: [],
            status: 'draft',
          };

          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error importing post:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast.success(`Successfully imported ${successCount} post${successCount > 1 ? 's' : ''}!`);
        loadPosts();
      }

      if (errorCount > 0) {
        showToast.error(`Failed to import ${errorCount} post${errorCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast.error('Failed to import posts');
    }
  };

  const handleExcelExport = () => {
    if (filteredPosts.length === 0) {
      showToast.error('No posts to export');
      return;
    }

    try {
      exportPostsPlannerFormat(filteredPosts, `social-media-posts-${new Date().toISOString().split('T')[0]}`);
      showToast.success(`Exported ${filteredPosts.length} post${filteredPosts.length > 1 ? 's' : ''} to Excel!`);
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Failed to export posts');
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadImportTemplate();
      showToast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Template download error:', error);
      showToast.error('Failed to download template');
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsComposerOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post');
      }

      showToast.success('Post deleted successfully!');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast.error(error.message || 'Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        post.content?.toLowerCase().includes(query) ||
        post.hashtags?.some(tag => tag.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }

    // Platform filter
    const postPlatforms = post.platforms || [];
    if (!postPlatforms.some(p => p.includes(platformFilter))) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (post.status !== statusFilter) {
        return false;
      }
    }

    return true;
  });

  const renderPostPreview = () => {
    if (filteredPosts.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>
            <Plus size={64} />
          </EmptyIcon>
          <EmptyTitle>No posts yet</EmptyTitle>
          <EmptyDescription>
            Create your first post to see the preview
          </EmptyDescription>
          <Button $variant="primary" onClick={handleCreatePost}>
            <Plus size={20} />
            Create Post
          </Button>
        </EmptyState>
      );
    }

    // Auto-select first post if none selected
    const postToPreview = selectedPostPreview || filteredPosts[0];

    const renderSinglePost = (post) => {
      const postPlatforms = post.platforms || [];

      // Use the first platform in the post's platforms array, or the current filter
      const previewPlatform = postPlatforms.includes(platformFilter)
        ? platformFilter
        : (postPlatforms[0] || platformFilter);

      switch (previewPlatform) {
        case 'instagram':
          return (
            <PhoneMockup>
              <PhoneScreen>
                <PhoneHeader>
                  <PhoneTitle>
                    <Instagram size={24} />
                    Instagram
                  </PhoneTitle>
                </PhoneHeader>
                <PhoneContent>
                  <Tweet style={{ borderBottom: 'none' }}>
                    <TweetHeader>
                      <TweetAvatar style={{ background: 'linear-gradient(135deg, #E4405F, #C13584)' }}>
                        {currentWorkspace.name?.charAt(0).toUpperCase()}
                      </TweetAvatar>
                      <TweetAuthor>
                        <TweetName>{currentWorkspace.name}</TweetName>
                        <TweetHandle>@{currentWorkspace.name?.toLowerCase().replace(/\s+/g, '')}</TweetHandle>
                      </TweetAuthor>
                    </TweetHeader>
                    {post.post_media?.[0] && (
                      <TweetImage src={post.post_media[0].file_url} alt="" style={{ marginLeft: 0, maxWidth: '100%' }} />
                    )}
                    {post.content && (
                      <TweetContent style={{ paddingLeft: 0 }}>{post.content}</TweetContent>
                    )}
                    <TweetActions style={{ paddingLeft: 0, marginTop: props => props.theme.spacing.md }}>
                      <TweetAction><Heart /> {Math.floor(Math.random() * 1000)}</TweetAction>
                      <TweetAction><MessageCircle /> {Math.floor(Math.random() * 100)}</TweetAction>
                      <TweetAction><Share2 /></TweetAction>
                      <TweetAction><Bookmark /></TweetAction>
                    </TweetActions>
                  </Tweet>
                </PhoneContent>
              </PhoneScreen>
            </PhoneMockup>
          );

        case 'twitter':
          return (
            <PhoneMockup>
              <PhoneScreen>
                <PhoneHeader>
                  <PhoneTitle>
                    <Twitter size={24} color="#1DA1F2" />
                    Home
                  </PhoneTitle>
                </PhoneHeader>
                <PhoneContent>
                  <Tweet>
                    <TweetHeader>
                      <TweetAvatar>
                        {currentWorkspace.name?.charAt(0).toUpperCase()}
                      </TweetAvatar>
                      <TweetAuthor>
                        <TweetName>{currentWorkspace.name}</TweetName>
                        <TweetHandle>@{currentWorkspace.name?.toLowerCase().replace(/\s+/g, '')}</TweetHandle>
                      </TweetAuthor>
                    </TweetHeader>
                    {post.content && (
                      <TweetContent>{post.content}</TweetContent>
                    )}
                    {post.post_media?.[0] && (
                      <TweetImage src={post.post_media[0].file_url} alt="" />
                    )}
                    <TweetActions>
                      <TweetAction><MessageCircle /> {Math.floor(Math.random() * 100)}</TweetAction>
                      <TweetAction><Repeat2 /> {Math.floor(Math.random() * 50)}</TweetAction>
                      <TweetAction><Heart /> {Math.floor(Math.random() * 500)}</TweetAction>
                      <TweetAction><Share2 /></TweetAction>
                    </TweetActions>
                  </Tweet>
                </PhoneContent>
              </PhoneScreen>
            </PhoneMockup>
          );

        case 'facebook':
          return (
            <PhoneMockup>
              <PhoneScreen $bgColor="#f0f2f5">
                <PhoneHeader $bgColor="#fff" $borderColor="#e4e6eb">
                  <PhoneTitle $color="#1877F2">
                    <Facebook size={24} color="#1877F2" />
                    facebook
                  </PhoneTitle>
                </PhoneHeader>
                <PhoneContent $bgColor="#f0f2f5">
                  <FacebookPost>
                    <FacebookHeader>
                      <FacebookAvatar>
                        {currentWorkspace.name?.charAt(0).toUpperCase()}
                      </FacebookAvatar>
                      <FacebookAuthor>
                        <FacebookName>{currentWorkspace.name}</FacebookName>
                        <FacebookTime>Just now · 🌎</FacebookTime>
                      </FacebookAuthor>
                    </FacebookHeader>
                    {post.content && (
                      <FacebookContent>{post.content}</FacebookContent>
                    )}
                    {post.post_media?.[0] && (
                      <FacebookImage src={post.post_media[0].file_url} alt="" />
                    )}
                    <FacebookActions>
                      <FacebookAction><ThumbsUp /> Like</FacebookAction>
                      <FacebookAction><MessageCircle /> Comment</FacebookAction>
                      <FacebookAction><Share2 /> Share</FacebookAction>
                    </FacebookActions>
                  </FacebookPost>
                </PhoneContent>
              </PhoneScreen>
            </PhoneMockup>
          );

        case 'linkedin':
          return (
            <PhoneMockup>
              <PhoneScreen $bgColor="#f3f2ef">
                <PhoneHeader $bgColor="#fff" $borderColor="#e0e0e0">
                  <PhoneTitle $color="#0A66C2">
                    <Linkedin size={24} color="#0A66C2" />
                    LinkedIn
                  </PhoneTitle>
                </PhoneHeader>
                <PhoneContent $bgColor="#f3f2ef">
                  <LinkedInPost>
                    <LinkedInHeader>
                      <LinkedInAvatar>
                        {currentWorkspace.name?.charAt(0).toUpperCase()}
                      </LinkedInAvatar>
                      <LinkedInAuthor>
                        <LinkedInName>{currentWorkspace.name}</LinkedInName>
                        <LinkedInTitle>Professional Account</LinkedInTitle>
                      </LinkedInAuthor>
                    </LinkedInHeader>
                    {post.content && (
                      <LinkedInContent>{post.content}</LinkedInContent>
                    )}
                    {post.post_media?.[0] && (
                      <LinkedInImage src={post.post_media[0].file_url} alt="" />
                    )}
                    <LinkedInActions>
                      <LinkedInAction><ThumbsUp /> Like</LinkedInAction>
                      <LinkedInAction><MessageCircle /> Comment</LinkedInAction>
                      <LinkedInAction><Repeat2 /> Repost</LinkedInAction>
                      <LinkedInAction><Send /> Send</LinkedInAction>
                    </LinkedInActions>
                  </LinkedInPost>
                </PhoneContent>
              </PhoneScreen>
            </PhoneMockup>
          );

        case 'youtube':
          return (
            <PhoneMockup>
              <PhoneScreen $bgColor="#fff">
                <PhoneHeader $bgColor="#fff" $borderColor="#e5e5e5">
                  <PhoneTitle $color="#FF0000">
                    <Youtube size={24} color="#FF0000" />
                    YouTube
                  </PhoneTitle>
                </PhoneHeader>
                <PhoneContent $bgColor="#f9f9f9">
                  <div style={{ marginBottom: '16px', background: '#fff' }}>
                    {post.post_media?.[0] && (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                        <img
                          src={post.post_media[0].file_url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.8)',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          0:00
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FF0000, #cc0000)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {currentWorkspace.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '500',
                            fontSize: '14px',
                            color: '#0f0f0f',
                            marginBottom: '4px'
                          }}>
                            {post.content?.split('\n')[0] || 'Video Title'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#606060' }}>
                            {currentWorkspace.name} • 0 views • Just now
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PhoneContent>
              </PhoneScreen>
            </PhoneMockup>
          );

        case 'tiktok':
          return (
            <PhoneMockup>
              <PhoneScreen $bgColor="#000">
                <PhoneHeader $bgColor="#000" $borderColor="#333">
                  <PhoneTitle $color="#fff">
                    <Music size={24} color="#fff" />
                    TikTok
                  </PhoneTitle>
                </PhoneHeader>
                <PhoneContent $bgColor="#000">
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    background: '#121212'
                  }}>
                    {post.post_media?.[0] && (
                      <img
                        src={post.post_media[0].file_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      left: '12px',
                      right: '60px',
                      color: '#fff'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        @{currentWorkspace.name?.toLowerCase().replace(/\s+/g, '')}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.content}
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      right: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ textAlign: 'center', color: '#fff' }}>
                        <Heart size={28} />
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>0</div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#fff' }}>
                        <MessageCircle size={28} />
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>0</div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#fff' }}>
                        <Share2 size={28} />
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>0</div>
                      </div>
                    </div>
                  </div>
                </PhoneContent>
              </PhoneScreen>
            </PhoneMockup>
          );

        default:
          return (
            <EmptyState>
              <EmptyIcon>
                <Search size={64} />
              </EmptyIcon>
              <EmptyTitle>Platform not supported</EmptyTitle>
              <EmptyDescription>
                This post doesn't have any supported platforms selected
              </EmptyDescription>
            </EmptyState>
          );
      }
    };

    return (
      <PostPreviewContainer>
        <PostsList>
          {filteredPosts.map(post => {
            const postPlatforms = post.platforms || [];
            const scheduledDate = post.scheduled_for ? new Date(post.scheduled_for) : null;

            return (
              <PostListItem
                key={post.id}
                $active={postToPreview?.id === post.id}
                onClick={() => setSelectedPostPreview(post)}
              >
                <PostListItemContent>
                  {post.content?.substring(0, 50) || 'No content'}
                  {post.content && post.content.length > 50 ? '...' : ''}
                </PostListItemContent>
                <PostListItemMeta>
                  {postPlatforms.map((platformId) => {
                    const platformConfig = getPlatformConfig(platformId);
                    if (!platformConfig) return null;
                    const Icon = platformConfig.icon;

                    return (
                      <PlatformBadge key={platformId} $color={platformConfig.color} title={platformConfig.label} style={{ width: '20px', height: '20px' }}>
                        {Icon && <Icon size={12} />}
                      </PlatformBadge>
                    );
                  })}
                  <StatusBadge $status={post.status}>{post.status}</StatusBadge>
                </PostListItemMeta>
              </PostListItem>
            );
          })}
        </PostsList>
        <PostPreviewPane>
          {renderSinglePost(postToPreview)}
        </PostPreviewPane>
      </PostPreviewContainer>
    );
  };

  const renderPosts = () => {
    if (filteredPosts.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>
            <Plus size={64} />
          </EmptyIcon>
          <EmptyTitle>No posts yet</EmptyTitle>
          <EmptyDescription>
            Create your first post to get started
          </EmptyDescription>
          <Button $variant="primary" onClick={handleCreatePost}>
            <Plus size={20} />
            Create Post
          </Button>
        </EmptyState>
      );
    }

    return (
      <PostsGrid>
        {filteredPosts.map(post => {
          const postPlatforms = post.platforms || [];
          const scheduledDate = post.scheduled_for ? new Date(post.scheduled_for) : null;

          return (
            <PostCardItem key={post.id}>
              <PostCardHeader>
                <PostPlatforms>
                  {postPlatforms.map((platformId) => {
                    const platformConfig = getPlatformConfig(platformId);
                    if (!platformConfig) return null;
                    const Icon = platformConfig.icon;

                    return (
                      <PlatformBadge key={platformId} $color={platformConfig.color} title={platformConfig.label}>
                        {Icon && <Icon />}
                      </PlatformBadge>
                    );
                  })}
                  {postPlatforms.length === 0 && (
                    <StatusBadge $status="draft">No Platforms</StatusBadge>
                  )}
                </PostPlatforms>
                <PostActions>
                  <ActionButton onClick={() => handleEditPost(post)}>
                    <Edit />
                    Edit
                  </ActionButton>
                  <ActionButton $variant="danger" onClick={() => handleDeletePost(post.id)}>
                    <Trash2 />
                  </ActionButton>
                </PostActions>
              </PostCardHeader>

              {post.post_media && post.post_media.length > 0 && (
                <PostMedia>
                  <img src={post.post_media[0].file_url} alt="" />
                </PostMedia>
              )}

              {post.content && (
                <PostContent>
                  {post.content.length > 150
                    ? `${post.content.substring(0, 150)}...`
                    : post.content}
                </PostContent>
              )}

              <PostMeta>
                <PostMetaItem>
                  <StatusBadge $status={post.status}>{post.status}</StatusBadge>
                </PostMetaItem>
                {scheduledDate && (
                  <PostMetaItem>
                    <Calendar />
                    {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </PostMetaItem>
                )}
                {post.hashtags && post.hashtags.length > 0 && (
                  <PostMetaItem>
                    <Hash />
                    {post.hashtags.length} hashtag{post.hashtags.length > 1 ? 's' : ''}
                  </PostMetaItem>
                )}
              </PostMeta>
            </PostCardItem>
          );
        })}
      </PostsGrid>
    );
  };

  const renderPlatformFeed = () => {
    // Show all posts with media, regardless of platform filter
    const platformPosts = posts.filter(post =>
      post.post_media && post.post_media.length > 0
    );

    if (platformPosts.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>
            <Plus size={64} />
          </EmptyIcon>
          <EmptyTitle>No posts with media</EmptyTitle>
          <EmptyDescription>
            Add images or videos to your posts to see them in the feed preview
          </EmptyDescription>
        </EmptyState>
      );
    }

    switch (platformFilter) {
      case 'instagram':
        return (
          <PhoneMockup>
            <PhoneScreen>
              <PhoneHeader>
                <PhoneTitle>
                  <Instagram size={24} />
                  Instagram
                </PhoneTitle>
              </PhoneHeader>
              <PhoneContent>
                <InstagramProfileHeader>
                  <ProfileInfo>
                    <ProfilePicture>
                      {currentWorkspace.name?.charAt(0).toUpperCase()}
                    </ProfilePicture>
                    <ProfileStats>
                      <ProfileName>{currentWorkspace.name}</ProfileName>
                      <ProfileBio>Social Media Management Platform</ProfileBio>
                      <ProfileStatsRow>
                        <StatItem>
                          <strong>{platformPosts.length}</strong>
                          <span>Posts</span>
                        </StatItem>
                        <StatItem>
                          <strong>1.2K</strong>
                          <span>Followers</span>
                        </StatItem>
                        <StatItem>
                          <strong>384</strong>
                          <span>Following</span>
                        </StatItem>
                      </ProfileStatsRow>
                    </ProfileStats>
                  </ProfileInfo>
                </InstagramProfileHeader>

                <HighlightsContainer>
                  <HighlightItem>
                    <HighlightCircle>
                      <HighlightInner>✨</HighlightInner>
                    </HighlightCircle>
                    <HighlightLabel>New</HighlightLabel>
                  </HighlightItem>
                  <HighlightItem>
                    <HighlightCircle>
                      <HighlightInner>📸</HighlightInner>
                    </HighlightCircle>
                    <HighlightLabel>Photos</HighlightLabel>
                  </HighlightItem>
                  <HighlightItem>
                    <HighlightCircle>
                      <HighlightInner>🎥</HighlightInner>
                    </HighlightCircle>
                    <HighlightLabel>Videos</HighlightLabel>
                  </HighlightItem>
                  <HighlightItem>
                    <HighlightCircle>
                      <HighlightInner>🎨</HighlightInner>
                    </HighlightCircle>
                    <HighlightLabel>Creative</HighlightLabel>
                  </HighlightItem>
                </HighlightsContainer>

                <InstagramGrid>
                  {platformPosts.map((post, index) => {
                    const firstMedia = post.post_media[0];
                    return (
                      <GridItem
                        key={post.id}
                        draggable
                        $isDragging={draggedIndex === index}
                        $isDragOver={dragOverIndex === index}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        {firstMedia && (
                          <GridImage src={firstMedia.file_url} alt="" />
                        )}
                        <DragHandle className="drag-handle">
                          <GripVertical size={12} color="#666" />
                        </DragHandle>
                      </GridItem>
                    );
                  })}
                </InstagramGrid>
              </PhoneContent>
            </PhoneScreen>
          </PhoneMockup>
        );

      case 'twitter':
        return (
          <PhoneMockup>
            <PhoneScreen>
              <PhoneHeader>
                <PhoneTitle>
                  <Twitter size={24} color="#1DA1F2" />
                  Home
                </PhoneTitle>
              </PhoneHeader>
              <PhoneContent>
                <TweetList>
                  {platformPosts.map(post => (
                    <Tweet key={post.id}>
                      <TweetHeader>
                        <TweetAvatar>
                          {currentWorkspace.name?.charAt(0).toUpperCase()}
                        </TweetAvatar>
                        <TweetAuthor>
                          <TweetName>{currentWorkspace.name}</TweetName>
                          <TweetHandle>@{currentWorkspace.name?.toLowerCase().replace(/\s+/g, '')}</TweetHandle>
                        </TweetAuthor>
                        <MoreHorizontal size={18} color="#536471" />
                      </TweetHeader>
                      {post.content && (
                        <TweetContent>{post.content}</TweetContent>
                      )}
                      {post.post_media?.[0] && (
                        <TweetImage src={post.post_media[0].file_url} alt="" />
                      )}
                      <TweetActions>
                        <TweetAction><MessageCircle /> 0</TweetAction>
                        <TweetAction><Repeat2 /> 0</TweetAction>
                        <TweetAction><Heart /> 0</TweetAction>
                        <TweetAction><Share2 /></TweetAction>
                      </TweetActions>
                    </Tweet>
                  ))}
                </TweetList>
              </PhoneContent>
            </PhoneScreen>
          </PhoneMockup>
        );

      case 'facebook':
        return (
          <PhoneMockup>
            <PhoneScreen $bgColor="#f0f2f5">
              <PhoneHeader $bgColor="#fff" $borderColor="#e4e6eb">
                <PhoneTitle $color="#1877F2">
                  <Facebook size={24} color="#1877F2" />
                  facebook
                </PhoneTitle>
              </PhoneHeader>
              <PhoneContent $bgColor="#f0f2f5">
                {platformPosts.map(post => (
                  <FacebookPost key={post.id}>
                    <FacebookHeader>
                      <FacebookAvatar>
                        {currentWorkspace.name?.charAt(0).toUpperCase()}
                      </FacebookAvatar>
                      <FacebookAuthor>
                        <FacebookName>{currentWorkspace.name}</FacebookName>
                        <FacebookTime>Just now · 🌎</FacebookTime>
                      </FacebookAuthor>
                      <MoreHorizontal size={20} color="#65676b" />
                    </FacebookHeader>
                    {post.content && (
                      <FacebookContent>{post.content}</FacebookContent>
                    )}
                    {post.post_media?.[0] && (
                      <FacebookImage src={post.post_media[0].file_url} alt="" />
                    )}
                    <FacebookActions>
                      <FacebookAction><ThumbsUp /> Like</FacebookAction>
                      <FacebookAction><MessageCircle /> Comment</FacebookAction>
                      <FacebookAction><Share2 /> Share</FacebookAction>
                    </FacebookActions>
                  </FacebookPost>
                ))}
              </PhoneContent>
            </PhoneScreen>
          </PhoneMockup>
        );

      case 'linkedin':
        return (
          <PhoneMockup>
            <PhoneScreen $bgColor="#f3f2ef">
              <PhoneHeader $bgColor="#fff" $borderColor="#e0e0e0">
                <PhoneTitle $color="#0A66C2">
                  <Linkedin size={24} color="#0A66C2" />
                  LinkedIn
                </PhoneTitle>
              </PhoneHeader>
              <PhoneContent $bgColor="#f3f2ef">
                {platformPosts.map(post => (
                  <LinkedInPost key={post.id}>
                    <LinkedInHeader>
                      <LinkedInAvatar>
                        {currentWorkspace.name?.charAt(0).toUpperCase()}
                      </LinkedInAvatar>
                      <LinkedInAuthor>
                        <LinkedInName>{currentWorkspace.name}</LinkedInName>
                        <LinkedInTitle>Professional Account</LinkedInTitle>
                      </LinkedInAuthor>
                      <MoreHorizontal size={20} color="rgba(0,0,0,0.6)" />
                    </LinkedInHeader>
                    {post.content && (
                      <LinkedInContent>{post.content}</LinkedInContent>
                    )}
                    {post.post_media?.[0] && (
                      <LinkedInImage src={post.post_media[0].file_url} alt="" />
                    )}
                    <LinkedInActions>
                      <LinkedInAction><ThumbsUp /> Like</LinkedInAction>
                      <LinkedInAction><MessageCircle /> Comment</LinkedInAction>
                      <LinkedInAction><Repeat2 /> Repost</LinkedInAction>
                      <LinkedInAction><Send /> Send</LinkedInAction>
                    </LinkedInActions>
                  </LinkedInPost>
                ))}
              </PhoneContent>
            </PhoneScreen>
          </PhoneMockup>
        );

      case 'youtube':
        return (
          <PhoneMockup>
            <PhoneScreen $bgColor="#fff">
              <PhoneHeader $bgColor="#fff" $borderColor="#e5e5e5">
                <PhoneTitle $color="#FF0000">
                  <Youtube size={24} color="#FF0000" />
                  YouTube
                </PhoneTitle>
              </PhoneHeader>
              <PhoneContent $bgColor="#f9f9f9">
                {platformPosts.map(post => (
                  <div key={post.id} style={{ marginBottom: '16px', background: '#fff' }}>
                    {post.post_media?.[0] && (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                        <img
                          src={post.post_media[0].file_url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.8)',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          0:00
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FF0000, #cc0000)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          flexShrink: 0
                        }}>
                          {currentWorkspace.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '500',
                            fontSize: '14px',
                            color: '#0f0f0f',
                            marginBottom: '4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.content?.split('\n')[0] || 'Video Title'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#606060' }}>
                            {currentWorkspace.name} • 0 views • Just now
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </PhoneContent>
            </PhoneScreen>
          </PhoneMockup>
        );

      case 'tiktok':
        return (
          <PhoneMockup>
            <PhoneScreen $bgColor="#000">
              <PhoneHeader $bgColor="#000" $borderColor="#333">
                <PhoneTitle $color="#fff">
                  <Music size={24} color="#fff" />
                  TikTok
                </PhoneTitle>
              </PhoneHeader>
              <PhoneContent $bgColor="#000">
                {platformPosts.map(post => (
                  <div key={post.id} style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '9/16',
                    marginBottom: '8px',
                    background: '#121212'
                  }}>
                    {post.post_media?.[0] && (
                      <img
                        src={post.post_media[0].file_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      left: '12px',
                      right: '60px',
                      color: '#fff'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        @{currentWorkspace.name?.toLowerCase().replace(/\s+/g, '')}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.content}
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      right: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ textAlign: 'center', color: '#fff' }}>
                        <Heart size={28} />
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>0</div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#fff' }}>
                        <MessageCircle size={28} />
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>0</div>
                      </div>
                      <div style={{ textAlign: 'center', color: '#fff' }}>
                        <Share2 size={28} />
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>0</div>
                      </div>
                    </div>
                  </div>
                ))}
              </PhoneContent>
            </PhoneScreen>
          </PhoneMockup>
        );

      default:
        return (
          <EmptyState>
            <EmptyIcon>
              <Search size={64} />
            </EmptyIcon>
            <EmptyTitle>Select a platform</EmptyTitle>
            <EmptyDescription>
              Choose a social media platform to preview your feed
            </EmptyDescription>
          </EmptyState>
        );
    }
  };

  const renderStories = () => {
    // Show all stories, regardless of platform filter
    const storyPosts = posts.filter(post => {
      const media = post.post_media?.[0];
      if (!media) return false;

      // Check if it's a story format (portrait/vertical)
      const isVertical = media.height > media.width;
      return isVertical || post.is_story;
    });

    if (storyPosts.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>
            <Plus size={64} />
          </EmptyIcon>
          <EmptyTitle>No stories yet</EmptyTitle>
          <EmptyDescription>
            Create vertical format content (9:16 ratio) for stories
          </EmptyDescription>
          <Button $variant="primary" onClick={handleCreatePost}>
            <Plus size={20} />
            Create Story
          </Button>
        </EmptyState>
      );
    }

    return (
      <StoriesContainer>
        {storyPosts.map(post => (
          <StoryCard key={post.id}>
            {post.post_media?.[0] && (
              <StoryImage src={post.post_media[0].file_url} alt="" />
            )}
            <StoryOverlay>
              <StoryHeader>
                <StoryAvatar>
                  {currentWorkspace.name?.charAt(0).toUpperCase()}
                </StoryAvatar>
                <StoryAuthor>{currentWorkspace.name}</StoryAuthor>
              </StoryHeader>
              <StoryActions>
                <StoryActionButton>
                  <Edit size={14} />
                  Edit
                </StoryActionButton>
                <StoryActionButton>
                  <Trash2 size={14} />
                  Delete
                </StoryActionButton>
              </StoryActions>
            </StoryOverlay>
          </StoryCard>
        ))}
      </StoriesContainer>
    );
  };

  const renderInstagramView = () => {
    // Check if Instagram is connected
    const hasInstagram = accounts.some(account => account.platform === 'instagram');

    if (!hasInstagram) {
      return (
        <EmptyState>
          <EmptyIcon>
            <Instagram size={64} />
          </EmptyIcon>
          <EmptyTitle>Instagram Not Connected</EmptyTitle>
          <EmptyDescription>
            Connect your Instagram account to see your feed and stories
          </EmptyDescription>
        </EmptyState>
      );
    }

    // Get posts for the left column
    const instagramPosts = filteredPosts.filter(post =>
      post.platforms?.includes('instagram')
    );

    // Get feed posts (posts with media)
    const feedPosts = posts.filter(post =>
      post.post_media && post.post_media.length > 0 &&
      post.platforms?.includes('instagram')
    );

    // Get story posts (vertical format)
    const storyPosts = posts.filter(post => {
      const media = post.post_media?.[0];
      if (!media) return false;
      const isVertical = media.height > media.width;
      return (isVertical || post.is_story) && post.platforms?.includes('instagram');
    });

    const renderPostsList = () => {
      if (instagramPosts.length === 0) {
        return (
          <EmptyState>
            <EmptyIcon>
              <Plus size={48} />
            </EmptyIcon>
            <EmptyTitle>No Instagram Posts</EmptyTitle>
            <EmptyDescription>
              Create posts for Instagram to see them here
            </EmptyDescription>
          </EmptyState>
        );
      }

      return instagramPosts.map(post => {
        const scheduledDate = post.scheduled_for ? new Date(post.scheduled_for) : null;

        return (
          <PostCardItem key={post.id} onClick={() => setSelectedPostPreview(post)}>
            <PostCardHeader>
              <PostPlatforms>
                <PlatformBadge $color="#E4405F">
                  <Instagram />
                </PlatformBadge>
              </PostPlatforms>
              <PostActions>
                <ActionButton onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}>
                  <Edit size={16} />
                </ActionButton>
                <ActionButton
                  $variant="danger"
                  onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                >
                  <Trash2 size={16} />
                </ActionButton>
              </PostActions>
            </PostCardHeader>

            {post.post_media && post.post_media.length > 0 && (
              <PostMedia>
                <img src={post.post_media[0].file_url} alt="" />
              </PostMedia>
            )}

            <PostContent>{post.content}</PostContent>

            <PostMeta>
              {post.hashtags && post.hashtags.length > 0 && (
                <PostMetaItem>
                  <Hash size={14} />
                  {post.hashtags.length}
                </PostMetaItem>
              )}
              {scheduledDate && (
                <PostMetaItem>
                  <Calendar size={14} />
                  {scheduledDate.toLocaleDateString()}
                </PostMetaItem>
              )}
              <StatusBadge $status={post.status}>{post.status}</StatusBadge>
            </PostMeta>
          </PostCardItem>
        );
      });
    };

    const renderRightPanel = () => {
      if (rightPanelTab === 'feed') {
        if (feedPosts.length === 0) {
          return (
            <EmptyState>
              <EmptyIcon>
                <Instagram size={48} />
              </EmptyIcon>
              <EmptyTitle>No Feed Posts</EmptyTitle>
              <EmptyDescription>
                Add media to your Instagram posts to see them in the feed
              </EmptyDescription>
            </EmptyState>
          );
        }

        return (
          <FeedGrid>
            {feedPosts.map(post => (
              <FeedItem key={post.id}>
                {post.post_media?.[0] && (
                  <img src={post.post_media[0].file_url} alt="" />
                )}
                <FeedOverlay>
                  <FeedStats>
                    <FeedStat>
                      <Heart size={20} />
                      <span>0</span>
                    </FeedStat>
                    <FeedStat>
                      <MessageCircle size={20} />
                      <span>0</span>
                    </FeedStat>
                  </FeedStats>
                </FeedOverlay>
              </FeedItem>
            ))}
          </FeedGrid>
        );
      } else {
        if (storyPosts.length === 0) {
          return (
            <EmptyState>
              <EmptyIcon>
                <Instagram size={48} />
              </EmptyIcon>
              <EmptyTitle>No Stories</EmptyTitle>
              <EmptyDescription>
                Create vertical format content (9:16 ratio) for stories
              </EmptyDescription>
            </EmptyState>
          );
        }

        return (
          <StoriesContainer>
            {storyPosts.map(post => (
              <StoryCard key={post.id}>
                {post.post_media?.[0] && (
                  <StoryImage src={post.post_media[0].file_url} alt="" />
                )}
                <StoryOverlay>
                  <StoryHeader>
                    <StoryAvatar>
                      {currentWorkspace.name?.charAt(0).toUpperCase()}
                    </StoryAvatar>
                    <StoryAuthor>{currentWorkspace.name}</StoryAuthor>
                  </StoryHeader>
                </StoryOverlay>
              </StoryCard>
            ))}
          </StoriesContainer>
        );
      }
    };

    return (
      <TwoColumnLayout>
        <LeftColumn>
          {renderPostsList()}
        </LeftColumn>
        <RightColumn>
          <RightPanelHeader>
            <RightPanelTab
              $active={rightPanelTab === 'feed'}
              onClick={() => setRightPanelTab('feed')}
            >
              Feed
            </RightPanelTab>
            <RightPanelTab
              $active={rightPanelTab === 'stories'}
              onClick={() => setRightPanelTab('stories')}
            >
              Stories
            </RightPanelTab>
          </RightPanelHeader>
          {renderRightPanel()}
        </RightColumn>
      </TwoColumnLayout>
    );
  };

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Content</Title>
          <Subtitle>Preview and manage your social media content</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <Button onClick={handleDownloadTemplate}>
            <FileSpreadsheet size={20} />
            Template
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Upload size={20} />
            Import
          </Button>
          <Button onClick={handleExcelExport}>
            <Download size={20} />
            Export
          </Button>
          <Button
            $variant="primary"
            onClick={handleCreatePost}
          >
            <Plus size={20} />
            Create Post
          </Button>
        </HeaderActions>
      </Header>

      <AccountSelector
        accounts={accounts.map(acc => ({
          ...acc,
          connected: acc.is_active,
          selected: platformFilter === acc.platform,
        }))}
        isAllSelected={platformFilter === 'all'}
        onSelectAll={() => setPlatformFilter('all')}
        onToggleSelect={(accountId, platform) => {
          setPlatformFilter(platformFilter === platform ? 'all' : platform);
        }}
        onConnect={(platform) => {
          window.location.href = `/api/auth/connect/${platform}?workspace_id=${currentWorkspace.id}`;
        }}
        showUnconnected={true}
      />

      <SearchBar>
        <SearchIcon>
          <Search size={20} />
        </SearchIcon>
        <SearchInput
          placeholder="Search posts by content or hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBar>

      {/* Status filter tabs */}
      <ViewTabsContainer>
        <ViewTab
          $active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        >
          All Posts
        </ViewTab>
        <ViewTab
          $active={statusFilter === 'scheduled'}
          onClick={() => setStatusFilter('scheduled')}
        >
          Scheduled
        </ViewTab>
        <ViewTab
          $active={statusFilter === 'draft'}
          onClick={() => setStatusFilter('draft')}
        >
          Draft
        </ViewTab>
        <ViewTab
          $active={statusFilter === 'published'}
          onClick={() => setStatusFilter('published')}
        >
          Published
        </ViewTab>
      </ViewTabsContainer>

      {/* View mode tabs - platform aware */}
      <ViewTabsContainer>
        <ViewTab
          $active={viewMode === 'posts'}
          onClick={() => setViewMode('posts')}
        >
          Posts
        </ViewTab>
        <ViewTab
          $active={viewMode === 'preview'}
          onClick={() => setViewMode('preview')}
        >
          Post Preview
        </ViewTab>
        <ViewTab
          $active={viewMode === 'feed'}
          onClick={() => setViewMode('feed')}
        >
          {platformFilter === 'youtube' ? 'Videos' :
           platformFilter === 'tiktok' ? 'Videos' :
           platformFilter === 'twitter' ? 'Tweets' :
           platformFilter === 'linkedin' ? 'Posts' :
           'Feed Preview'}
        </ViewTab>
        {/* Show Stories/Shorts tab for platforms that support it */}
        {(platformFilter === 'instagram' || platformFilter === 'facebook' || platformFilter === 'tiktok' || platformFilter === 'youtube') && (
          <ViewTab
            $active={viewMode === 'stories'}
            onClick={() => setViewMode('stories')}
          >
            {platformFilter === 'youtube' ? 'Shorts' :
             platformFilter === 'tiktok' ? 'Stories' :
             'Stories'}
          </ViewTab>
        )}
      </ViewTabsContainer>

      {viewMode === 'posts' && renderPosts()}
      {viewMode === 'preview' && renderPostPreview()}
      {viewMode === 'instagram' && renderInstagramView()}
      {viewMode === 'feed' && renderPlatformFeed()}
      {viewMode === 'stories' && renderStories()}

      <PostComposer
        isOpen={isComposerOpen}
        onClose={handleComposerClose}
        post={selectedPost}
        onSave={handlePostSave}
        onSuccess={handlePostSave}
        preSelectedPlatform={platformFilter}
      />

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Posts from Excel"
        size="lg"
      >
        <ExcelImport
          onImport={handleExcelImport}
          onClose={() => setIsImportModalOpen(false)}
        />
      </Modal>
    </Container>
  );
}
