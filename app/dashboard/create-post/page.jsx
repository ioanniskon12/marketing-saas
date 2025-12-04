/**
 * Unified Post Creation Page with Platform-Specific Composers
 *
 * Features:
 * - Platform tabs for selected platforms
 * - Platform-specific composers with validation
 * - Cross-posting helpers
 * - Media library integration
 * - Preview components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  Instagram, Facebook, Linkedin, Twitter, Music, Youtube,
  Link2, Calendar, Send, Save, X, Check, AlertCircle, Loader,
  Copy, ArrowRight, Columns2, Square, Rows2, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import MediaLibrarySelector from '@/components/media/MediaLibrarySelector';
import InlineMediaPanel from '@/components/media/InlineMediaPanel';
import DateTimeWheelPicker, { ModalOverlay, ScheduledTimeDisplay } from '@/components/ui/DateTimeWheelPicker';

// Import platform composers
import FacebookComposer from '@/components/posts/composers/FacebookComposer';
import InstagramComposer from '@/components/posts/composers/InstagramComposer';
import LinkedInComposer from '@/components/posts/composers/LinkedInComposer';
import TwitterComposer from '@/components/posts/composers/TwitterComposer';
import TikTokComposer from '@/components/posts/composers/TikTokComposer';
import YouTubeComposer from '@/components/posts/composers/YouTubeComposer';

// Import platform previews
import FacebookPostPreview from '@/components/posts/previews/FacebookPostPreview';
import InstagramPostPreview from '@/components/posts/previews/InstagramPostPreview';
import LinkedInPostPreview from '@/components/posts/previews/LinkedInPostPreview';
import TwitterPostPreview from '@/components/posts/previews/TwitterPostPreview';
import TikTokPostPreview from '@/components/posts/previews/TikTokPostPreview';
import YouTubePostPreview from '@/components/posts/previews/YouTubePostPreview';

// Import validation
import { validateAllPlatforms, hasAnyErrors } from '@/lib/utils/platformValidation';

// Platform configuration
const PLATFORM_CONFIG = {
  facebook: { icon: Facebook, color: '#1877F2', name: 'Facebook' },
  instagram: { icon: Instagram, color: '#E4405F', name: 'Instagram' },
  linkedin: { icon: Linkedin, color: '#0A66C2', name: 'LinkedIn' },
  twitter: { icon: Twitter, color: '#1DA1F2', name: 'Twitter/X' },
  tiktok: { icon: Music, color: '#000000', name: 'TikTok' },
  youtube: { icon: Youtube, color: '#FF0000', name: 'YouTube' },
};

const PLATFORMS_ORDER = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube'];

// Initial platform data structure
const createInitialPlatformData = () => ({
  facebook: {
    accountId: null,
    caption: '',
    media: [],
    linkUrl: '',
    linkPreview: null,
    postType: 'feed',
    hashtags: '',
  },
  instagram: {
    accountId: null,
    caption: '',
    media: [],
    placementType: 'feed',
    firstComment: '',
    hashtags: '',
    taggedUsers: [],
    location: '',
    coverThumbnail: null,
  },
  linkedin: {
    accountId: null,
    pageType: 'profile',
    caption: '',
    media: [],
    linkUrl: '',
    linkPreview: null,
    hashtags: '',
  },
  twitter: {
    accountId: null,
    caption: '',
    media: [],
  },
  tiktok: {
    accountId: null,
    caption: '',
    video: null,
    coverFrame: null,
    sound: '',
    hashtags: '',
  },
  youtube: {
    accountId: null,
    video: null,
    thumbnail: null,
    title: '',
    description: '',
    tags: '',
    category: '',
    visibility: 'public',
    madeForKids: false,
    playlist: '',
  },
});

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const SaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 14px;
    height: 14px;
  }

  &.saving {
    color: ${props => props.theme.colors.primary.main};
  }

  &.saved {
    color: ${props => props.theme.colors.success.main};
  }

  &.unsaved {
    color: ${props => props.theme.colors.warning.main};
  }
`;

// Platform Tabs
const PlatformTabsContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.neutral[100]};
    border-radius: ${props => props.theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.full};
  }
`;

const PlatformTab = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.$color : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  border: 2px solid ${props => props.$active ? props.$color : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  position: relative;

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$active ? props.$color : `${props.$color}15`};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TabErrorIndicator = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: ${props => props.theme.colors.error.main};
  border: 2px solid ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.full};
`;

// Layout Switcher
const LayoutSwitcher = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  width: fit-content;
`;

const LayoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[100]};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Design Theme Selector
const DesignThemeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  width: fit-content;
`;

const ThemeButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  min-width: 100px;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[100]};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
    border-color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.primary.light};
  }

  .theme-name {
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }

  .theme-description {
    font-size: ${props => props.theme.typography.fontSize.xs};
    opacity: 0.8;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

// Layout: Side by Side
const SideBySideLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Layout: Full Width with Collapsible Preview
const FullWidthLayout = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$previewOpen ? '1fr 380px' : '1fr 50px'};
  gap: ${props => props.theme.spacing.md};
  transition: grid-template-columns ${props => props.theme.transitions.base};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CollapsiblePreview = styled.div`
  position: relative;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.base};
`;

const PreviewToggle = styled.button`
  position: absolute;
  top: 12px;
  left: ${props => props.$isOpen ? 'auto' : '50%'};
  right: ${props => props.$isOpen ? '12px' : 'auto'};
  transform: ${props => props.$isOpen ? 'none' : 'translateX(-50%)'};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.full};
  cursor: pointer;
  z-index: 10;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary.main};
    border-color: ${props => props.theme.colors.primary.main};
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PreviewContent = styled.div`
  padding: ${props => props.theme.spacing.xl};
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity ${props => props.theme.transitions.fast};
`;

// Layout: Stacked
const StackedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

// Keep ComposerLayout as alias for backwards compatibility
const ComposerLayout = SideBySideLayout;

const ComposerColumn = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const PreviewColumn = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};

  @media (max-width: 1024px) {
    display: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

// Cross-posting helpers
const CrossPostHelpers = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const HelperButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main}10;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

// Schedule section
const ScheduleSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const ScheduleOptions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ScheduleOption = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  background: ${props => props.$active ? `${props.theme.colors.primary.main}10` : 'transparent'};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  }
`;

const ScheduleLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.primary};
`;

const DateTimeInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.default};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.main}20;
  }
`;

// Action buttons
const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.neutral[300]};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSize.lg};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

// Main Component
export default function CreatePostPage() {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core state
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Platform state
  const [platformData, setPlatformData] = useState(createInitialPlatformData());
  const [activePlatform, setActivePlatform] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  // Scheduling state
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  // Media library
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [currentMediaTarget, setCurrentMediaTarget] = useState(null);

  // Validation
  const [validationResults, setValidationResults] = useState({});

  // Draft state
  const [draftId, setDraftId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Layout state
  const [layoutMode, setLayoutMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('createPostLayout') || 'side-by-side';
    }
    return 'side-by-side';
  });
  const [previewOpen, setPreviewOpen] = useState(true);

  // Design theme - Modern only
  const designTheme = 'modern';

  // Save layout preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('createPostLayout', layoutMode);
    }
  }, [layoutMode]);

  // Load accounts on mount
  useEffect(() => {
    if (currentWorkspace) {
      loadAccounts();
    }
  }, [currentWorkspace]);

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const platform = searchParams.get('platform');

    if (success === 'account_connected' && platform) {
      showToast.success(`${PLATFORM_CONFIG[platform]?.name || platform} connected successfully!`);
      loadAccounts();
      window.history.replaceState({}, '', '/dashboard/create-post');
    } else if (error) {
      showToast.error('Failed to connect account');
      window.history.replaceState({}, '', '/dashboard/create-post');
    }
  }, [searchParams]);

  // Read platforms from query param
  useEffect(() => {
    const platformsParam = searchParams.get('platforms');
    if (platformsParam) {
      const platforms = platformsParam.split(',').filter(p => PLATFORM_CONFIG[p]);
      if (platforms.length > 0) {
        setSelectedPlatforms(platforms);
        setActivePlatform(platforms[0]);
      }
    }
  }, [searchParams]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/social-accounts?workspace_id=${currentWorkspace.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load accounts');
      }

      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      showToast.error('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  // Update platform data for a specific platform
  const updatePlatformData = useCallback((platform, updates) => {
    setPlatformData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        ...updates
      }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Format scheduled time for display
  const formatScheduledTime = (isoString) => {
    if (!isoString) return '';

    const date = new Date(isoString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let dateStr;
    if (dateOnly.getTime() === today.getTime()) {
      dateStr = 'Today';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return `${dateStr} • ${timeStr}`;
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || selectedPlatforms.length === 0) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [platformData, hasUnsavedChanges, selectedPlatforms]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-save function
  const handleAutoSave = async () => {
    if (selectedPlatforms.length === 0 || autoSaving) return;

    // Check if there's any content to save
    const hasContent = selectedPlatforms.some(platform => {
      const data = platformData[platform];
      return data.caption || data.media?.length > 0 || data.title || data.description;
    });

    if (!hasContent) return;

    setAutoSaving(true);

    try {
      // Save draft for the first selected platform (we could enhance this to save all)
      const platform = selectedPlatforms[0];
      const data = platformData[platform];
      const account = accounts.find(acc => acc.platform === platform && acc.is_active);

      if (!account) return;

      const postData = {
        workspace_id: currentWorkspace.id,
        account_id: account.id,
        platform,
        ...data,
        status: 'draft',
        draft_data: JSON.stringify(platformData), // Save all platform data
      };

      // If we have an existing draft, update it
      if (draftId) {
        const response = await fetch(`/api/posts/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });

        if (response.ok) {
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
        }
      } else {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });

        const result = await response.json();

        if (response.ok && result.post) {
          setDraftId(result.post.id);
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Cross-posting helpers
  const copyCaption = (fromPlatform, toPlatform) => {
    const caption = platformData[fromPlatform].caption;
    updatePlatformData(toPlatform, { caption });
    showToast.success(`Caption copied from ${PLATFORM_CONFIG[fromPlatform].name} to ${PLATFORM_CONFIG[toPlatform].name}`);
  };

  const copyMedia = (fromPlatform, toPlatform) => {
    const media = platformData[fromPlatform].media;
    updatePlatformData(toPlatform, { media });
    showToast.success(`Media copied from ${PLATFORM_CONFIG[fromPlatform].name} to ${PLATFORM_CONFIG[toPlatform].name}`);
  };

  const copyAllToAllPlatforms = (field) => {
    const sourceData = platformData[activePlatform][field];
    selectedPlatforms.forEach(platform => {
      if (platform !== activePlatform) {
        updatePlatformData(platform, { [field]: sourceData });
      }
    });
    showToast.success(`${field} copied to all platforms`);
  };

  // Handle media library
  const openMediaLibrary = (platform) => {
    setCurrentMediaTarget(platform);
    setShowMediaLibrary(true);
  };

  const handleMediaSelect = (files) => {
    if (currentMediaTarget) {
      updatePlatformData(currentMediaTarget, { media: files });
    }
    setShowMediaLibrary(false);
    setCurrentMediaTarget(null);
  };

  // Submit post
  const handleSubmit = async (isDraft = false) => {
    // Validate all platforms
    const results = validateAllPlatforms(platformData, selectedPlatforms);
    setValidationResults(results);

    if (!isDraft && hasAnyErrors(results)) {
      showToast.error('Please fix validation errors before publishing');
      return;
    }

    if (scheduleType === 'schedule' && !scheduledDate) {
      showToast.error('Please select a date and time for scheduling');
      return;
    }

    setSubmitting(true);

    try {
      // Create posts for each selected platform
      const postPromises = selectedPlatforms.map(async (platform) => {
        const data = platformData[platform];
        const account = accounts.find(acc => acc.platform === platform && acc.is_active);

        if (!account) {
          return { platform, success: false, error: 'Account not found' };
        }

        const postData = {
          workspace_id: currentWorkspace.id,
          content: data.caption || '',
          platforms: [account.id],
          media: data.media || [],
          hashtags: data.hashtags || '',
          scheduled_for: scheduleType === 'schedule' ? scheduledDate : null,
          status: isDraft ? 'draft' : (scheduleType === 'now' ? 'publishing' : 'scheduled'),
          post_now: scheduleType === 'now',
          platform_data: {
            [platform]: {
              account_id: account.id,
              ...data,
            }
          },
        };

        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error('Post creation failed:', {
              platform,
              status: response.status,
              error: result.error,
              postData
            });
            return { platform, success: false, error: result.error };
          }

          return { platform, success: true };
        } catch (error) {
          return { platform, success: false, error: error.message };
        }
      });

      const results = await Promise.all(postPromises);

      // Show results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        const message = isDraft
          ? `Draft saved for ${successful.length} platform(s)`
          : scheduleType === 'now'
          ? `Publishing to ${successful.length} platform(s)`
          : `Scheduled for ${successful.length} platform(s)`;
        showToast.success(message);
      }

      if (failed.length > 0) {
        failed.forEach(f => {
          showToast.error(`${PLATFORM_CONFIG[f.platform].name}: ${f.error}`);
        });
      }

      if (failed.length === 0) {
        // All successful, reset state and redirect
        setHasUnsavedChanges(false);
        setDraftId(null);
        router.push('/dashboard/calendar');
      }
    } catch (error) {
      console.error('Error creating posts:', error);
      showToast.error('Failed to create posts');
    } finally {
      setSubmitting(false);
    }
  };

  // Render composer for active platform
  const renderComposer = () => {
    if (!activePlatform) return null;

    const data = platformData[activePlatform];
    const errors = validationResults[activePlatform]?.errors || {};

    switch (activePlatform) {
      case 'facebook':
        return (
          <FacebookComposer
            designTheme={designTheme}
            content={data.caption || ''}
            postType={data.postType || 'text'}
            media={data.media || []}
            hashtags={data.hashtags ? data.hashtags.split(',').filter(Boolean) : []}
            onContentChange={(content) => updatePlatformData('facebook', { caption: content })}
            onPostTypeChange={(postType) => updatePlatformData('facebook', { postType })}
            onMediaChange={(media) => updatePlatformData('facebook', { media })}
            onMediaUpload={() => openMediaLibrary('facebook')}
            onOpenMediaLibrary={() => openMediaLibrary('facebook')}
            onHashtagsChange={(hashtags) => updatePlatformData('facebook', { hashtags: hashtags.join(',') })}
          />
        );
      case 'instagram':
        return (
          <InstagramComposer
            designTheme={designTheme}
            content={data.caption || ''}
            placementType={data.placementType || 'feed'}
            media={data.media || []}
            firstComment={data.firstComment || ''}
            hashtags={data.hashtags ? data.hashtags.split(',').filter(Boolean) : []}
            onContentChange={(content) => updatePlatformData('instagram', { caption: content })}
            onPlacementTypeChange={(placementType) => updatePlatformData('instagram', { placementType })}
            onMediaChange={(media) => updatePlatformData('instagram', { media })}
            onMediaUpload={() => openMediaLibrary('instagram')}
            onOpenMediaLibrary={() => openMediaLibrary('instagram')}
            onFirstCommentChange={(firstComment) => updatePlatformData('instagram', { firstComment })}
            onHashtagsChange={(hashtags) => updatePlatformData('instagram', { hashtags: hashtags.join(',') })}
          />
        );
      case 'linkedin':
        return (
          <LinkedInComposer
            designTheme={designTheme}
            content={data.caption || ''}
            media={data.media || []}
            linkUrl={data.linkUrl || ''}
            hashtags={data.hashtags ? data.hashtags.split(',').filter(Boolean) : []}
            onContentChange={(content) => updatePlatformData('linkedin', { caption: content })}
            onMediaChange={(media) => updatePlatformData('linkedin', { media })}
            onMediaUpload={() => openMediaLibrary('linkedin')}
            onOpenMediaLibrary={() => openMediaLibrary('linkedin')}
            onLinkUrlChange={(linkUrl) => updatePlatformData('linkedin', { linkUrl })}
            onHashtagsChange={(hashtags) => updatePlatformData('linkedin', { hashtags: hashtags.join(',') })}
          />
        );
      case 'twitter':
        return (
          <TwitterComposer
            designTheme={designTheme}
            content={data.caption || ''}
            media={data.media || []}
            onContentChange={(content) => updatePlatformData('twitter', { caption: content })}
            onMediaChange={(media) => updatePlatformData('twitter', { media })}
            onMediaUpload={() => openMediaLibrary('twitter')}
            onOpenMediaLibrary={() => openMediaLibrary('twitter')}
          />
        );
      case 'tiktok':
        return (
          <TikTokComposer
            designTheme={designTheme}
            content={data.caption || ''}
            media={data.media || []}
            sound={data.sound || ''}
            hashtags={data.hashtags ? data.hashtags.split(',').filter(Boolean) : []}
            onContentChange={(content) => updatePlatformData('tiktok', { caption: content })}
            onMediaChange={(media) => updatePlatformData('tiktok', { media })}
            onMediaUpload={() => openMediaLibrary('tiktok')}
            onOpenMediaLibrary={() => openMediaLibrary('tiktok')}
            onSoundChange={(sound) => updatePlatformData('tiktok', { sound })}
            onHashtagsChange={(hashtags) => updatePlatformData('tiktok', { hashtags: hashtags.join(',') })}
          />
        );
      case 'youtube':
        return (
          <YouTubeComposer
            designTheme={designTheme}
            title={data.title || ''}
            content={data.description || ''}
            media={data.media || []}
            tags={data.tags ? data.tags.split(',').filter(Boolean) : []}
            category={data.category || ''}
            visibility={data.visibility || 'public'}
            onTitleChange={(title) => updatePlatformData('youtube', { title })}
            onContentChange={(description) => updatePlatformData('youtube', { description })}
            onMediaChange={(media) => updatePlatformData('youtube', { media })}
            onMediaUpload={() => openMediaLibrary('youtube')}
            onOpenMediaLibrary={() => openMediaLibrary('youtube')}
            onTagsChange={(tags) => updatePlatformData('youtube', { tags: tags.join(',') })}
            onCategoryChange={(category) => updatePlatformData('youtube', { category })}
            onVisibilityChange={(visibility) => updatePlatformData('youtube', { visibility })}
          />
        );
      default:
        return null;
    }
  };

  // Render preview for active platform
  const renderPreview = () => {
    if (!activePlatform) return null;

    const data = platformData[activePlatform];

    switch (activePlatform) {
      case 'facebook':
        return <FacebookPostPreview data={data} />;
      case 'instagram':
        return <InstagramPostPreview data={data} />;
      case 'linkedin':
        return <LinkedInPostPreview data={data} />;
      case 'twitter':
        return <TwitterPostPreview data={data} />;
      case 'tiktok':
        return <TikTokPostPreview data={data} />;
      case 'youtube':
        return <YouTubePostPreview data={data} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
          <Loader size={32} className="animate-spin" />
        </div>
      </Container>
    );
  }

  const connectedAccounts = accounts.filter(acc => acc.is_active);
  const connectedPlatforms = [...new Set(connectedAccounts.map(acc => acc.platform))];

  // If no platforms selected and we have connected accounts, show platform selection
  if (selectedPlatforms.length === 0 && connectedPlatforms.length > 0) {
    return (
      <Container>
        <Header>
          <Title>Select Platforms</Title>
          <Subtitle>Choose which platforms you want to post to</Subtitle>
        </Header>

        <ComposerColumn>
          <SectionTitle>Available Platforms</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            {PLATFORMS_ORDER.map(platform => {
              const config = PLATFORM_CONFIG[platform];
              const isConnected = connectedPlatforms.includes(platform);
              const Icon = config.icon;

              return (
                <div
                  key={platform}
                  onClick={() => {
                    if (isConnected) {
                      setSelectedPlatforms([platform]);
                      setActivePlatform(platform);
                    }
                  }}
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: isConnected ? config.color : '#e5e7eb',
                    borderRadius: '12px',
                    cursor: isConnected ? 'pointer' : 'not-allowed',
                    opacity: isConnected ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ color: config.color, marginBottom: '8px' }}>
                    <Icon size={32} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{config.name}</div>
                  {!isConnected && <div style={{ fontSize: '12px', color: '#9ca3af' }}>Not connected</div>}
                </div>
              );
            })}
          </div>
        </ComposerColumn>
      </Container>
    );
  }

  if (selectedPlatforms.length === 0) {
    return (
      <Container>
        <ComposerColumn>
          <EmptyState>
            <AlertCircle />
            <h3>No Platforms Connected</h3>
            <p>Connect social media accounts to start creating posts</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </EmptyState>
        </ComposerColumn>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Create Post</Title>
        <Subtitle>
          Create and schedule posts for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
        </Subtitle>
        {autoSaving ? (
          <SaveStatus className="saving">
            <Loader className="animate-spin" />
            Saving draft...
          </SaveStatus>
        ) : lastSaved ? (
          <SaveStatus className="saved">
            <Check />
            Draft saved at {lastSaved.toLocaleTimeString()}
          </SaveStatus>
        ) : hasUnsavedChanges ? (
          <SaveStatus className="unsaved">
            <AlertCircle />
            Unsaved changes
          </SaveStatus>
        ) : null}
      </Header>

      {/* Platform Tabs */}
      <PlatformTabsContainer>
        {selectedPlatforms.map(platform => {
          const config = PLATFORM_CONFIG[platform];
          const Icon = config.icon;
          const hasErrors = validationResults[platform] && !validationResults[platform].isValid;

          return (
            <PlatformTab
              key={platform}
              $active={activePlatform === platform}
              $color={config.color}
              onClick={() => setActivePlatform(platform)}
            >
              {hasErrors && <TabErrorIndicator />}
              <Icon />
              {config.name}
            </PlatformTab>
          );
        })}
      </PlatformTabsContainer>

      {/* Cross-posting Helpers */}
      {selectedPlatforms.length > 1 && activePlatform && (
        <CrossPostHelpers>
          <HelperButton onClick={() => copyAllToAllPlatforms('caption')}>
            <Copy />
            Copy caption to all
          </HelperButton>
          <HelperButton onClick={() => copyAllToAllPlatforms('media')}>
            <Copy />
            Copy media to all
          </HelperButton>
          {selectedPlatforms.filter(p => p !== activePlatform).map(platform => (
            <HelperButton key={platform} onClick={() => copyCaption(activePlatform, platform)}>
              <ArrowRight />
              Copy to {PLATFORM_CONFIG[platform].name}
            </HelperButton>
          ))}
        </CrossPostHelpers>
      )}


      {/* Composer Layout - Conditional based on layoutMode */}
      {layoutMode === 'side-by-side' && (
        <SideBySideLayout>
        <ComposerColumn>
          <SectionTitle>{PLATFORM_CONFIG[activePlatform]?.name} Post</SectionTitle>

          {renderComposer()}

          {/* Schedule Section */}
          <ScheduleSection>
            <SectionTitle>When to Post</SectionTitle>
            <ScheduleOptions>
              <ScheduleOption
                $active={scheduleType === 'now'}
                onClick={() => setScheduleType('now')}
              >
                <Send />
                <ScheduleLabel $active={scheduleType === 'now'}>
                  Post Now
                </ScheduleLabel>
              </ScheduleOption>
              <ScheduleOption
                $active={scheduleType === 'schedule'}
                onClick={() => setScheduleType('schedule')}
              >
                <Calendar />
                <ScheduleLabel $active={scheduleType === 'schedule'}>
                  Schedule Later
                </ScheduleLabel>
              </ScheduleOption>
            </ScheduleOptions>

            {scheduleType === 'schedule' && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowSchedulePicker(true)}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  <Calendar size={18} />
                  {scheduledDate ? 'Change Schedule' : 'Set Schedule'}
                </Button>

                {scheduledDate && (
                  <ScheduledTimeDisplay>
                    <Calendar size={16} />
                    <span>Scheduled for: <span className="time">{formatScheduledTime(scheduledDate)}</span></span>
                  </ScheduledTimeDisplay>
                )}
              </>
            )}
          </ScheduleSection>

          {/* Action Buttons */}
          <ActionButtons>
            <Button
              variant="ghost"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              <Save size={18} />
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {scheduleType === 'now' ? 'Publishing...' : 'Scheduling...'}
                </>
              ) : (
                <>
                  {scheduleType === 'now' ? <Send size={18} /> : <Calendar size={18} />}
                  {scheduleType === 'now' ? 'Publish Now' : 'Schedule Post'}
                </>
              )}
            </Button>
          </ActionButtons>
        </ComposerColumn>

        <PreviewColumn>
          <SectionTitle>Preview</SectionTitle>
          {renderPreview()}
        </PreviewColumn>
        </SideBySideLayout>
      )}

      {layoutMode === 'full-width' && (
        <FullWidthLayout $previewOpen={previewOpen}>
          <ComposerColumn>
            <SectionTitle>{PLATFORM_CONFIG[activePlatform]?.name} Post</SectionTitle>

            {renderComposer()}

            {/* Schedule Section */}
            <ScheduleSection>
              <SectionTitle>When to Post</SectionTitle>
              <ScheduleOptions>
                <ScheduleOption
                  $active={scheduleType === 'now'}
                  onClick={() => setScheduleType('now')}
                >
                  <Send />
                  <ScheduleLabel $active={scheduleType === 'now'}>
                    Post Now
                  </ScheduleLabel>
                </ScheduleOption>
                <ScheduleOption
                  $active={scheduleType === 'schedule'}
                  onClick={() => setScheduleType('schedule')}
                >
                  <Calendar />
                  <ScheduleLabel $active={scheduleType === 'schedule'}>
                    Schedule Later
                  </ScheduleLabel>
                </ScheduleOption>
              </ScheduleOptions>

              {scheduleType === 'schedule' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setShowSchedulePicker(true)}
                    style={{ marginTop: '12px', width: '100%' }}
                  >
                    <Calendar size={18} />
                    {scheduledDate ? 'Change Schedule' : 'Set Schedule'}
                  </Button>

                  {scheduledDate && (
                    <ScheduledTimeDisplay>
                      <Calendar size={16} />
                      <span>Scheduled for: <span className="time">{formatScheduledTime(scheduledDate)}</span></span>
                    </ScheduledTimeDisplay>
                  )}
                </>
              )}
            </ScheduleSection>

            {/* Action Buttons */}
            <ActionButtons>
              <Button
                variant="ghost"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
              >
                <Save size={18} />
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    {scheduleType === 'now' ? 'Publishing...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    {scheduleType === 'now' ? <Send size={18} /> : <Calendar size={18} />}
                    {scheduleType === 'now' ? 'Publish Now' : 'Schedule Post'}
                  </>
                )}
              </Button>
            </ActionButtons>
          </ComposerColumn>

          <CollapsiblePreview>
            <PreviewToggle
              $isOpen={previewOpen}
              onClick={() => setPreviewOpen(!previewOpen)}
            >
              {previewOpen ? <ChevronRight /> : <ChevronLeft />}
            </PreviewToggle>
            <PreviewContent $visible={previewOpen}>
              <SectionTitle>Preview</SectionTitle>
              {renderPreview()}
            </PreviewContent>
          </CollapsiblePreview>
        </FullWidthLayout>
      )}

      {layoutMode === 'stacked' && (
        <StackedLayout>
          <ComposerColumn>
            <SectionTitle>{PLATFORM_CONFIG[activePlatform]?.name} Post</SectionTitle>

            {renderComposer()}

            {/* Schedule Section */}
            <ScheduleSection>
              <SectionTitle>When to Post</SectionTitle>
              <ScheduleOptions>
                <ScheduleOption
                  $active={scheduleType === 'now'}
                  onClick={() => setScheduleType('now')}
                >
                  <Send />
                  <ScheduleLabel $active={scheduleType === 'now'}>
                    Post Now
                  </ScheduleLabel>
                </ScheduleOption>
                <ScheduleOption
                  $active={scheduleType === 'schedule'}
                  onClick={() => setScheduleType('schedule')}
                >
                  <Calendar />
                  <ScheduleLabel $active={scheduleType === 'schedule'}>
                    Schedule Later
                  </ScheduleLabel>
                </ScheduleOption>
              </ScheduleOptions>

              {scheduleType === 'schedule' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setShowSchedulePicker(true)}
                    style={{ marginTop: '12px', width: '100%' }}
                  >
                    <Calendar size={18} />
                    {scheduledDate ? 'Change Schedule' : 'Set Schedule'}
                  </Button>

                  {scheduledDate && (
                    <ScheduledTimeDisplay>
                      <Calendar size={16} />
                      <span>Scheduled for: <span className="time">{formatScheduledTime(scheduledDate)}</span></span>
                    </ScheduledTimeDisplay>
                  )}
                </>
              )}
            </ScheduleSection>

            {/* Action Buttons */}
            <ActionButtons>
              <Button
                variant="ghost"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
              >
                <Save size={18} />
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    {scheduleType === 'now' ? 'Publishing...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    {scheduleType === 'now' ? <Send size={18} /> : <Calendar size={18} />}
                    {scheduleType === 'now' ? 'Publish Now' : 'Schedule Post'}
                  </>
                )}
              </Button>
            </ActionButtons>
          </ComposerColumn>

          <PreviewColumn>
            <SectionTitle>Preview</SectionTitle>
            {renderPreview()}
          </PreviewColumn>
        </StackedLayout>
      )}

      {/* Media Library Modal - Keeping for backward compatibility but not actively used */}
      {showMediaLibrary && (
        <MediaLibrarySelector
          isOpen={showMediaLibrary}
          onClose={() => {
            setShowMediaLibrary(false);
            setCurrentMediaTarget(null);
          }}
          onSelect={handleMediaSelect}
          multiSelect={true}
          allowedTypes={['image', 'video']}
          maxSelection={10}
        />
      )}

      {/* iOS-Style Schedule Picker Modal */}
      {showSchedulePicker && (
        <ModalOverlay>
          <DateTimeWheelPicker
            initialValue={scheduledDate}
            onChange={(result) => {
              setScheduledDate(result.datetime);
              setShowSchedulePicker(false);
              setHasUnsavedChanges(true);
            }}
            onCancel={() => setShowSchedulePicker(false)}
          />
        </ModalOverlay>
      )}
    </Container>
  );
}
