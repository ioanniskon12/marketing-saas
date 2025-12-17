/**
 * Modern Dashboard Page
 *
 * Clean, professional dashboard design matching Owl Marketing style
 */

'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
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
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Bell,
  Target,
  Edit3,
  Search,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { createClient } from '@/lib/supabase/client';
import { PageSpinner } from '@/components/ui';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Layout
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.5s ease;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  background: ${props => props.$positive ? props.theme.colors.success.bg : props.theme.colors.error.bg};
  color: ${props => props.$positive ? props.theme.colors.success.main : props.theme.colors.error.main};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
  letter-spacing: -0.02em;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

// Card Components
const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 16px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.theme.colors.primary.main};
  }
`;

const CardAction = styled(Link)`
  font-size: 13px;
  color: ${props => props.theme.colors.primary.main};
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary.dark};
  }
`;

const CardBody = styled.div`
  padding: 24px;
`;

// Chart Placeholder
const ChartPlaceholder = styled.div`
  height: 240px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.primary.dark});
  opacity: 0.1;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 2s infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70%;
    background: inherit;
    opacity: 0.8;
    clip-path: polygon(0 100%, 5% 70%, 15% 50%, 25% 65%, 35% 30%, 45% 45%, 55% 25%, 65% 40%, 75% 20%, 85% 35%, 95% 15%, 100% 25%, 100% 100%);
  }
`;

const ChartTabs = styled.div`
  display: flex;
  gap: 8px;
`;

const ChartTab = styled.button`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[100]};
  }
`;

// Quick Actions
const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const QuickActionButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background: ${props => props.theme.colors.primary[50]};
    border-color: ${props => props.theme.colors.primary.main};
    transform: translateY(-2px);
  }

  svg {
    width: 28px;
    height: 28px;
    color: ${props => props.theme.colors.primary.main};
  }
`;

const QuickActionLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

// Activity List
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.background.elevated};
  }
`;

const ActivityIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ActivityDesc = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.tertiary};
  white-space: nowrap;
`;

// Upcoming Posts
const PostsList = styled.div`
  padding: 0 24px 24px;
`;

const PostItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PostPlatform = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PostInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PostTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PostStatus = styled.span`
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  text-transform: capitalize;
`;

// TikTok Icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const getPlatformIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <Instagram size={20} />;
    case 'facebook': return <Facebook size={20} />;
    case 'linkedin': return <Linkedin size={20} />;
    case 'twitter': return <Twitter size={20} />;
    case 'youtube': return <Youtube size={20} />;
    case 'tiktok': return <TikTokIcon />;
    default: return <FileText size={20} />;
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
    default: return '#ff8c42';
  }
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activeChartTab, setActiveChartTab] = useState('week');
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    totalEngagement: 0,
    activeAccounts: 0,
    impressions: 0,
    clicks: 0,
  });
  const [upcomingPosts, setUpcomingPosts] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    if (user && currentWorkspace) {
      fetchDashboardData();
    }
  }, [user, currentWorkspace]);

  const fetchDashboardData = async () => {
    try {
      if (!currentWorkspace) return;

      const workspaceId = currentWorkspace.id;

      // Fetch posts count
      let postsCount = 0;
      try {
        const { count } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId);
        postsCount = count || 0;
      } catch (err) {
        console.log('Posts table not available');
      }

      // Fetch scheduled posts count
      let scheduledCount = 0;
      try {
        const { count } = await supabase
          .from('scheduled_posts')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId)
          .eq('status', 'scheduled');
        scheduledCount = count || 0;
      } catch (err) {
        console.log('Scheduled posts table not available');
      }

      // Fetch social accounts
      let socialAccounts = [];
      try {
        const { data } = await supabase
          .from('social_accounts')
          .select('id, platform')
          .eq('workspace_id', workspaceId)
          .eq('is_active', true);
        socialAccounts = data || [];
      } catch (err) {
        console.log('Error fetching social accounts');
      }

      setStats({
        totalPosts: postsCount,
        scheduledPosts: scheduledCount,
        totalEngagement: Math.floor(Math.random() * 10000),
        activeAccounts: socialAccounts.length,
        impressions: Math.floor(Math.random() * 50000),
        clicks: Math.floor(Math.random() * 5000),
      });

      // Fetch upcoming posts
      try {
        const { data: posts } = await supabase
          .from('scheduled_posts')
          .select('id, title, scheduled_for, platforms, status')
          .eq('workspace_id', workspaceId)
          .in('status', ['scheduled', 'draft'])
          .order('scheduled_for', { ascending: true })
          .limit(4);

        if (posts) {
          setUpcomingPosts(posts);
        }
      } catch (err) {
        console.log('Error fetching upcoming posts');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return <PageSpinner label="Loading..." />;
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const statsData = [
    {
      label: 'Total Followers',
      value: '24.8K',
      change: '+12.5%',
      isPositive: true,
      icon: <Users />,
    },
    {
      label: 'Engagement Rate',
      value: '4.2%',
      change: '+8.3%',
      isPositive: true,
      icon: <Heart />,
    },
    {
      label: 'Impressions',
      value: stats.impressions.toLocaleString(),
      change: '+23.1%',
      isPositive: true,
      icon: <Eye />,
    },
    {
      label: 'Post Reach',
      value: '89.2K',
      change: '-2.4%',
      isPositive: false,
      icon: <Target />,
    },
  ];

  const activities = [
    {
      title: 'Post published successfully',
      desc: 'Your Instagram post is now live',
      time: '2 min ago',
      type: 'success',
    },
    {
      title: 'New comment received',
      desc: 'John Doe commented on your post',
      time: '15 min ago',
      type: 'info',
    },
    {
      title: 'Scheduled post ready',
      desc: 'Facebook post scheduled for 3:00 PM',
      time: '1 hour ago',
      type: 'warning',
    },
  ];

  const getActivityStyles = (type) => {
    switch (type) {
      case 'success': return { bg: '#dcfce7', color: '#16a34a' };
      case 'warning': return { bg: '#fef3c7', color: '#d97706' };
      case 'info': return { bg: '#fff5ee', color: '#ff8c42' };
      default: return { bg: '#fff5ee', color: '#ff8c42' };
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Clock />;
      case 'info': return <Bell />;
      default: return <Bell />;
    }
  };

  return (
    <DashboardContainer>
      <ContentGrid>
        <MainContent>
          {/* Stats Grid */}
          <StatsGrid>
            {statsData.map((stat, index) => (
              <StatCard key={index} $delay={`${index * 0.1}s`}>
                <StatHeader>
                  <StatIconWrapper>
                    {stat.icon}
                  </StatIconWrapper>
                  <StatChange $positive={stat.isPositive}>
                    {stat.isPositive ? <TrendingUp /> : <TrendingDown />}
                    {stat.change}
                  </StatChange>
                </StatHeader>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            ))}
          </StatsGrid>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BarChart3 />
                Performance Overview
              </CardTitle>
              <ChartTabs>
                {['week', 'month', 'year'].map((tab) => (
                  <ChartTab
                    key={tab}
                    $active={activeChartTab === tab}
                    onClick={() => setActiveChartTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </ChartTab>
                ))}
              </ChartTabs>
            </CardHeader>
            <CardBody>
              <ChartPlaceholder />
            </CardBody>
          </Card>
        </MainContent>

        <SideContent>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Target />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardBody>
              <QuickActionsGrid>
                <QuickActionButton href="/dashboard/create-post">
                  <Edit3 />
                  <QuickActionLabel>New Post</QuickActionLabel>
                </QuickActionButton>
                <QuickActionButton href="/dashboard/calendar">
                  <Calendar />
                  <QuickActionLabel>Schedule</QuickActionLabel>
                </QuickActionButton>
                <QuickActionButton href="/dashboard/analytics">
                  <BarChart3 />
                  <QuickActionLabel>Analytics</QuickActionLabel>
                </QuickActionButton>
                <QuickActionButton href="/dashboard/library">
                  <Image />
                  <QuickActionLabel>Media</QuickActionLabel>
                </QuickActionButton>
              </QuickActionsGrid>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Bell />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <ActivityList>
              {activities.map((activity, index) => {
                const styles = getActivityStyles(activity.type);
                return (
                  <ActivityItem key={index}>
                    <ActivityIcon $bg={styles.bg} $color={styles.color}>
                      {getActivityIcon(activity.type)}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>{activity.title}</ActivityTitle>
                      <ActivityDesc>{activity.desc}</ActivityDesc>
                    </ActivityContent>
                    <ActivityTime>{activity.time}</ActivityTime>
                  </ActivityItem>
                );
              })}
            </ActivityList>
          </Card>

          {/* Upcoming Posts */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock />
                Upcoming Posts
              </CardTitle>
              <CardAction href="/dashboard/calendar">View All</CardAction>
            </CardHeader>
            <PostsList>
              {upcomingPosts.length > 0 ? (
                upcomingPosts.map((post) => {
                  const platform = post.platforms?.[0];
                  const platformColor = getPlatformColor(platform);
                  return (
                    <PostItem key={post.id}>
                      <PostPlatform $bg={`${platformColor}20`} $color={platformColor}>
                        {getPlatformIcon(platform)}
                      </PostPlatform>
                      <PostInfo>
                        <PostTitle>{post.title || 'Untitled Post'}</PostTitle>
                        <PostMeta>
                          <Clock />
                          {new Date(post.scheduled_for).toLocaleDateString()}
                        </PostMeta>
                      </PostInfo>
                      <PostStatus
                        $bg={post.status === 'scheduled' ? '#dcfce7' : '#fef3c7'}
                        $color={post.status === 'scheduled' ? '#16a34a' : '#d97706'}
                      >
                        {post.status}
                      </PostStatus>
                    </PostItem>
                  );
                })
              ) : (
                <>
                  <PostItem>
                    <PostPlatform $bg="#E4405F20" $color="#E4405F">
                      <Instagram size={20} />
                    </PostPlatform>
                    <PostInfo>
                      <PostTitle>Product Launch Announcement</PostTitle>
                      <PostMeta>
                        <Clock />
                        Today, 3:00 PM
                      </PostMeta>
                    </PostInfo>
                    <PostStatus $bg="#dcfce7" $color="#16a34a">
                      scheduled
                    </PostStatus>
                  </PostItem>
                  <PostItem>
                    <PostPlatform $bg="#1DA1F220" $color="#1DA1F2">
                      <Twitter size={20} />
                    </PostPlatform>
                    <PostInfo>
                      <PostTitle>Weekly Tips Thread</PostTitle>
                      <PostMeta>
                        <Clock />
                        Tomorrow, 10:00 AM
                      </PostMeta>
                    </PostInfo>
                    <PostStatus $bg="#fef3c7" $color="#d97706">
                      draft
                    </PostStatus>
                  </PostItem>
                  <PostItem>
                    <PostPlatform $bg="#1877F220" $color="#1877F2">
                      <Facebook size={20} />
                    </PostPlatform>
                    <PostInfo>
                      <PostTitle>Behind the Scenes</PostTitle>
                      <PostMeta>
                        <Clock />
                        Dec 20, 2:00 PM
                      </PostMeta>
                    </PostInfo>
                    <PostStatus $bg="#dcfce7" $color="#16a34a">
                      scheduled
                    </PostStatus>
                  </PostItem>
                </>
              )}
            </PostsList>
          </Card>
        </SideContent>
      </ContentGrid>
    </DashboardContainer>
  );
}
