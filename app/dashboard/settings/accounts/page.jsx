/**
 * Connected Accounts Settings Page
 *
 * Manage social media account connections.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button, Card, Modal } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { PLATFORM_CONFIG as CENTRALIZED_PLATFORM_CONFIG } from '@/lib/config/platforms';

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

const Grid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.xl};
`;

const AccountCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 2px solid ${props => props.$isConnected ? props.theme.colors.success.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$color || props.theme.colors.neutral[100]};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AccountInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AccountName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const AccountDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AccountStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$isConnected ? props.theme.colors.success.main : props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ConnectedDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const DetailRow = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};

  strong {
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
  }
`;

const AccountActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

// Map centralized config to accounts page format with descriptions
const PLATFORM_CONFIG = {
  instagram: {
    name: CENTRALIZED_PLATFORM_CONFIG.instagram.name,
    icon: CENTRALIZED_PLATFORM_CONFIG.instagram.icon,
    color: CENTRALIZED_PLATFORM_CONFIG.instagram.color,
    description: 'Connect your Instagram account to schedule posts and view insights.',
  },
  facebook: {
    name: CENTRALIZED_PLATFORM_CONFIG.facebook.name,
    icon: CENTRALIZED_PLATFORM_CONFIG.facebook.icon,
    color: CENTRALIZED_PLATFORM_CONFIG.facebook.color,
    description: 'Connect your Facebook pages to manage posts and analyze performance.',
  },
  linkedin: {
    name: CENTRALIZED_PLATFORM_CONFIG.linkedin.name,
    icon: CENTRALIZED_PLATFORM_CONFIG.linkedin.icon,
    color: CENTRALIZED_PLATFORM_CONFIG.linkedin.color,
    description: 'Connect your LinkedIn profile to share professional content.',
  },
  twitter: {
    name: CENTRALIZED_PLATFORM_CONFIG.twitter.name,
    icon: CENTRALIZED_PLATFORM_CONFIG.twitter.icon,
    color: CENTRALIZED_PLATFORM_CONFIG.twitter.color,
    description: 'Connect your Twitter/X account to share updates and engage with your audience.',
  },
  youtube: {
    name: CENTRALIZED_PLATFORM_CONFIG.youtube.name,
    icon: CENTRALIZED_PLATFORM_CONFIG.youtube.icon,
    color: CENTRALIZED_PLATFORM_CONFIG.youtube.color,
    description: 'Connect your YouTube channel to schedule video posts and track analytics.',
  },
  tiktok: {
    name: CENTRALIZED_PLATFORM_CONFIG.tiktok.name,
    icon: CENTRALIZED_PLATFORM_CONFIG.tiktok.icon,
    color: CENTRALIZED_PLATFORM_CONFIG.tiktok.color,
    description: 'Connect your TikTok account to schedule short-form videos and reach a wider audience.',
  },
};

export default function ConnectedAccountsPage() {
  const { currentWorkspace } = useWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState(null);

  useEffect(() => {
    if (currentWorkspace) {
      loadAccounts();
    }
  }, [currentWorkspace]);

  // Handle OAuth success/error messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'instagram_connected') {
      showToast.success('Instagram account connected successfully!');
      router.replace('/dashboard/settings/accounts');
    } else if (success === 'facebook_connected') {
      showToast.success('Facebook account connected successfully!');
      router.replace('/dashboard/settings/accounts');
    } else if (success === 'linkedin_connected') {
      showToast.success('LinkedIn account connected successfully!');
      router.replace('/dashboard/settings/accounts');
    } else if (error) {
      const errorMessages = {
        unauthorized: 'You must be logged in to connect accounts',
        missing_workspace: 'No workspace selected',
        insufficient_permissions: 'You don\'t have permission to manage accounts',
        oauth_failed: 'OAuth flow failed to start',
        user_denied: 'Account connection was cancelled',
        invalid_callback: 'Invalid OAuth callback',
        invalid_state: 'Invalid OAuth state',
        state_expired: 'OAuth state expired, please try again',
        connection_failed: 'Failed to connect account',
      };
      showToast.error(errorMessages[error] || 'An error occurred');
      router.replace('/dashboard/settings/accounts');
    }
  }, [searchParams]);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      showToast.error('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform) => {
    if (!currentWorkspace) {
      showToast.error('Please select a workspace first');
      return;
    }

    // Redirect to OAuth flow
    window.location.href = `/api/auth/${platform}?workspace_id=${currentWorkspace.id}`;
  };

  const handleDisconnectClick = (account) => {
    setAccountToDisconnect(account);
    setIsDisconnectModalOpen(true);
  };

  const handleDisconnect = async () => {
    if (!accountToDisconnect) return;

    try {
      setDisconnecting(accountToDisconnect.id);

      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', accountToDisconnect.id);

      if (error) throw error;

      showToast.success(`${PLATFORM_CONFIG[accountToDisconnect.platform].name} account disconnected`);
      await loadAccounts();
      setIsDisconnectModalOpen(false);
      setAccountToDisconnect(null);
    } catch (error) {
      console.error('Error disconnecting account:', error);
      showToast.error('Failed to disconnect account');
    } finally {
      setDisconnecting(null);
    }
  };

  const getConnectedAccount = (platform) => {
    return accounts.find(acc => acc.platform === platform);
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const daysUntilExpiry = Math.floor((date - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry === 0) return 'Today';
    if (daysUntilExpiry === 1) return 'Tomorrow';
    if (daysUntilExpiry < 7) return `In ${daysUntilExpiry} days`;
    return date.toLocaleDateString();
  };

  if (!currentWorkspace) {
    return (
      <div>
        <PageTitle>Connected Accounts</PageTitle>
        <EmptyState>No workspace selected</EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageTitle>Connected Accounts</PageTitle>
      <PageSubtitle>
        Connect your social media accounts to schedule posts and analyze performance
      </PageSubtitle>

      {loading ? (
        <EmptyState>Loading accounts...</EmptyState>
      ) : (
        <Grid>
          {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => {
            const Icon = config.icon;
            const connectedAccount = getConnectedAccount(platform);
            const isConnected = !!connectedAccount;

            return (
              <Card key={platform}>
                <AccountCard $isConnected={isConnected}>
                  <IconWrapper $color={config.color}>
                    <Icon size={32} />
                  </IconWrapper>

                  <AccountInfo>
                    <AccountName>{config.name}</AccountName>
                    <AccountDescription>{config.description}</AccountDescription>

                    {isConnected ? (
                      <>
                        <AccountStatus $isConnected={true}>
                          <CheckCircle size={16} />
                          Connected
                        </AccountStatus>

                        <ConnectedDetails>
                          {connectedAccount.username && (
                            <DetailRow>
                              <strong>Username:</strong> @{connectedAccount.username}
                            </DetailRow>
                          )}
                          {connectedAccount.display_name && (
                            <DetailRow>
                              <strong>Name:</strong> {connectedAccount.display_name}
                            </DetailRow>
                          )}
                          {connectedAccount.expires_at && (
                            <DetailRow>
                              <strong>Token expires:</strong> {formatExpiryDate(connectedAccount.expires_at)}
                            </DetailRow>
                          )}
                          <DetailRow>
                            <strong>Connected:</strong> {new Date(connectedAccount.created_at).toLocaleDateString()}
                          </DetailRow>
                        </ConnectedDetails>
                      </>
                    ) : (
                      <AccountStatus $isConnected={false}>
                        <AlertCircle size={16} />
                        Not connected
                      </AccountStatus>
                    )}
                  </AccountInfo>

                  <AccountActions>
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnect(platform)}
                        >
                          <RefreshCw size={16} />
                          Reconnect
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDisconnectClick(connectedAccount)}
                        >
                          <Trash2 size={16} />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleConnect(platform)}
                      >
                        Connect {config.name}
                      </Button>
                    )}
                  </AccountActions>
                </AccountCard>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        title="Disconnect Account"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDisconnectModalOpen(false)}
              disabled={disconnecting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDisconnect}
              loading={disconnecting}
            >
              Disconnect
            </Button>
          </>
        }
      >
        <p style={{ marginBottom: '16px' }}>
          Are you sure you want to disconnect{' '}
          <strong>
            {accountToDisconnect && PLATFORM_CONFIG[accountToDisconnect.platform].name}
          </strong>
          ?
        </p>
        <p style={{ color: '#EF4444' }}>
          You will need to reconnect this account to continue posting to this platform.
        </p>
      </Modal>
    </>
  );
}
