'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useUser } from '@/lib/supabase/hooks';
import { PageSpinner } from '@/components/ui';
import {
  Users,
  DollarSign,
  AlertCircle,
  Settings,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Activity,
  Clock,
  Key,
  Shield,
  Bell,
  Trash2,
  RefreshCw,
  EyeOff,
  Plus,
  Check,
} from 'lucide-react';

const ADMIN_EMAIL = 'gianniskon12@gmail.com';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  background: ${props => props.theme.colors.background.paper};
  padding: 6px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.theme.colors.border.default};
  overflow-x: auto;

  @media (max-width: 640px) {
    gap: 2px;
    padding: 4px;
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[100]};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  }

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    padding: 10px 14px;
    font-size: 13px;
    gap: 6px;
  }
`;

const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
`;

const AccessDeniedIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
`;

const AccessDeniedTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const AccessDeniedText = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border.default};
  border-top-color: ${props => props.theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ============ OVERVIEW TAB COMPONENTS ============
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bg || '#fff5ee'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || '#ff8c42'};
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  background: ${props => props.$positive ? '#ecfdf5' : '#fef2f2'};
  padding: 4px 8px;
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

// ============ USERS TAB COMPONENTS ============
const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border.default};
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  flex-wrap: wrap;
  gap: 12px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
  min-width: 200px;

  input {
    border: none;
    background: none;
    outline: none;
    font-size: 14px;
    width: 100%;
    color: ${props => props.theme.colors.text.primary};

    &::placeholder {
      color: ${props => props.theme.colors.text.tertiary};
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 24px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${props => props.theme.colors.background.default};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const Td = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const UserInfo = styled.div``;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.$variant) {
      case 'pro': return '#fef3c7';
      case 'starter': return '#fff5ee';
      case 'free': return '#f1f5f9';
      case 'active': return '#ecfdf5';
      case 'inactive': return '#fef2f2';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'pro': return '#d97706';
      case 'starter': return '#ff8c42';
      case 'free': return '#64748b';
      case 'active': return '#059669';
      case 'inactive': return '#dc2626';
      default: return '#64748b';
    }
  }};
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.default};
    color: ${props => props.theme.colors.primary.main};
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

// ============ REVENUE TAB COMPONENTS ============
const RevenueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CardContent = styled.div`
  padding: 24px;
`;

const PlanList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PlanItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PlanBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.border.default};
  border-radius: 4px;
  overflow: hidden;
`;

const PlanProgress = styled.div`
  height: 100%;
  background: ${props => props.$color || props.theme.colors.primary.main};
  border-radius: 4px;
  width: ${props => props.$width}%;
`;

const PlanLabel = styled.div`
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const PlanValue = styled.div`
  min-width: 60px;
  text-align: right;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

// ============ LOGS TAB COMPONENTS ============
const LogItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.default};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const LogType = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$type === 'error' ? '#fef2f2' : '#fefce8'};
  color: ${props => props.$type === 'error' ? '#dc2626' : '#ca8a04'};
`;

const LogTime = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.tertiary};
`;

const LogMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const LogMeta = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const LogStack = styled.pre`
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  color: ${props => props.theme.colors.text.secondary};
  overflow-x: auto;
  white-space: pre-wrap;
`;

// ============ SETTINGS TAB COMPONENTS ============
const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const FeatureInfo = styled.div``;

const FeatureName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
`;

const FeatureDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const Toggle = styled.button`
  width: 48px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.border.default};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: ${props => props.$active ? '24px' : '4px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ApiKeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ApiKeyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 10px;
  gap: 12px;
`;

const ApiKeyInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ApiKeyName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const ApiKeyValue = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ApiKeyStatus = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$configured ? '#10b981' : '#ef4444'};
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.default};
    color: ${props => props.$danger ? '#ef4444' : props.theme.colors.primary.main};
    border-color: ${props => props.$danger ? '#fecaca' : props.theme.colors.primary.main};
  }
`;

const DangerZone = styled.div`
  grid-column: 1 / -1;
`;

const DangerCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  border: 1px solid #fecaca;
  overflow: hidden;
`;

const DangerHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #fecaca;
  background: #fef2f2;
`;

const DangerTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DangerContent = styled.div`
  padding: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: white;
  color: #dc2626;
  border: 1px solid #fecaca;
  transition: all 0.2s ease;

  &:hover {
    background: #fef2f2;
    border-color: #dc2626;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: ${props => props.$primary ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  color: ${props => props.$primary ? 'white' : props.theme.colors.text.secondary};
  border: ${props => props.$primary ? 'none' : `1px solid ${props.theme.colors.border.default}`};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$primary ? props.theme.colors.primary.dark : props.theme.colors.background.default};
  }
`;

// Mock data
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'pro', status: 'active', posts: 156, joined: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'starter', status: 'active', posts: 89, joined: '2024-02-20' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', plan: 'free', status: 'inactive', posts: 12, joined: '2024-03-10' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', plan: 'pro', status: 'active', posts: 234, joined: '2024-01-05' },
  { id: 5, name: 'Alex Brown', email: 'alex@example.com', plan: 'starter', status: 'active', posts: 67, joined: '2024-04-01' },
];

const mockLogs = [
  { id: 1, type: 'error', message: 'Failed to process webhook', meta: 'POST /api/webhooks/stripe', time: '2 minutes ago', stack: 'Error: Invalid signature\n  at verifySignature (stripe.js:45)\n  at processWebhook (webhooks.js:23)' },
  { id: 2, type: 'warning', message: 'Rate limit exceeded for user', meta: 'User ID: usr_abc123', time: '15 minutes ago', stack: null },
  { id: 3, type: 'error', message: 'Database connection timeout', meta: 'Pool exhausted', time: '1 hour ago', stack: 'Error: Connection timeout\n  at Pool.connect (pg.js:123)' },
  { id: 4, type: 'warning', message: 'Slow query detected (>5s)', meta: 'SELECT * FROM posts...', time: '2 hours ago', stack: null },
];

const features = [
  { id: 1, name: 'AI Content Suggestions', description: 'Generate AI-powered post suggestions', enabled: true },
  { id: 2, name: 'Advanced Analytics', description: 'Detailed performance insights', enabled: true },
  { id: 3, name: 'Multi-Language Support', description: 'Support for 25+ languages', enabled: false },
  { id: 4, name: 'Bulk Scheduling', description: 'Schedule up to 100 posts at once', enabled: true },
];

const apiKeys = [
  { name: 'OpenAI', value: 'sk-...8fGx', configured: true },
  { name: 'Meta (Facebook/Instagram)', value: 'EAA...xyz', configured: true },
  { name: 'Twitter/X', value: 'Not configured', configured: false },
  { name: 'Stripe', value: 'sk_live_...abc', configured: true },
];

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);
  const [featureStates, setFeatureStates] = useState(
    features.reduce((acc, f) => ({ ...acc, [f.id]: f.enabled }), {})
  );
  const [showApiKeys, setShowApiKeys] = useState({});

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (loading) {
    return <PageSpinner label="Loading Admin Panel" />;
  }

  if (!isAdmin) {
    return (
      <PageContainer>
        <AccessDenied>
          <AccessDeniedIcon>
            <Shield size={32} />
          </AccessDeniedIcon>
          <AccessDeniedTitle>Access Denied</AccessDeniedTitle>
          <AccessDeniedText>You don't have permission to access the admin panel.</AccessDeniedText>
        </AccessDenied>
      </PageContainer>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'logs', label: 'Logs', icon: AlertCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleFeature = (id) => {
    setFeatureStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleApiKeyVisibility = (name) => {
    setShowApiKeys(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderOverviewTab = () => (
    <>
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon $bg="#fff5ee" $color="#ff8c42">
              <Users size={24} />
            </StatIcon>
            <StatTrend $positive>
              <TrendingUp size={14} />
              +12%
            </StatTrend>
          </StatHeader>
          <StatValue>2,847</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="#ecfdf5" $color="#10b981">
              <DollarSign size={24} />
            </StatIcon>
            <StatTrend $positive>
              <TrendingUp size={14} />
              +8%
            </StatTrend>
          </StatHeader>
          <StatValue>$24,580</StatValue>
          <StatLabel>Monthly Revenue</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="#fef3c7" $color="#f59e0b">
              <Activity size={24} />
            </StatIcon>
            <StatTrend $positive>
              <TrendingUp size={14} />
              +23%
            </StatTrend>
          </StatHeader>
          <StatValue>45,892</StatValue>
          <StatLabel>Posts Created</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="#fef2f2" $color="#ef4444">
              <AlertCircle size={24} />
            </StatIcon>
            <StatTrend>
              <TrendingDown size={14} />
              -5%
            </StatTrend>
          </StatHeader>
          <StatValue>12</StatValue>
          <StatLabel>Active Errors</StatLabel>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <div style={{ padding: '16px 24px' }}>
            {mockUsers.slice(0, 4).map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <UserCell>
                  <UserAvatar>{getInitials(user.name)}</UserAvatar>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserInfo>
                </UserCell>
                <Badge $variant={user.plan}>{user.plan}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
          </CardHeader>
          <div>
            {mockLogs.filter(l => l.type === 'error').slice(0, 3).map(log => (
              <LogItem key={log.id} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                <LogHeader>
                  <LogType $type={log.type}>{log.type}</LogType>
                  <LogTime>{log.time}</LogTime>
                </LogHeader>
                <LogMessage>{log.message}</LogMessage>
                <LogMeta>{log.meta}</LogMeta>
              </LogItem>
            ))}
          </div>
        </Card>
      </ContentGrid>
    </>
  );

  const renderUsersTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <Users size={20} />
          All Users
        </CardTitle>
        <FilterGroup>
          <SearchBar>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          <FilterButton>
            <Filter size={16} />
            Filter
          </FilterButton>
        </FilterGroup>
      </CardHeader>
      <div style={{ overflowX: 'auto' }}>
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Posts</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.filter(u =>
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email.toLowerCase().includes(searchQuery.toLowerCase())
            ).map(user => (
              <tr key={user.id}>
                <Td>
                  <UserCell>
                    <UserAvatar>{getInitials(user.name)}</UserAvatar>
                    <UserInfo>
                      <UserName>{user.name}</UserName>
                      <UserEmail>{user.email}</UserEmail>
                    </UserInfo>
                  </UserCell>
                </Td>
                <Td><Badge $variant={user.plan}>{user.plan}</Badge></Td>
                <Td><Badge $variant={user.status}>{user.status}</Badge></Td>
                <Td>{user.posts}</Td>
                <Td>{user.joined}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ActionButton title="View"><Eye size={16} /></ActionButton>
                    <ActionButton title="Email"><Mail size={16} /></ActionButton>
                    <ActionButton title="More"><MoreVertical size={16} /></ActionButton>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  );

  const renderRevenueTab = () => (
    <>
      <RevenueGrid>
        <StatCard>
          <StatHeader>
            <StatIcon $bg="#ecfdf5" $color="#10b981">
              <DollarSign size={24} />
            </StatIcon>
            <StatTrend $positive>
              <TrendingUp size={14} />
              +8%
            </StatTrend>
          </StatHeader>
          <StatValue>$24,580</StatValue>
          <StatLabel>Monthly Recurring Revenue</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="#fff5ee" $color="#ff8c42">
              <CreditCard size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>$294,960</StatValue>
          <StatLabel>Annual Run Rate</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="#fef3c7" $color="#f59e0b">
              <Users size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>$28.50</StatValue>
          <StatLabel>Avg Revenue Per User</StatLabel>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="#fef2f2" $color="#ef4444">
              <TrendingDown size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>2.3%</StatValue>
          <StatLabel>Monthly Churn Rate</StatLabel>
        </StatCard>
      </RevenueGrid>

      <ContentGrid>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanList>
              <PlanItem>
                <PlanLabel>Pro</PlanLabel>
                <PlanBar>
                  <PlanProgress $width={65} $color="#f59e0b" />
                </PlanBar>
                <PlanValue>$15,980</PlanValue>
              </PlanItem>
              <PlanItem>
                <PlanLabel>Starter</PlanLabel>
                <PlanBar>
                  <PlanProgress $width={30} $color="#ff8c42" />
                </PlanBar>
                <PlanValue>$7,350</PlanValue>
              </PlanItem>
              <PlanItem>
                <PlanLabel>Free</PlanLabel>
                <PlanBar>
                  <PlanProgress $width={5} $color="#94a3b8" />
                </PlanBar>
                <PlanValue>$1,250</PlanValue>
              </PlanItem>
            </PlanList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {[
              { user: 'John Doe', amount: '$29.00', plan: 'Pro', time: '2 hours ago' },
              { user: 'Jane Smith', amount: '$15.00', plan: 'Starter', time: '5 hours ago' },
              { user: 'Mike Johnson', amount: '$29.00', plan: 'Pro', time: '1 day ago' },
            ].map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '2px' }}>{tx.user}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#10b981' }}>{tx.amount}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{tx.plan}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </ContentGrid>
    </>
  );

  const renderLogsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <AlertCircle size={20} />
          System Logs
        </CardTitle>
        <FilterGroup>
          <FilterButton>
            <Filter size={16} />
            All Types
          </FilterButton>
          <FilterButton>
            <Clock size={16} />
            Last 24h
          </FilterButton>
        </FilterGroup>
      </CardHeader>
      <div>
        {mockLogs.map(log => (
          <LogItem key={log.id} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
            <LogHeader>
              <LogType $type={log.type}>{log.type}</LogType>
              <LogTime>{log.time}</LogTime>
              {log.stack && (expandedLog === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </LogHeader>
            <LogMessage>{log.message}</LogMessage>
            <LogMeta>{log.meta}</LogMeta>
            {expandedLog === log.id && log.stack && (
              <LogStack>{log.stack}</LogStack>
            )}
          </LogItem>
        ))}
      </div>
    </Card>
  );

  const renderSettingsTab = () => (
    <SettingsGrid>
      <Card>
        <CardHeader>
          <CardTitle>
            <Settings size={20} />
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureList>
            {features.map((feature) => (
              <FeatureItem key={feature.id}>
                <FeatureInfo>
                  <FeatureName>{feature.name}</FeatureName>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureInfo>
                <Toggle
                  $active={featureStates[feature.id]}
                  onClick={() => toggleFeature(feature.id)}
                />
              </FeatureItem>
            ))}
          </FeatureList>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Key size={20} />
            API Keys & Secrets
          </CardTitle>
          <Button $primary>
            <Plus size={16} />
            Add Key
          </Button>
        </CardHeader>
        <CardContent>
          <ApiKeyList>
            {apiKeys.map((key) => (
              <ApiKeyItem key={key.name}>
                <ApiKeyStatus $configured={key.configured} />
                <ApiKeyInfo>
                  <ApiKeyName>{key.name}</ApiKeyName>
                  <ApiKeyValue>
                    {key.configured ? (showApiKeys[key.name] ? key.value : '••••••••') : key.value}
                  </ApiKeyValue>
                </ApiKeyInfo>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {key.configured && (
                    <IconButton onClick={() => toggleApiKeyVisibility(key.name)}>
                      {showApiKeys[key.name] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  )}
                  <IconButton>
                    <Settings size={16} />
                  </IconButton>
                </div>
              </ApiKeyItem>
            ))}
          </ApiKeyList>
        </CardContent>
      </Card>

      <DangerZone>
        <DangerCard>
          <DangerHeader>
            <DangerTitle>
              <Shield size={20} />
              Danger Zone
            </DangerTitle>
          </DangerHeader>
          <DangerContent>
            <DangerButton>
              <Trash2 size={18} />
              Clear All Logs
            </DangerButton>
            <DangerButton>
              <RefreshCw size={18} />
              Reset Feature Flags
            </DangerButton>
            <DangerButton>
              <Trash2 size={18} />
              Purge All Cache
            </DangerButton>
          </DangerContent>
        </DangerCard>
      </DangerZone>
    </SettingsGrid>
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Admin Panel</PageTitle>
        <PageSubtitle>Manage users, revenue, logs, and system settings</PageSubtitle>
      </PageHeader>

      <TabContainer>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </Tab>
          );
        })}
      </TabContainer>

      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'revenue' && renderRevenueTab()}
      {activeTab === 'logs' && renderLogsTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </PageContainer>
  );
}
