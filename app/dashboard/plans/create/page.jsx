/**
 * Create Content Plan Page
 *
 * Create a new content plan with multiple posts
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Upload, X, Calendar, Clock, Image as ImageIcon, Video, Hash, FileImage, Check, CalendarDays } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button, Card, Input } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { PLATFORM_TABS_NO_ALL, getContentTypes, CONTENT_TYPES } from '@/lib/config/platforms';

// Platform descriptions for the selector
const PLATFORM_DESCRIPTIONS = {
  instagram: 'Photos, Reels, Stories',
  facebook: 'Posts, Reels, Stories',
  linkedin: 'Professional content',
  twitter: 'Tweets & threads',
  tiktok: 'Short videos',
  youtube: 'Videos & Shorts'
};

// Platform compatibility rules
const PLATFORM_COMPATIBILITY = {
  instagram: ['facebook'], // Instagram can only be with Facebook
  facebook: ['instagram'], // Facebook can only be with Instagram
  youtube: ['tiktok'],     // YouTube can be with TikTok
  tiktok: ['youtube'],     // TikTok can be with YouTube
  linkedin: [],            // LinkedIn is standalone
  twitter: [],             // Twitter is standalone
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Section = styled(Card)`
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid ${props => props.theme.colors.neutral[100]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: ${props => props.theme.colors.primary.main};
    border-radius: 2px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-family: inherit;
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.paper};
  resize: vertical;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary.main}20`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const PostCard = styled.div`
  padding: ${props => props.theme.spacing['2xl']};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.theme.colors.background.paper};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: ${props => props.theme.colors.neutral[300]};
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[100]};
`;

const PostTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${props => props.theme.colors.primary.main};
    border-radius: 50%;
  }
`;

const PlatformSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PlatformCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.$color : props.$disabled ? props.theme.colors.neutral[100] : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.$selected ? `${props.$color}12` : props.$disabled ? props.theme.colors.neutral[50] : props.theme.colors.background.paper};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$disabled ? 0.5 : 1};

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
    border-color: ${props => props.$disabled ? props.theme.colors.neutral[100] : props.$color};
    box-shadow: ${props => props.$disabled ? 'none' : `0 4px 12px ${props.$color}20`};
    transform: ${props => props.$disabled ? 'none' : 'translateY(-2px)'};
    background: ${props => props.$disabled ? props.theme.colors.neutral[50] : `${props.$color}08`};
  }
`;

const PlatformIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$selected ? `${props.$color}20` : props.theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  transition: all 0.2s ease;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const PlatformName = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.$selected ? props.$color : props.theme.colors.text.primary};
`;

const PlatformDescription = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 1.3;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ContentTypeSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ContentTypeChip = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid ${props => props.$isSelected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  background: ${props => props.$isSelected ? props.theme.colors.primary.main + '20' : props.theme.colors.background.paper};
  color: ${props => props.$isSelected ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main + '10'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MediaUpload = styled.div`
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.neutral[50]};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main + '08'};
    transform: translateY(-2px);
  }

  input {
    display: none;
  }

  svg {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const MediaPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const MediaItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveMediaButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.error.main};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error.dark};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const HashtagInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const HashtagChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xs};
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
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.sm};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MonthButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}15` : props.theme.colors.background.paper};
  color: ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$selected ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }

  span {
    display: block;
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    margin-top: ${props => props.theme.spacing.xs};
  }
`;

const ThumbnailUpload = styled.div`
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main + '05'};
  }

  input {
    display: none;
  }
`;

const ThumbnailPreview = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 2px dashed ${props => props.theme.colors.neutral[200]};

  svg {
    width: 56px;
    height: 56px;
    color: ${props => props.theme.colors.neutral[300]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  p {
    font-size: ${props => props.theme.typography.fontSize.base};
    margin: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing['2xl']};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.neutral[100]};
`;

export default function CreatePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace } = useWorkspace();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planMonth, setPlanMonth] = useState('');
  const [posts, setPosts] = useState([]);
  const [preSelectedPlatforms, setPreSelectedPlatforms] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');

  // Get pre-selected platforms from URL
  useEffect(() => {
    const platformsParam = searchParams.get('platforms');
    if (platformsParam) {
      const platforms = platformsParam.split(',').filter(p => p);
      setPreSelectedPlatforms(platforms);

      // Auto-add first post with pre-selected platforms
      if (platforms.length > 0) {
        const newPost = {
          id: Date.now().toString(),
          caption: '',
          platforms: platforms,
          contentType: 'feed', // Default content type
          media: [],
          hashtags: '',
          videoThumbnail: null,
          scheduledDate: '',
          scheduledTime: ''
        };
        setPosts([newPost]);
      }
    }
  }, [searchParams]);

  const handleAddPost = () => {
    const newPost = {
      id: Date.now().toString(),
      caption: '',
      platforms: preSelectedPlatforms.length > 0 ? [...preSelectedPlatforms] : [],
      contentType: 'feed', // Default content type
      media: [],
      hashtags: '',
      videoThumbnail: null,
      scheduledDate: '',
      scheduledTime: ''
    };
    setPosts([...posts, newPost]);
  };

  // Check if a platform is compatible with currently selected platforms
  const isPlatformCompatible = (platformId, selectedPlatforms) => {
    if (selectedPlatforms.length === 0) return true;

    const compatibleWith = PLATFORM_COMPATIBILITY[platformId] || [];

    // Check if all selected platforms are compatible with this one
    for (const selected of selectedPlatforms) {
      if (selected === platformId) continue;

      // If the platform has no compatibility list, it's standalone
      const selectedCompatibility = PLATFORM_COMPATIBILITY[selected] || [];
      if (selectedCompatibility.length === 0 && selectedPlatforms.length > 0) {
        return false;
      }

      // Check if they're compatible with each other
      if (!compatibleWith.includes(selected) && !selectedCompatibility.includes(platformId)) {
        return false;
      }
    }

    return true;
  };

  // Get available content types based on selected platforms
  const getAvailableContentTypes = (platforms) => {
    if (platforms.length === 0) return [];

    // Get content types supported by all selected platforms
    const contentTypeSets = platforms.map(p => {
      const types = getContentTypes(p);
      return new Set(types.map(t => t.id));
    });

    // Find intersection
    const commonTypes = [...contentTypeSets[0]].filter(type =>
      contentTypeSets.every(set => set.has(type))
    );

    return commonTypes.map(id => CONTENT_TYPES[id]).filter(Boolean);
  };

  const handleRemovePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleUpdatePost = (postId, field, value) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, [field]: value } : post
    ));
  };

  const handleTogglePlatform = (postId, platformId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        // If already selected, allow deselection
        if (post.platforms.includes(platformId)) {
          const newPlatforms = post.platforms.filter(p => p !== platformId);
          // Reset content type if no platforms selected
          const newContentType = newPlatforms.length === 0 ? 'feed' : post.contentType;
          return { ...post, platforms: newPlatforms, contentType: newContentType };
        }

        // Check compatibility before adding
        if (!isPlatformCompatible(platformId, post.platforms)) {
          showToast.error(`${platformId} is not compatible with selected platforms`);
          return post;
        }

        const newPlatforms = [...post.platforms, platformId];
        // Reset content type to a common one if needed
        const availableTypes = getAvailableContentTypes(newPlatforms);
        const newContentType = availableTypes.some(t => t.id === post.contentType)
          ? post.contentType
          : (availableTypes[0]?.id || 'feed');

        return { ...post, platforms: newPlatforms, contentType: newContentType };
      }
      return post;
    }));
  };

  const handleContentTypeChange = (postId, contentType) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, contentType } : post
    ));
  };

  const handleMediaUpload = async (postId, files) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newMedia = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      newMedia.push({
        file,
        preview,
        type: file.type.startsWith('video/') ? 'video' : 'image'
      });
    }

    handleUpdatePost(postId, 'media', [...post.media, ...newMedia]);
  };

  const handleRemoveMedia = (postId, mediaIndex) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newMedia = post.media.filter((_, index) => index !== mediaIndex);
    handleUpdatePost(postId, 'media', newMedia);
  };

  const handleThumbnailUpload = async (postId, file) => {
    const preview = URL.createObjectURL(file);
    handleUpdatePost(postId, 'videoThumbnail', { file, preview });
  };

  // Handle hashtag input - add on Enter or Space
  const handleHashtagKeyDown = (postId, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, '');
      if (tag) {
        const post = posts.find(p => p.id === postId);
        if (post) {
          const currentHashtags = post.hashtags ? post.hashtags.split(' ').filter(t => t) : [];
          if (!currentHashtags.includes(`#${tag}`)) {
            const newHashtags = [...currentHashtags, `#${tag}`].join(' ');
            handleUpdatePost(postId, 'hashtags', newHashtags);
          }
        }
        setHashtagInput('');
      }
    }
  };

  // Remove a hashtag from a post
  const removeHashtag = (postId, tagToRemove) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const currentHashtags = post.hashtags ? post.hashtags.split(' ').filter(t => t) : [];
      const newHashtags = currentHashtags.filter(t => t !== tagToRemove).join(' ');
      handleUpdatePost(postId, 'hashtags', newHashtags);
    }
  };

  // Parse hashtags string into array
  const parseHashtags = (hashtagsString) => {
    if (!hashtagsString) return [];
    return hashtagsString.split(' ').filter(t => t.trim());
  };

  const uploadMedia = async (media) => {
    try {
      const fileName = `${Date.now()}-${media.file.name}`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`plans/${currentWorkspace.id}/${fileName}`, media.file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    if (!planTitle.trim()) {
      showToast.error('Please enter a plan title');
      return;
    }

    if (posts.length === 0) {
      showToast.error('Please add at least one post to the plan');
      return;
    }

    // Validate posts
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      if (!post.caption.trim()) {
        showToast.error(`Post ${i + 1}: Please enter a caption`);
        return;
      }
      if (post.platforms.length === 0) {
        showToast.error(`Post ${i + 1}: Please select at least one platform`);
        return;
      }
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        showToast.error('Please log in to create plans');
        setLoading(false);
        return;
      }

      // Create the plan
      const { data: planData, error: planError } = await supabase
        .from('content_plans')
        .insert({
          workspace_id: currentWorkspace.id,
          created_by: user.id,
          title: planTitle,
          description: planDescription,
          status: isDraft ? 'draft' : 'pending_review',
          target_date: planMonth ? `${planMonth}-01` : null
        })
        .select()
        .single();

      if (planError) throw planError;

      // Upload media and create posts
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        // Upload media files
        const mediaUrls = [];
        for (const media of post.media) {
          const url = await uploadMedia(media);
          mediaUrls.push(url);
        }

        // Upload video thumbnail if exists
        let thumbnailUrl = null;
        if (post.videoThumbnail) {
          thumbnailUrl = await uploadMedia(post.videoThumbnail);
        }

        // Prepare platform-specific data
        const platformData = {};

        // Add hashtags for Instagram and Facebook
        if ((post.platforms.includes('instagram') || post.platforms.includes('facebook')) && post.hashtags) {
          platformData.hashtags = post.hashtags;
        }

        // Add thumbnail for YouTube and TikTok
        if ((post.platforms.includes('youtube') || post.platforms.includes('tiktok')) && thumbnailUrl) {
          platformData.thumbnail = thumbnailUrl;
        }

        // Create plan post
        const { error: postError } = await supabase
          .from('plan_posts')
          .insert({
            plan_id: planData.id,
            workspace_id: currentWorkspace.id,
            caption: post.caption,
            platforms: post.platforms,
            platform_data: platformData,
            media_urls: mediaUrls,
            video_thumbnail_url: thumbnailUrl,
            scheduled_date: post.scheduledDate || null,
            scheduled_time: post.scheduledTime || null,
            position: i,
            approval_status: 'pending'
          });

        if (postError) throw postError;
      }

      showToast.success(`Plan ${isDraft ? 'saved as draft' : 'created'} successfully!`);
      router.push(`/dashboard/plans/${planData.id}`);

    } catch (error) {
      console.error('Error creating plan:', error);
      showToast.error('Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const needsHashtags = (platforms) => {
    return platforms.includes('instagram') || platforms.includes('facebook');
  };

  const needsThumbnail = (platforms) => {
    return platforms.includes('youtube') || platforms.includes('tiktok');
  };

  if (!currentWorkspace) {
    return (
      <Container>
        <EmptyState>
          <h3>No Workspace Selected</h3>
          <p>Please select a workspace to create a plan</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Create Content Plan</Title>
          <Subtitle>Create a content plan with multiple posts for client approval</Subtitle>
        </div>
      </Header>

      <Form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Plan Details Section */}
        <Section>
          <SectionTitle>Plan Details</SectionTitle>

          <FormGroup>
            <Label>Plan Title *</Label>
            <Input
              type="text"
              placeholder="e.g., January Social Media Content"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              placeholder="Brief description of this content plan..."
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <CalendarDays size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Month of Plan
            </Label>
            <MonthGrid>
              {[
                { name: 'Jan', full: 'January', num: '01' },
                { name: 'Feb', full: 'February', num: '02' },
                { name: 'Mar', full: 'March', num: '03' },
                { name: 'Apr', full: 'April', num: '04' },
                { name: 'May', full: 'May', num: '05' },
                { name: 'Jun', full: 'June', num: '06' },
                { name: 'Jul', full: 'July', num: '07' },
                { name: 'Aug', full: 'August', num: '08' },
                { name: 'Sep', full: 'September', num: '09' },
                { name: 'Oct', full: 'October', num: '10' },
                { name: 'Nov', full: 'November', num: '11' },
                { name: 'Dec', full: 'December', num: '12' },
              ].map((month) => {
                const year = new Date().getFullYear();
                const monthValue = `${year}-${month.num}`;
                return (
                  <MonthButton
                    key={month.num}
                    type="button"
                    $selected={planMonth === monthValue}
                    onClick={() => setPlanMonth(planMonth === monthValue ? '' : monthValue)}
                  >
                    {month.name}
                    <span>{year}</span>
                  </MonthButton>
                );
              })}
            </MonthGrid>
          </FormGroup>
        </Section>

        {/* Posts Section */}
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <SectionTitle style={{ margin: 0 }}>Posts</SectionTitle>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPost}
            >
              <Plus size={20} />
              Add Post
            </Button>
          </div>

          {posts.length === 0 ? (
            <EmptyState>
              <Plus />
              <p>No posts added yet. Click "Add Post" to get started.</p>
            </EmptyState>
          ) : (
            <PostsList>
              {posts.map((post, index) => (
                <PostCard key={post.id}>
                  <PostHeader>
                    <PostTitle>Post {index + 1}</PostTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePost(post.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </PostHeader>

                  <FormGroup>
                    <Label>Select Platforms *</Label>
                    <PlatformSelector>
                      {PLATFORM_TABS_NO_ALL.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = post.platforms.includes(platform.id);
                        const isDisabled = !isSelected && !isPlatformCompatible(platform.id, post.platforms);
                        return (
                          <PlatformCard
                            key={platform.id}
                            type="button"
                            $selected={isSelected}
                            $color={platform.color}
                            $disabled={isDisabled}
                            onClick={() => !isDisabled && handleTogglePlatform(post.id, platform.id)}
                            title={isDisabled ? `Not compatible with selected platforms` : ''}
                          >
                            {isSelected && (
                              <SelectedBadge $color={platform.color}>
                                <Check />
                              </SelectedBadge>
                            )}
                            <PlatformIconWrapper $selected={isSelected} $color={platform.color}>
                              <Icon />
                            </PlatformIconWrapper>
                            <PlatformName $selected={isSelected} $color={platform.color}>
                              {platform.label}
                            </PlatformName>
                            <PlatformDescription>
                              {PLATFORM_DESCRIPTIONS[platform.id]}
                            </PlatformDescription>
                          </PlatformCard>
                        );
                      })}
                    </PlatformSelector>
                  </FormGroup>

                  {/* Content Type Selection */}
                  {post.platforms.length > 0 && (
                    <FormGroup>
                      <Label>Content Type *</Label>
                      <ContentTypeSelector>
                        {getAvailableContentTypes(post.platforms).map((contentType) => {
                          const Icon = contentType.icon;
                          return (
                            <ContentTypeChip
                              key={contentType.id}
                              type="button"
                              $isSelected={post.contentType === contentType.id}
                              onClick={() => handleContentTypeChange(post.id, contentType.id)}
                            >
                              <Icon />
                              {contentType.label}
                            </ContentTypeChip>
                          );
                        })}
                      </ContentTypeSelector>
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label>Caption *</Label>
                    <TextArea
                      placeholder="Write your post caption..."
                      value={post.caption}
                      onChange={(e) => handleUpdatePost(post.id, 'caption', e.target.value)}
                      rows={4}
                      required
                    />
                  </FormGroup>

                  {/* Platform-specific fields */}
                  {needsHashtags(post.platforms) && (
                    <FormGroup>
                      <Label>
                        <Hash size={16} style={{ display: 'inline', marginRight: '4px' }} />
                        Hashtags (for Instagram & Facebook)
                      </Label>
                      <HashtagInputWrapper>
                        <Input
                          type="text"
                          placeholder="Type hashtag and press Enter or Space..."
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyDown={(e) => handleHashtagKeyDown(post.id, e)}
                        />
                        {parseHashtags(post.hashtags).length > 0 && (
                          <HashtagChipsContainer>
                            {parseHashtags(post.hashtags).map((tag, tagIndex) => (
                              <HashtagChip key={tagIndex}>
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeHashtag(post.id, tag)}
                                >
                                  <X />
                                </button>
                              </HashtagChip>
                            ))}
                          </HashtagChipsContainer>
                        )}
                      </HashtagInputWrapper>
                    </FormGroup>
                  )}

                  <FormGroup>
                    <Label>
                      <ImageIcon size={16} style={{ display: 'inline', marginRight: '4px' }} />
                      Media {post.contentType === 'feed' && '(Carousel: up to 10 images)'}
                    </Label>
                    <MediaUpload>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => handleMediaUpload(post.id, e.target.files)}
                        id={`media-${post.id}`}
                      />
                      <label htmlFor={`media-${post.id}`} style={{ cursor: 'pointer' }}>
                        <Upload style={{ width: '32px', height: '32px', margin: '0 auto 8px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>
                          {post.contentType === 'feed' || post.contentType === 'post'
                            ? 'Click to upload images (multiple for carousel)'
                            : post.contentType === 'story' || post.contentType === 'reel'
                            ? 'Click to upload vertical image/video (9:16)'
                            : 'Click to upload images or videos'}
                        </p>
                      </label>
                    </MediaUpload>

                    {post.media.length > 0 && (
                      <MediaPreview>
                        {post.media.map((media, mediaIndex) => (
                          <MediaItem key={mediaIndex}>
                            {media.type === 'video' ? (
                              <video src={media.preview} />
                            ) : (
                              <img src={media.preview} alt={`Media ${mediaIndex + 1}`} />
                            )}
                            <RemoveMediaButton
                              type="button"
                              onClick={() => handleRemoveMedia(post.id, mediaIndex)}
                            >
                              <X />
                            </RemoveMediaButton>
                          </MediaItem>
                        ))}
                      </MediaPreview>
                    )}
                  </FormGroup>

                  {needsThumbnail(post.platforms) && (
                    <FormGroup>
                      <Label>
                        <FileImage size={16} style={{ display: 'inline', marginRight: '4px' }} />
                        Video Thumbnail (for YouTube & TikTok)
                      </Label>
                      <ThumbnailUpload>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleThumbnailUpload(post.id, e.target.files[0])}
                          id={`thumbnail-${post.id}`}
                        />
                        <label htmlFor={`thumbnail-${post.id}`} style={{ cursor: 'pointer' }}>
                          <Video style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
                          <p style={{ margin: 0, fontSize: '14px' }}>
                            Upload video thumbnail
                          </p>
                        </label>
                      </ThumbnailUpload>

                      {post.videoThumbnail && (
                        <ThumbnailPreview>
                          <img src={post.videoThumbnail.preview} alt="Video thumbnail" />
                          <RemoveMediaButton
                            type="button"
                            onClick={() => handleUpdatePost(post.id, 'videoThumbnail', null)}
                            style={{ top: '8px', right: '8px' }}
                          >
                            <X />
                          </RemoveMediaButton>
                        </ThumbnailPreview>
                      )}
                    </FormGroup>
                  )}

                  <TwoColumnGrid>
                    <FormGroup>
                      <Label>
                        <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} />
                        Scheduled Date (Optional)
                      </Label>
                      <Input
                        type="date"
                        value={post.scheduledDate}
                        onChange={(e) => handleUpdatePost(post.id, 'scheduledDate', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>
                        <Clock size={16} style={{ display: 'inline', marginRight: '4px' }} />
                        Scheduled Time (Optional)
                      </Label>
                      <Input
                        type="time"
                        value={post.scheduledTime}
                        onChange={(e) => handleUpdatePost(post.id, 'scheduledTime', e.target.value)}
                      />
                    </FormGroup>
                  </TwoColumnGrid>
                </PostCard>
              ))}
            </PostsList>
          )}
        </Section>

        {/* Actions */}
        <Actions>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Create Plan
            </Button>
          </div>
        </Actions>
      </Form>
    </Container>
  );
}
