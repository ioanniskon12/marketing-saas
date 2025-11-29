/**
 * Settings Page
 *
 * User profile settings and account management.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Lock, Bell, Shield, CreditCard, Building2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/Toast';

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const PageSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.nav`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  height: fit-content;
`;

const SidebarItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  background: ${props => props.$active ? `${props.theme.colors.primary.main}10` : 'transparent'};
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    background: ${props => props.$active ? `${props.theme.colors.primary.main}10` : props.theme.colors.neutral[100]};
  }

  svg {
    color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  }
`;

const Content = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing['2xl']};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary.main}20`};
  }

  &:disabled {
    background: ${props => props.theme.colors.neutral[100]};
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.$variant === 'outline'
    ? 'transparent'
    : props.theme.colors.primary.main};
  color: ${props => props.$variant === 'outline'
    ? props.theme.colors.primary.main
    : 'white'};
  border: ${props => props.$variant === 'outline'
    ? `2px solid ${props.theme.colors.primary.main}`
    : 'none'};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all ${props => props.theme.transitions.base};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'outline'
      ? `${props.theme.colors.primary.main}10`
      : props.theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const InfoText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
        },
      });

      if (error) throw error;

      // Update user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      showToast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Section>
            <SectionTitle>Profile Information</SectionTitle>
            <Form onSubmit={handleUpdateProfile}>
              <FormGroup>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
                <InfoText>Email cannot be changed. Contact support if you need to update it.</InfoText>
              </FormGroup>

              <ButtonGroup>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  $variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Form>
          </Section>
        );

      case 'security':
        return (
          <Section>
            <SectionTitle>Security Settings</SectionTitle>
            <InfoText style={{ marginBottom: '24px' }}>
              Manage your password and security preferences.
            </InfoText>
            <Button onClick={() => router.push('/forgot-password')}>
              Change Password
            </Button>
          </Section>
        );

      case 'notifications':
        return (
          <Section>
            <SectionTitle>Notification Preferences</SectionTitle>
            <InfoText>
              Notification settings will be available soon. You'll be able to customize
              email and in-app notifications for posts, analytics, and team activities.
            </InfoText>
          </Section>
        );

      case 'billing':
        return (
          <Section>
            <SectionTitle>Billing & Subscription</SectionTitle>
            <InfoText>
              Billing information and subscription management will be available soon.
            </InfoText>
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageTitle>Settings</PageTitle>
      <PageSubtitle>Manage your account settings and preferences</PageSubtitle>

      <SettingsLayout>
          <Sidebar>
            <SidebarItem
              $active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Profile
            </SidebarItem>

            <SidebarItem
              $active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={20} />
              Security
            </SidebarItem>

            <Link href="/dashboard/settings/workspace" style={{ textDecoration: 'none' }}>
              <SidebarItem $active={false}>
                <Building2 size={20} />
                Workspace
              </SidebarItem>
            </Link>

            <SidebarItem
              $active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={20} />
              Notifications
            </SidebarItem>

            <SidebarItem
              $active={activeTab === 'billing'}
              onClick={() => setActiveTab('billing')}
            >
              <CreditCard size={20} />
              Billing
            </SidebarItem>
          </Sidebar>

          <Content>
            {renderContent()}
          </Content>
        </SettingsLayout>
    </>
  );
}
