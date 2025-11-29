'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  MoreVertical,
  Image,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Instagram,
  Facebook,
  Music,
  RefreshCw,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  FileText,
  Download,
  Pin,
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useInbox } from '@/contexts/InboxContext';
import { showToast } from '@/components/ui/Toast';
import { PageSpinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { uploadFile, getFileCategory, formatFileSize, validateFile } from '@/lib/storage';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinIcon = styled.span`
  display: inline-flex;
  animation: ${spin} 1s linear infinite;
`;

// Layout
const Container = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

// Sidebar - Conversation List
const Sidebar = styled.div`
  width: 380px;
  min-width: 380px;
  background: ${props => props.theme.colors.background.elevated};
  border-right: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const SidebarTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.default};
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.neutral[100]};
    box-shadow: ${props => props.theme.shadows.neon};
  }

  input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.colors.text.primary};

    &::placeholder {
      color: ${props => props.theme.colors.text.secondary};
    }
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const FilterTab = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: ${props => props.$active
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  color: ${props => props.$active ? props.theme.colors.primary.contrast : props.theme.colors.text.secondary};

  &:hover {
    background: ${props => props.$active
      ? props.theme.colors.primary.dark
      : props.theme.colors.neutral[300]};
  }
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ConversationItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid ${props => props.$active
    ? props.theme.colors.primary.main
    : 'transparent'};
  background: ${props => props.$active
    ? `${props.theme.colors.primary.main}08`
    : 'transparent'};

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  &:hover .delete-thread-btn {
    opacity: 1;
  }
`;

const DeleteThreadButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.main};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #FEE2E2;
    color: #DC2626;
    border-color: #FCA5A5;
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.98);
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.$unread
    ? props.theme.colors.primary.main
    : props.theme.colors.border.default};
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ContactName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$unread
    ? props.theme.typography.fontWeight.bold
    : props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$unread
    ? props.theme.colors.primary.main
    : props.theme.colors.text.secondary};
  white-space: nowrap;
`;

const LastMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.$unread
    ? props.theme.colors.text.primary
    : props.theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${props => props.$unread
    ? props.theme.typography.fontWeight.medium
    : props.theme.typography.fontWeight.normal};
`;

const PlatformBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  right: 0;
  border: 2px solid ${props => props.theme.colors.background.elevated};
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const UnreadBadge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border-radius: 10px;
  font-size: 10px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Main Chat Area
const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.default};
`;

const ChatHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ChatHeaderName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const ChatHeaderStatus = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.xl};
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;

  &:hover .message-actions {
    opacity: 1;
  }

  ${props => props.$direction === 'in' ? `
    align-self: flex-start;
    background: ${props.theme.colors.background.elevated};
    border: 1px solid ${props.theme.colors.border.default};
    border-bottom-left-radius: 4px;
    color: ${props.theme.colors.text.primary};
  ` : `
    align-self: flex-end;
    background: ${props.theme.colors.primary.main};
    color: ${props.theme.colors.primary.contrast};
    border-bottom-right-radius: 4px;
  `}
`;

const MessageContent = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.xs};
  font-size: 10px;
  opacity: 0.7;
`;

const MessageImage = styled.img`
  max-width: 300px;
  max-height: 300px;
  width: auto;
  height: auto;
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
  object-fit: cover;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const MessageActions = styled.div`
  position: absolute;
  top: -8px;
  right: ${props => props.$direction === 'out' ? '-8px' : 'auto'};
  left: ${props => props.$direction === 'in' ? '-8px' : 'auto'};
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const MessageActionButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.$delete ? '#EF4444' : props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$delete ? '#EF4444' : props.theme.colors.primary.main};
    color: white;
    transform: scale(1.1);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: ${props => props.$direction === 'out' ? '20px' : '20px'};
  right: ${props => props.$direction === 'out' ? '0' : 'auto'};
  left: ${props => props.$direction === 'in' ? '0' : 'auto'};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing.xs};
  min-width: 160px;
  z-index: 100;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  background: transparent;
  color: ${props => props.$delete ? '#EF4444' : props.theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.$delete
      ? 'rgba(239, 68, 68, 0.1)'
      : props.theme.colors.neutral[100]};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FileCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.$direction === 'out'
    ? 'rgba(255, 255, 255, 0.1)'
    : props.theme.colors.neutral[100]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.$direction === 'out'
    ? 'rgba(255, 255, 255, 0.2)'
    : props.theme.colors.border.default};
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$direction === 'out'
    ? 'rgba(255, 255, 255, 0.15)'
    : props.theme.colors.primary.main + '20'};
  color: ${props => props.$direction === 'out'
    ? 'white'
    : props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

const FileSize = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  opacity: 0.7;
`;

const FileDownloadButton = styled.a`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$direction === 'out'
    ? 'rgba(255, 255, 255, 0.15)'
    : props.theme.colors.primary.main + '20'};
  color: ${props => props.$direction === 'out'
    ? 'white'
    : props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$direction === 'out'
      ? 'rgba(255, 255, 255, 0.25)'
      : props.theme.colors.primary.main};
    color: white;
    transform: scale(1.1);
  }
`;

const FilePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.neutral[100]};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const FilePreviewItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const FilePreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
`;

const RemoveFileButton = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #EF4444;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #DC2626;
    transform: scale(1.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
`;

const ConfirmDialogContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  max-width: 400px;
  width: 90%;
`;

const ConfirmDialogTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ConfirmDialogMessage = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ConfirmDialogActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$variant === 'danger' ? `
    background: #EF4444;
    color: white;

    &:hover {
      background: #DC2626;
    }
  ` : `
    background: ${props.theme.colors.neutral[200]};
    color: ${props.theme.colors.text.primary};

    &:hover {
      background: ${props.theme.colors.neutral[300]};
    }
  `}
`;

// Message Input
const InputArea = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.sm};
`;

const InputActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => `${props.theme.colors.primary.main}20`};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  resize: none;
  max-height: 120px;
  padding: ${props => props.theme.spacing.sm};

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$disabled
    ? props.theme.colors.neutral[300]
    : props.theme.colors.primary.main};
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary.dark};
    transform: scale(1.05);
  }
`;

// Empty states
const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// Platform colors
const PLATFORM_COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  messenger: '#0084FF',
};

const PLATFORM_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music,
  messenger: MessageSquare,
};

export default function InboxPage() {
  const { currentWorkspace, socialAccounts } = useWorkspace();
  const { refreshUnreadCount } = useInbox();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);
  const messagesEndRef = useRef(null);
  const supabaseRef = useRef(null);

  // File upload and attachments
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Image lightbox
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  // Edit message
  const [editingMessage, setEditingMessage] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Delete thread confirmation
  const [deleteThreadConfirm, setDeleteThreadConfirm] = useState(null);

  // Message actions dropdown menu
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Initialize Supabase client
  useEffect(() => {
    supabaseRef.current = createClient();
  }, []);

  // Load threads on mount and filter change
  useEffect(() => {
    if (currentWorkspace) {
      loadThreads();
      // Keep polling as backup (every 5 seconds) since Facebook messages come via sync
      const interval = setInterval(loadThreads, 5000);
      return () => clearInterval(interval);
    }
  }, [currentWorkspace, filter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.message-actions')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Setup Supabase Realtime subscriptions for instant updates
  useEffect(() => {
    if (!currentWorkspace || !supabaseRef.current) return;

    const supabase = supabaseRef.current;

    // Subscribe to new messages in this workspace
    const messagesChannel = supabase
      .channel(`inbox-messages-${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbox_messages',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new;

          // If this message belongs to the selected thread, reload messages with complete data
          if (selectedThread && newMessage.thread_id === selectedThread.id) {
            await loadMessages(selectedThread.id);
          }

          // Refresh thread list to update last message and unread counts
          loadThreads();
        }
      )
      .subscribe();

    // Subscribe to thread updates (for status changes, unread counts, etc.)
    const threadsChannel = supabase
      .channel(`inbox-threads-${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inbox_threads',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          console.log('Thread update received:', payload);
          loadThreads();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(threadsChannel);
    };
  }, [currentWorkspace, selectedThread]);

  // Auto-sync on initial load if we have no threads
  // This will fetch accounts from the API and sync if needed
  useEffect(() => {
    const autoSync = async () => {
      if (!currentWorkspace || hasInitialSync || loading || threads.length > 0) return;

      // Check if there are social accounts by fetching from API
      try {
        const response = await fetch(`/api/social-accounts?workspace_id=${currentWorkspace.id}`);
        const data = await response.json();

        if (data.accounts && data.accounts.length > 0) {
          console.log('Auto-syncing inbox with', data.accounts.length, 'accounts');
          setHasInitialSync(true);
          await syncConversations();
        }
      } catch (error) {
        console.error('Error checking accounts for auto-sync:', error);
      }
    };
    autoSync();
  }, [currentWorkspace, hasInitialSync, loading, threads.length]);

  const syncConversations = async () => {
    if (!currentWorkspace || syncing) return;

    setSyncing(true);
    try {
      const response = await fetch(`/api/inbox/sync?workspace_id=${currentWorkspace.id}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Reload threads after sync
        await loadThreads();
        const totalImported = data.results.reduce((acc, r) => acc + (r.messagesImported || 0), 0);
        if (totalImported > 0) {
          showToast.success(`Synced ${totalImported} messages`);
        }
      } else {
        showToast.error(data.error || 'Failed to sync');
      }
    } catch (error) {
      console.error('Sync error:', error);
      showToast.error('Failed to sync conversations');
    } finally {
      setSyncing(false);
    }
  };

  // Load messages when thread selected
  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      markAsRead(selectedThread.id);
    }
  }, [selectedThread]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // File upload handlers
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      try {
        validateFile(file, 10 * 1024 * 1024); // 10MB max
        validFiles.push(file);
      } catch (error) {
        showToast.error(error.message);
      }
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (imageUrl) => {
    setLightboxImage(imageUrl);
    setLightboxVisible(true);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageInput(message.content || '');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageInput('');
  };

  const handleDeleteMessage = (message) => {
    setDeleteConfirm(message);
  };

  const confirmDeleteMessage = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/inbox/messages/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove message from UI optimistically
        setMessages(prev => prev.filter(m => m.id !== deleteConfirm.id));
        showToast.success('Message deleted');
        loadThreads(); // Refresh thread list
      } else {
        showToast.error(data.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast.error('Failed to delete message');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handlePinMessage = async (message) => {
    const isPinned = message.metadata?.pinned || false;

    try {
      const response = await fetch(`/api/inbox/messages/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !isPinned }),
      });

      const data = await response.json();

      if (data.success) {
        // Update message in UI
        setMessages(prev => prev.map(m =>
          m.id === message.id
            ? { ...m, metadata: { ...m.metadata, pinned: !isPinned } }
            : m
        ));
        showToast.success(isPinned ? 'Message unpinned' : 'Message pinned');
      } else {
        showToast.error(data.error || 'Failed to pin message');
      }
    } catch (error) {
      console.error('Error pinning message:', error);
      showToast.error('Failed to pin message');
    }
    setActiveDropdown(null);
  };

  const handleUnsendMessage = async (message) => {
    try {
      const response = await fetch(`/api/inbox/messages/${message.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.filter(m => m.id !== message.id));
        showToast.success('Message unsent');
        loadThreads();
      } else {
        showToast.error(data.error || 'Failed to unsend message');
      }
    } catch (error) {
      console.error('Error unsending message:', error);
      showToast.error('Failed to unsend message');
    }
    setActiveDropdown(null);
  };

  const handleDeleteThread = (thread, e) => {
    e.stopPropagation(); // Prevent selecting the thread
    setDeleteThreadConfirm(thread);
  };

  const confirmDeleteThread = async () => {
    if (!deleteThreadConfirm) return;

    try {
      const response = await fetch(`/api/inbox/threads/${deleteThreadConfirm.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove thread from UI
        setThreads(prev => prev.filter(t => t.id !== deleteThreadConfirm.id));

        // If deleted thread was selected, clear selection
        if (selectedThread?.id === deleteThreadConfirm.id) {
          setSelectedThread(null);
          setMessages([]);
        }

        showToast.success('Chat deleted successfully');
      } else {
        showToast.error(data.error || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      showToast.error('Failed to delete chat');
    } finally {
      setDeleteThreadConfirm(null);
    }
  };

  const loadThreads = async () => {
    try {
      const params = new URLSearchParams({
        workspace_id: currentWorkspace.id,
      });

      const response = await fetch(`/api/inbox/threads?${params}`);
      const data = await response.json();

      if (data.success) {
        setThreads(data.threads);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/inbox/threads/${threadId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.thread.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (threadId) => {
    try {
      await fetch(`/api/inbox/threads/${threadId}/mark-read`, {
        method: 'POST',
      });
      // Update local state
      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, unreadCount: 0 } : t
      ));
      // Refresh header notification count
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedThread || sending || uploading) return;

    // Handle edit mode
    if (editingMessage) {
      await handleUpdateMessage();
      return;
    }

    setSending(true);
    let uploadedFiles = [];

    try {
      // Upload files if any
      if (selectedFiles.length > 0) {
        setUploading(true);
        for (const file of selectedFiles) {
          try {
            const uploaded = await uploadFile(file, currentWorkspace.id);
            uploadedFiles.push({
              url: uploaded.url,
              name: uploaded.name,
              size: uploaded.size,
              type: getFileCategory(uploaded.type),
              mimeType: uploaded.type,
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            showToast.error(`Failed to upload ${file.name}`);
          }
        }
        setUploading(false);
      }

      const response = await fetch(`/api/inbox/threads/${selectedThread.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageInput,
          attachments: uploadedFiles,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageInput('');
        setSelectedFiles([]);
        // Reload messages to get complete data from server
        await loadMessages(selectedThread.id);
        loadThreads(); // Refresh thread list
      } else {
        showToast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleUpdateMessage = async () => {
    if (!messageInput.trim() || !editingMessage || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/inbox/messages/${editingMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput }),
      });

      const data = await response.json();

      if (data.success) {
        // Update message in UI optimistically
        setMessages(prev => prev.map(m =>
          m.id === editingMessage.id
            ? { ...m, content: messageInput, edited: true }
            : m
        ));
        setMessageInput('');
        setEditingMessage(null);
        showToast.success('Message updated');
        loadThreads(); // Refresh thread list
      } else {
        showToast.error(data.error || 'Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      showToast.error('Failed to update message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter threads by search and read/unread status
  const filteredThreads = threads.filter(thread => {
    // Apply read/unread filter
    if (filter === 'unread' && thread.unreadCount === 0) return false;
    if (filter === 'read' && thread.unreadCount > 0) return false;

    // Apply search filter
    if (!searchQuery) return true;
    return thread.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           thread.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <Container>
      {/* Sidebar - Conversation List */}
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>
            <MessageSquare size={24} />
            Inbox
            {socialAccounts.length > 0 && (
              <IconButton
                onClick={syncConversations}
                disabled={syncing}
                style={{ marginLeft: 'auto' }}
                title="Sync conversations"
              >
                {syncing ? (
                  <SpinIcon><RefreshCw size={16} /></SpinIcon>
                ) : (
                  <RefreshCw size={16} />
                )}
              </IconButton>
            )}
          </SidebarTitle>
          <SearchBox>
            <Search size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
        </SidebarHeader>

        <FilterTabs>
          <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterTab>
          <FilterTab $active={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread
          </FilterTab>
          <FilterTab $active={filter === 'read'} onClick={() => setFilter('read')}>
            Read
          </FilterTab>
        </FilterTabs>

        <ConversationList>
          {syncing ? (
            <EmptyState>
              <EmptyIcon>
                <SpinIcon><RefreshCw size={32} /></SpinIcon>
              </EmptyIcon>
              <EmptyTitle>Syncing messages...</EmptyTitle>
              <EmptyDescription>
                Fetching conversations from your connected accounts.
              </EmptyDescription>
            </EmptyState>
          ) : filteredThreads.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <MessageSquare size={32} />
              </EmptyIcon>
              {socialAccounts.length === 0 ? (
                <>
                  <EmptyTitle>No accounts connected</EmptyTitle>
                  <EmptyDescription>
                    Connect a Facebook Page to start receiving messages.
                  </EmptyDescription>
                </>
              ) : (
                <>
                  <EmptyTitle>No conversations</EmptyTitle>
                  <EmptyDescription>
                    When people message you on Facebook or Instagram, they'll appear here.
                  </EmptyDescription>
                </>
              )}
            </EmptyState>
          ) : (
            filteredThreads.map(thread => {
              const PlatformIcon = PLATFORM_ICONS[thread.platform] || MessageSquare;
              const isActive = selectedThread?.id === thread.id;
              const hasUnread = thread.unreadCount > 0;

              return (
                <ConversationItem
                  key={thread.id}
                  $active={isActive}
                  onClick={() => setSelectedThread(thread)}
                >
                  <AvatarWrapper>
                    <Avatar
                      src={thread.contact?.avatar}
                      alt={thread.contact?.name}
                      $unread={hasUnread}
                    />
                    <PlatformBadge $color={PLATFORM_COLORS[thread.platform]}>
                      <PlatformIcon size={10} />
                    </PlatformBadge>
                  </AvatarWrapper>

                  <ConversationInfo>
                    <ConversationHeader>
                      <ContactName $unread={hasUnread}>
                        {thread.contact?.name || 'Unknown'}
                      </ContactName>
                      <Timestamp $unread={hasUnread}>
                        {formatTime(thread.lastMessageAt)}
                      </Timestamp>
                    </ConversationHeader>
                    <LastMessage $unread={hasUnread}>
                      {thread.lastMessage || 'No messages yet'}
                    </LastMessage>
                  </ConversationInfo>

                  {hasUnread && (
                    <UnreadBadge>{thread.unreadCount}</UnreadBadge>
                  )}

                  <DeleteThreadButton
                    className="delete-thread-btn"
                    onClick={(e) => handleDeleteThread(thread, e)}
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </DeleteThreadButton>
                </ConversationItem>
              );
            })
          )}
        </ConversationList>
      </Sidebar>

      {/* Main Chat Area */}
      <ChatArea>
        {selectedThread ? (
          <>
            <ChatHeader>
              <ChatHeaderInfo>
                <Avatar
                  src={selectedThread.contact?.avatar}
                  alt={selectedThread.contact?.name}
                  style={{ width: 40, height: 40 }}
                />
                <div>
                  <ChatHeaderName>
                    {selectedThread.contact?.name || 'Unknown'}
                  </ChatHeaderName>
                  <ChatHeaderStatus>
                    {selectedThread.platform} • {selectedThread.status}
                  </ChatHeaderStatus>
                </div>
              </ChatHeaderInfo>
              <IconButton>
                <MoreVertical size={20} />
              </IconButton>
            </ChatHeader>

            <MessagesContainer>
              {loadingMessages ? (
                <EmptyState>
                  <SpinIcon><RefreshCw size={24} /></SpinIcon>
                </EmptyState>
              ) : messages.length === 0 ? (
                <EmptyState>
                  <EmptyDescription>No messages yet</EmptyDescription>
                </EmptyState>
              ) : (
                messages.map(msg => (
                  <MessageBubble key={msg.id} $direction={msg.direction}>
                    {/* Message Actions Menu */}
                    <MessageActions className="message-actions" $direction={msg.direction}>
                      <MessageActionButton
                        onClick={() => setActiveDropdown(activeDropdown === msg.id ? null : msg.id)}
                        title="Message options"
                      >
                        <MoreVertical size={16} />
                      </MessageActionButton>

                      <DropdownMenu $visible={activeDropdown === msg.id} $direction={msg.direction}>
                        {msg.direction === 'out' && (
                          <>
                            <DropdownItem onClick={() => {
                              handleEditMessage(msg);
                              setActiveDropdown(null);
                            }}>
                              <Edit2 />
                              Edit
                            </DropdownItem>
                            <DropdownItem onClick={() => handleUnsendMessage(msg)}>
                              <X />
                              Unsend
                            </DropdownItem>
                          </>
                        )}
                        <DropdownItem onClick={() => handlePinMessage(msg)}>
                          <Pin />
                          {msg.metadata?.pinned ? 'Unpin' : 'Pin'} message
                        </DropdownItem>
                        <DropdownItem onClick={() => {
                          handleDeleteMessage(msg);
                          setActiveDropdown(null);
                        }} $delete>
                          <Trash2 />
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </MessageActions>

                    {/* Attachments */}
                    {msg.attachments?.map((att, i) => {
                      if (att.type === 'image') {
                        return (
                          <MessageImage
                            key={i}
                            src={att.url}
                            alt={att.name || 'Attachment'}
                            onClick={() => handleImageClick(att.url)}
                          />
                        );
                      } else {
                        // Non-image file card
                        return (
                          <FileCard key={i} $direction={msg.direction}>
                            <FileIcon $direction={msg.direction}>
                              <FileText size={20} />
                            </FileIcon>
                            <FileInfo>
                              <FileName>{att.name || 'File'}</FileName>
                              {att.size && <FileSize>{formatFileSize(att.size)}</FileSize>}
                            </FileInfo>
                            <FileDownloadButton
                              href={att.url}
                              download={att.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              $direction={msg.direction}
                            >
                              <Download size={16} />
                            </FileDownloadButton>
                          </FileCard>
                        );
                      }
                    })}

                    {/* Message content */}
                    {msg.content && (
                      <MessageContent>{msg.content}</MessageContent>
                    )}

                    {/* Message metadata */}
                    <MessageMeta>
                      {formatTime(msg.createdAt)}
                      {msg.edited && <span> (edited)</span>}
                      {msg.direction === 'out' && (
                        msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                      )}
                    </MessageMeta>
                  </MessageBubble>
                ))
              )}
              <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputArea>
              {/* File Preview */}
              {selectedFiles.length > 0 && (
                <FilePreviewContainer>
                  {selectedFiles.map((file, index) => (
                    <FilePreviewItem key={index}>
                      {file.type.startsWith('image/') ? (
                        <FilePreviewImage
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                        />
                      ) : (
                        <FileIcon $direction="out">
                          <FileText size={20} />
                        </FileIcon>
                      )}
                      <FileInfo>
                        <FileName>{file.name}</FileName>
                        <FileSize>{formatFileSize(file.size)}</FileSize>
                      </FileInfo>
                      <RemoveFileButton onClick={() => handleRemoveFile(index)}>
                        <X size={12} />
                      </RemoveFileButton>
                    </FilePreviewItem>
                  ))}
                </FilePreviewContainer>
              )}

              {/* Edit mode indicator */}
              {editingMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#FEF3C7',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#92400E'
                }}>
                  <span>Editing message</span>
                  <IconButton onClick={handleCancelEdit} style={{ width: '24px', height: '24px' }}>
                    <X size={16} />
                  </IconButton>
                </div>
              )}

              <InputWrapper>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />
                <InputActions>
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      fileInputRef.current?.setAttribute('accept', 'image/*');
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    title="Attach image"
                  >
                    <Image size={18} />
                  </IconButton>
                </InputActions>
                <MessageInput
                  placeholder={uploading ? "Uploading files..." : "Type a message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  disabled={uploading}
                />
                <SendButton
                  onClick={handleSendMessage}
                  $disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending || uploading}
                  disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending || uploading}
                  title={editingMessage ? "Update message" : "Send message"}
                >
                  {uploading ? (
                    <SpinIcon><RefreshCw size={18} /></SpinIcon>
                  ) : editingMessage ? (
                    <Check size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </SendButton>
              </InputWrapper>
            </InputArea>
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <MessageSquare size={32} />
            </EmptyIcon>
            <EmptyTitle>Select a conversation</EmptyTitle>
            <EmptyDescription>
              Choose a conversation from the list to start messaging
            </EmptyDescription>
          </EmptyState>
        )}
      </ChatArea>

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage}
        alt="Image"
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />

      {/* Delete Message Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog onClick={() => setDeleteConfirm(null)}>
          <ConfirmDialogContent onClick={(e) => e.stopPropagation()}>
            <ConfirmDialogTitle>Delete Message</ConfirmDialogTitle>
            <ConfirmDialogMessage>
              Are you sure you want to delete this message? This action cannot be undone.
            </ConfirmDialogMessage>
            <ConfirmDialogActions>
              <ConfirmButton onClick={() => setDeleteConfirm(null)}>
                Cancel
              </ConfirmButton>
              <ConfirmButton $variant="danger" onClick={confirmDeleteMessage}>
                Delete
              </ConfirmButton>
            </ConfirmDialogActions>
          </ConfirmDialogContent>
        </ConfirmDialog>
      )}

      {/* Delete Thread Confirmation Dialog */}
      {deleteThreadConfirm && (
        <ConfirmDialog onClick={() => setDeleteThreadConfirm(null)}>
          <ConfirmDialogContent onClick={(e) => e.stopPropagation()}>
            <ConfirmDialogTitle>Delete Chat</ConfirmDialogTitle>
            <ConfirmDialogMessage>
              Are you sure you want to delete this entire chat with {deleteThreadConfirm.contact?.name || 'Unknown'}? This will delete all messages and cannot be undone.
            </ConfirmDialogMessage>
            <ConfirmDialogActions>
              <ConfirmButton onClick={() => setDeleteThreadConfirm(null)}>
                Cancel
              </ConfirmButton>
              <ConfirmButton $variant="danger" onClick={confirmDeleteThread}>
                Delete Chat
              </ConfirmButton>
            </ConfirmDialogActions>
          </ConfirmDialogContent>
        </ConfirmDialog>
      )}
    </Container>
  );
}
