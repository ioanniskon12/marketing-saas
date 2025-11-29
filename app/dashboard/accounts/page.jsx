'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { Instagram, Facebook, Linkedin, Twitter, Music, Youtube, CheckCircle, AlertCircle, Clock, Link2, Unlink, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { PageSpinner } from '@/components/ui';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
`;

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
`;

const AccountCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  padding: 20px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${props => props.theme.colors.border.default};
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    border-color: ${props => props.$color}60;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const PlatformInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const PlatformIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px ${props => props.$color}40;
  overflow: hidden;

  svg {
    width: 24px;
    height: 24px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlatformDetails = styled.div``;

const PlatformName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Username = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    if (props.$status === 'connected') return 'rgba(16, 185, 129, 0.15)';
    if (props.$status === 'error') return 'rgba(239, 68, 68, 0.15)';
    if (props.$status === 'expired') return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(107, 114, 128, 0.15)';
  }};
  color: ${props => {
    if (props.$status === 'connected') return '#10B981';
    if (props.$status === 'error') return '#EF4444';
    if (props.$status === 'expired') return '#F59E0B';
    return '#6B7280';
  }};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const CardBottom = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ConnectButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #3B82F6;
  color: white;

  &:hover {
    background: #2563EB;
    transform: translateY(-1px);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const DisconnectButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border-color: #EF4444;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

// Modal styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 16px;
  padding: 24px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ModalIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ModalBody = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.$variant === 'cancel' && `
    background: ${props.theme.colors.neutral[100]};
    color: ${props.theme.colors.text.secondary};

    &:hover {
      background: ${props.theme.colors.neutral[200]};
    }
  `}

  ${props => props.$variant === 'danger' && `
    background: #EF4444;
    color: white;

    &:hover {
      background: #DC2626;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
  },
  twitter: {
    name: 'Twitter / X',
    icon: Twitter,
    color: '#1DA1F2',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
  },
  tiktok: {
    name: 'TikTok',
    icon: Music,
    color: '#000000',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
  },
};

// All platforms to show
const PLATFORMS_ORDER = ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube'];

export default function AccountsPage() {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disconnectModal, setDisconnectModal] = useState({
    isOpen: false,
    accountId: null,
    platformName: '',
  });
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadAccounts();
    }
  }, [currentWorkspace]);

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const platform = searchParams.get('platform');
    const details = searchParams.get('details');

    if (success === 'account_connected' && platform) {
      showToast.success(`${PLATFORM_CONFIG[platform]?.name || platform} connected successfully!`);
      if (currentWorkspace) {
        loadAccounts();
      }
      window.history.replaceState({}, '', '/dashboard/accounts');
    } else if (error) {
      let errorMessage = 'Failed to connect account';
      if (error === 'connection_failed' && details) {
        errorMessage = `Connection failed: ${decodeURIComponent(details)}`;
      }
      showToast.error(errorMessage);
      window.history.replaceState({}, '', '/dashboard/accounts');
    }
  }, [searchParams, currentWorkspace]);

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

  const handleConnect = (platform) => {
    const existingAccount = accounts.find(acc => acc.platform === platform && acc.is_active);
    if (existingAccount) {
      showToast.error(`You already have a ${PLATFORM_CONFIG[platform].name} account connected.`);
      return;
    }
    window.location.href = `/api/auth/connect/${platform}?workspace_id=${currentWorkspace.id}`;
  };

  const handleDisconnect = (accountId, platformName) => {
    setDisconnectModal({
      isOpen: true,
      accountId,
      platformName,
    });
  };

  const closeDisconnectModal = () => {
    setDisconnectModal({
      isOpen: false,
      accountId: null,
      platformName: '',
    });
  };

  const confirmDisconnect = async () => {
    if (!disconnectModal.accountId) return;

    setDisconnecting(true);
    try {
      const response = await fetch(`/api/social-accounts/${disconnectModal.accountId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect account');
      }

      showToast.success(`${disconnectModal.platformName} disconnected`);
      loadAccounts();
      closeDisconnectModal();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      showToast.error('Failed to disconnect account');
    } finally {
      setDisconnecting(false);
    }
  };

  const getConnectedAccount = (platform) => {
    return accounts.find(account => account.platform === platform && account.is_active) || null;
  };

  const getAccountStatus = (account) => {
    if (!account) return 'not_connected';
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) return 'expired';
    if (account.is_active) return 'connected';
    return 'error';
  };

  const getStatusIcon = (status) => {
    if (status === 'connected') return <CheckCircle />;
    if (status === 'error') return <AlertCircle />;
    if (status === 'expired') return <Clock />;
    return null;
  };

  const getStatusLabel = (status) => {
    if (status === 'connected') return 'Connected';
    if (status === 'error') return 'Error';
    if (status === 'expired') return 'Expired';
    return 'Not Connected';
  };

  const connectedCount = accounts.filter(a => a.is_active).length;

  if (loading) {
    return <PageSpinner />;
  }

  if (!currentWorkspace) {
    return (
      <Container>
        <Header>
          <Title>Connected Accounts</Title>
        </Header>
        <EmptyState>No workspace selected</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Connected Accounts</Title>
        <Subtitle>
          Manage your social media connections
          {connectedCount > 0 && ` · ${connectedCount} connected`}
        </Subtitle>
      </Header>

      <AccountsGrid>
        {PLATFORMS_ORDER.map((platformKey, index) => {
          const config = PLATFORM_CONFIG[platformKey];
          const account = getConnectedAccount(platformKey);
          const status = getAccountStatus(account);
          const isConnected = status === 'connected';
          const Icon = config.icon;

          return (
            <AccountCard
              key={platformKey}
              $color={config.color}
              $delay={`${index * 0.05}s`}
            >
              <CardTop>
                <PlatformInfo>
                  <PlatformIcon $color={config.color}>
                    {account?.platform_profile_picture ? (
                      <img src={account.platform_profile_picture} alt={account.platform_display_name || config.name} />
                    ) : (
                      <Icon />
                    )}
                  </PlatformIcon>
                  <PlatformDetails>
                    <PlatformName>{config.name}</PlatformName>
                    <Username>
                      {account?.platform_display_name || account?.platform_username
                        ? account.platform_display_name || `@${account.platform_username}`
                        : 'Not connected'}
                    </Username>
                  </PlatformDetails>
                </PlatformInfo>

                <StatusChip $status={status}>
                  {getStatusIcon(status)}
                  {getStatusLabel(status)}
                </StatusChip>
              </CardTop>

              <CardBottom>
                {isConnected ? (
                  <DisconnectButton
                    onClick={() => handleDisconnect(account.id, config.name)}
                  >
                    <Unlink />
                    Disconnect
                  </DisconnectButton>
                ) : (
                  <ConnectButton
                    onClick={() => handleConnect(platformKey)}
                  >
                    <Link2 />
                    Connect
                  </ConnectButton>
                )}
              </CardBottom>
            </AccountCard>
          );
        })}
      </AccountsGrid>

      {/* Disconnect Confirmation Modal */}
      {disconnectModal.isOpen && (
        <ModalOverlay onClick={closeDisconnectModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalIconWrapper>
                <AlertTriangle size={22} />
              </ModalIconWrapper>
              <ModalTitle>Disconnect Account</ModalTitle>
            </ModalHeader>
            <ModalBody>
              Are you sure you want to disconnect your {disconnectModal.platformName} account?
              You'll need to reconnect it to post content to this platform.
            </ModalBody>
            <ModalActions>
              <ModalButton $variant="cancel" onClick={closeDisconnectModal}>
                Cancel
              </ModalButton>
              <ModalButton
                $variant="danger"
                onClick={confirmDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
