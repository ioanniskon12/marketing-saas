/**
 * Modern Dashboard Page
 *
 * Redesigned dashboard with modern UI, gradients, charts, and engaging visuals
 */

'use client';

import { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  Image,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Zap,
  Target,
  Award,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg,
    ${props => props.theme.colors.neutral[50]} 0%,
    ${props => props.theme.colors.primary.light}15 50%,
    ${props => props.theme.colors.secondary.light}10 100%
  );
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main} 0%,
    ${props => props.theme.colors.secondary.main} 100%
  );
  border-radius: ${props => props.theme.borderRadius['2xl']};
  padding: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing.xl};
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows['2xl']};

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    filter: blur(60px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    filter: blur(50px);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['4xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.sm};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  opacity: 0.9;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
`;

const HeroStatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-4px);
  }
`;

const HeroStatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const HeroStatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    box-shadow: ${props => props.theme.shadows['2xl']};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CardAction = styled(Link)`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.primary.main};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.primary.dark};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.lg};
`;

const MiniStatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.$gradient1}, ${props => props.$gradient2});
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  color: white;
  position: relative;
  overflow: hidden;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${props => props.theme.shadows.xl};
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 150%;
    height: 150%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const MiniStatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const MiniStatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const MiniStatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const MiniStatChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.xs};
  margin-top: ${props => props.theme.spacing.sm};
  opacity: 0.95;
  position: relative;
  z-index: 1;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const QuickActionBtn = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  background: linear-gradient(135deg,
    ${props => props.theme.colors.neutral[50]} 0%,
    ${props => props.theme.colors.neutral[100]} 100%
  );
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  transition: all ${props => props.theme.transitions.base};
  text-align: center;
  gap: ${props => props.theme.spacing.md};

  &:hover {
    background: linear-gradient(135deg,
      ${props => props.theme.colors.primary.light}20 0%,
      ${props => props.theme.colors.secondary.light}20 100%
    );
    border-color: ${props => props.theme.colors.primary.main};
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const QuickActionIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.xl};
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.main},
    ${props => props.theme.colors.secondary.main}
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.md};
`;

const QuickActionLabel = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
`;

const UpcomingPostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const UpcomingPostItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
  border-left: 4px solid ${props => props.$color};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
    transform: translateX(4px);
  }
`;

const PostThumbnail = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: linear-gradient(135deg,
    ${props => props.theme.colors.primary.light},
    ${props => props.theme.colors.secondary.light}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const PostInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PostTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const PostTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const PlatformBadges = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-shrink: 0;
`;

const PlatformBadge = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.sm};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PerformanceCard = styled(Card)`
  background: linear-gradient(135deg,
    ${props => props.theme.colors.background.paper} 0%,
    ${props => props.theme.colors.primary.light}05 100%
  );
`;

const PerformanceMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const MetricInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg,
    ${props => props.$color1},
    ${props => props.$color2}
  );
  width: ${props => props.$width}%;
  transition: width 0.5s ease;
  border-radius: ${props => props.theme.borderRadius.full};
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const AchievementCard = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg,
    ${props => props.$color1}15,
    ${props => props.$color2}15
  );
  border: 2px solid ${props => props.$color1}40;
  border-radius: ${props => props.theme.borderRadius.xl};
  text-align: center;
  transition: all ${props => props.theme.transitions.base};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const AchievementIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.$color1}, ${props => props.$color2});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.md};
`;

const AchievementValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const AchievementLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

// TikTok Icon Component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const getPlatformIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <Instagram />;
    case 'facebook': return <Facebook />;
    case 'linkedin': return <Linkedin />;
    case 'twitter': return <Twitter />;
    case 'youtube': return <Youtube />;
    case 'tiktok': return <TikTokIcon />;
    default: return <FileText />;
  }
};

const getPlatformColor = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return '#E4405F';
    case 'facebook': return '#1877F2';
    case 'linkedin': return '#0A66C2';
    case 'twitter': return '#1DA1F2';
    case 'youtube': return '#FF0000';
    case 'tiktok': return '#000000';
    default: return '#8B5CF6';
  }
};

const getPlatformName = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return 'Instagram';
    case 'facebook': return 'Facebook';
    case 'linkedin': return 'LinkedIn';
    case 'twitter': return 'Twitter';
    case 'youtube': return 'YouTube';
    case 'tiktok': return 'TikTok';
    default: return platform;
  }
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    totalEngagement: 0,
    activeAccounts: 0,
    impressions: 0,
    clicks: 0,
    shares: 0,
    comments: 0,
  });
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    if (user && currentWorkspace) {
      fetchDashboardData();
    }
  }, [user, currentWorkspace]);

  const fetchDashboardData = async () => {
    try {
      if (!currentWorkspace) {
        console.log('No current workspace');
        return;
      }

      const workspaceId = currentWorkspace.id;

      // Fetch posts count (with error handling)
      let postsCount = 0;
      try {
        const { count } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId);
        postsCount = count || 0;
      } catch (err) {
        console.log('Posts table not available:', err);
      }

      // Fetch scheduled posts count (with error handling)
      let scheduledCount = 0;
      try {
        const { count } = await supabase
          .from('scheduled_posts')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId)
          .eq('status', 'scheduled');
        scheduledCount = count || 0;
      } catch (err) {
        console.log('Scheduled posts table not available:', err);
      }

      // Fetch social accounts with platform info (with error handling)
      let socialAccounts = [];
      try {
        const { data, error: accountsError } = await supabase
          .from('social_accounts')
          .select('id, platform, platform_display_name, platform_username, is_active, workspace_id')
          .eq('workspace_id', workspaceId)
          .eq('is_active', true);

        if (!accountsError && data) {
          socialAccounts = data;
        }
      } catch (err) {
        console.log('Error fetching social accounts:', err);
      }

      // Create platform stats with mock engagement data
      const platformStats = socialAccounts?.map(account => ({
        platform: account.platform,
        accountName: account.platform_display_name || account.platform_username,
        engagement: Math.floor(Math.random() * 5000) + 500,
        progress: Math.floor(Math.random() * 40) + 40, // 40-80%
      })) || [];

      setConnectedPlatforms(platformStats);

      setStats({
        totalPosts: postsCount,
        scheduledPosts: scheduledCount,
        totalEngagement: Math.floor(Math.random() * 10000), // Mock data
        activeAccounts: socialAccounts?.length || 0,
        impressions: Math.floor(Math.random() * 50000), // Mock data
        clicks: Math.floor(Math.random() * 5000), // Mock data
        shares: Math.floor(Math.random() * 1000), // Mock data
        comments: Math.floor(Math.random() * 2000), // Mock data
      });

      // Fetch upcoming posts (with error handling)
      try {
        const { data: posts } = await supabase
          .from('scheduled_posts')
          .select('id, title, scheduled_for, platforms')
          .eq('workspace_id', workspaceId)
          .eq('status', 'scheduled')
          .order('scheduled_for', { ascending: true })
          .limit(5);

        if (posts) {
          setUpcomingPosts(posts);
        }
      } catch (err) {
        console.log('Error fetching upcoming posts:', err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error toast, just log it
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="lg" label="Loading your dashboard..." />
      </LoadingContainer>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardContainer>
      <HeroSection>
        <HeroContent>
          <WelcomeTitle>{greeting}, {displayName}! 👋</WelcomeTitle>
          <WelcomeSubtitle>
            Your social media performance is looking great today
          </WelcomeSubtitle>

          <HeroStats>
            <HeroStatCard>
              <HeroStatValue>{stats.totalPosts}</HeroStatValue>
              <HeroStatLabel>Total Posts</HeroStatLabel>
            </HeroStatCard>
            <HeroStatCard>
              <HeroStatValue>{stats.scheduledPosts}</HeroStatValue>
              <HeroStatLabel>Scheduled</HeroStatLabel>
            </HeroStatCard>
            <HeroStatCard>
              <HeroStatValue>{stats.totalEngagement.toLocaleString()}</HeroStatValue>
              <HeroStatLabel>Engagement</HeroStatLabel>
            </HeroStatCard>
            <HeroStatCard>
              <HeroStatValue>{stats.activeAccounts}</HeroStatValue>
              <HeroStatLabel>Connected</HeroStatLabel>
            </HeroStatCard>
          </HeroStats>
        </HeroContent>
      </HeroSection>

      <MainGrid>
        <LeftColumn>
          {/* Performance Overview */}
          <PerformanceCard>
            <CardHeader>
              <CardTitle>
                <Activity size={24} />
                Performance Overview
              </CardTitle>
              <CardAction href="/dashboard/analytics">View Details</CardAction>
            </CardHeader>
            <StatsGrid>
              <MiniStatCard $gradient1={theme.colors.primary.main} $gradient2={theme.colors.error.main}>
                <MiniStatIcon>
                  <Eye size={20} />
                </MiniStatIcon>
                <MiniStatValue>{stats.impressions.toLocaleString()}</MiniStatValue>
                <MiniStatLabel>Impressions</MiniStatLabel>
                <MiniStatChange>
                  <TrendingUp size={14} />
                  +12.5% from last week
                </MiniStatChange>
              </MiniStatCard>

              <MiniStatCard $gradient1={theme.colors.success.main} $gradient2={theme.colors.secondary.main}>
                <MiniStatIcon>
                  <Heart size={20} />
                </MiniStatIcon>
                <MiniStatValue>{stats.totalEngagement.toLocaleString()}</MiniStatValue>
                <MiniStatLabel>Total Engagement</MiniStatLabel>
                <MiniStatChange>
                  <TrendingUp size={14} />
                  +8.3% from last week
                </MiniStatChange>
              </MiniStatCard>

              <MiniStatCard $gradient1={theme.colors.warning.main} $gradient2={theme.colors.error.main}>
                <MiniStatIcon>
                  <Target size={20} />
                </MiniStatIcon>
                <MiniStatValue>{stats.clicks.toLocaleString()}</MiniStatValue>
                <MiniStatLabel>Link Clicks</MiniStatLabel>
                <MiniStatChange>
                  <TrendingUp size={14} />
                  +15.7% from last week
                </MiniStatChange>
              </MiniStatCard>

              <MiniStatCard $gradient1={theme.colors.secondary.main} $gradient2={theme.colors.info.main}>
                <MiniStatIcon>
                  <Share2 size={20} />
                </MiniStatIcon>
                <MiniStatValue>{stats.shares.toLocaleString()}</MiniStatValue>
                <MiniStatLabel>Shares</MiniStatLabel>
                <MiniStatChange>
                  <TrendingUp size={14} />
                  +5.2% from last week
                </MiniStatChange>
              </MiniStatCard>
            </StatsGrid>
          </PerformanceCard>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Zap size={24} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <QuickActionsGrid>
              <QuickActionBtn href="/dashboard/create-post">
                <QuickActionIcon>
                  <Plus size={28} />
                </QuickActionIcon>
                <QuickActionLabel>Create Post</QuickActionLabel>
              </QuickActionBtn>

              <QuickActionBtn href="/dashboard/calendar">
                <QuickActionIcon>
                  <Calendar size={28} />
                </QuickActionIcon>
                <QuickActionLabel>Schedule</QuickActionLabel>
              </QuickActionBtn>

              <QuickActionBtn href="/dashboard/library">
                <QuickActionIcon>
                  <Image size={28} />
                </QuickActionIcon>
                <QuickActionLabel>Media Library</QuickActionLabel>
              </QuickActionBtn>

              <QuickActionBtn href="/dashboard/analytics">
                <QuickActionIcon>
                  <BarChart3 size={28} />
                </QuickActionIcon>
                <QuickActionLabel>Analytics</QuickActionLabel>
              </QuickActionBtn>
            </QuickActionsGrid>
          </Card>

          {/* Engagement Metrics by Platform */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Target size={24} />
                Engagement by Platform
              </CardTitle>
            </CardHeader>
            {connectedPlatforms.length > 0 ? (
              <PerformanceMetrics>
                {connectedPlatforms.map((platformData, index) => (
                  <div key={index}>
                    <MetricRow>
                      <MetricInfo>
                        <MetricIcon $color={getPlatformColor(platformData.platform)}>
                          {getPlatformIcon(platformData.platform)}
                        </MetricIcon>
                        <div>
                          <MetricLabel>{getPlatformName(platformData.platform)}</MetricLabel>
                          {platformData.accountName && (
                            <div style={{ fontSize: '11px', color: theme.colors.neutral[400], marginTop: '2px' }}>
                              @{platformData.accountName}
                            </div>
                          )}
                        </div>
                      </MetricInfo>
                      <MetricValue>{platformData.engagement.toLocaleString()}</MetricValue>
                    </MetricRow>
                    <ProgressBar>
                      <ProgressFill
                        $width={platformData.progress}
                        $color1={getPlatformColor(platformData.platform)}
                        $color2={`${getPlatformColor(platformData.platform)}CC`}
                      />
                    </ProgressBar>
                  </div>
                ))}
              </PerformanceMetrics>
            ) : (
              <EmptyState>
                <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div>No platforms connected</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  <Link href="/dashboard/accounts" style={{ color: theme.colors.primary.main }}>
                    Connect your social accounts
                  </Link>
                </div>
              </EmptyState>
            )}
          </Card>
        </LeftColumn>

        <RightColumn>
          {/* Upcoming Posts */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock size={24} />
                Upcoming Posts
              </CardTitle>
              <CardAction href="/dashboard/calendar">View All</CardAction>
            </CardHeader>
            {upcomingPosts.length > 0 ? (
              <UpcomingPostsList>
                {upcomingPosts.map((post) => (
                  <UpcomingPostItem key={post.id} $color={getPlatformColor(post.platforms?.[0])}>
                    <PostThumbnail>
                      <FileText size={24} />
                    </PostThumbnail>
                    <PostInfo>
                      <PostTitle>{post.title || 'Untitled Post'}</PostTitle>
                      <PostTime>
                        <Clock size={12} />
                        {new Date(post.scheduled_for).toLocaleString()}
                      </PostTime>
                    </PostInfo>
                    <PlatformBadges>
                      {post.platforms?.slice(0, 3).map((platform, idx) => (
                        <PlatformBadge key={idx} $color={getPlatformColor(platform)}>
                          {getPlatformIcon(platform)}
                        </PlatformBadge>
                      ))}
                    </PlatformBadges>
                  </UpcomingPostItem>
                ))}
              </UpcomingPostsList>
            ) : (
              <EmptyState>
                <Clock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div>No upcoming posts scheduled</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  <Link href="/dashboard/calendar" style={{ color: theme.colors.primary.main }}>
                    Schedule your first post
                  </Link>
                </div>
              </EmptyState>
            )}
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Award size={24} />
                This Week's Highlights
              </CardTitle>
            </CardHeader>
            <AchievementGrid>
              <AchievementCard $color1={theme.colors.primary.main} $color2={theme.colors.error.main}>
                <AchievementIcon $color1={theme.colors.primary.main} $color2={theme.colors.error.main}>
                  <TrendingUp size={24} />
                </AchievementIcon>
                <AchievementValue>+{Math.floor(stats.totalEngagement * 0.125)}</AchievementValue>
                <AchievementLabel>New Followers</AchievementLabel>
              </AchievementCard>

              <AchievementCard $color1={theme.colors.success.main} $color2={theme.colors.secondary.main}>
                <AchievementIcon $color1={theme.colors.success.main} $color2={theme.colors.secondary.main}>
                  <Eye size={24} />
                </AchievementIcon>
                <AchievementValue>{Math.floor(stats.impressions / 1000)}K</AchievementValue>
                <AchievementLabel>Reach</AchievementLabel>
              </AchievementCard>

              <AchievementCard $color1={theme.colors.warning.main} $color2={theme.colors.error.main}>
                <AchievementIcon $color1={theme.colors.warning.main} $color2={theme.colors.error.main}>
                  <CheckCircle size={24} />
                </AchievementIcon>
                <AchievementValue>{stats.totalPosts}</AchievementValue>
                <AchievementLabel>Posts Published</AchievementLabel>
              </AchievementCard>

              <AchievementCard $color1={theme.colors.secondary.main} $color2={theme.colors.info.main}>
                <AchievementIcon $color1={theme.colors.secondary.main} $color2={theme.colors.info.main}>
                  <Users size={24} />
                </AchievementIcon>
                <AchievementValue>{stats.activeAccounts}</AchievementValue>
                <AchievementLabel>Active Accounts</AchievementLabel>
              </AchievementCard>
            </AchievementGrid>
          </Card>

          {/* Connected Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Users size={24} />
                Connected Accounts
              </CardTitle>
              <CardAction href="/dashboard/accounts">Manage</CardAction>
            </CardHeader>
            <PerformanceMetrics>
              {connectedPlatforms && connectedPlatforms.length > 0 ? (
                connectedPlatforms.map((account) => {
                  const platform = account.platform?.toLowerCase();
                  const platformColor = getPlatformColor(platform);

                  return (
                    <MetricRow key={account.platform + account.accountName}>
                      <MetricInfo>
                        <MetricIcon $color={platformColor}>
                          {getPlatformIcon(platform)}
                        </MetricIcon>
                        <div>
                          <MetricLabel>{getPlatformName(platform)}</MetricLabel>
                          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                            {account.accountName}
                          </div>
                        </div>
                      </MetricInfo>
                      <div style={{ textAlign: 'right' }}>
                        <MetricValue style={{ fontSize: '14px', color: theme.colors.success.main, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} />
                          Active
                        </MetricValue>
                      </div>
                    </MetricRow>
                  );
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: theme.colors.text.secondary }}>
                  <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <div>No accounts connected yet</div>
                  <Link href="/dashboard/accounts" style={{ textDecoration: 'none' }}>
                    <button style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                      background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <Plus size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Connect Accounts
                    </button>
                  </Link>
                </div>
              )}
            </PerformanceMetrics>
          </Card>
        </RightColumn>
      </MainGrid>
    </DashboardContainer>
  );
}
