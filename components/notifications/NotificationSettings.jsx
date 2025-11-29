'use client';

import { useNotifications } from '@/hooks/useNotifications';
import styled from 'styled-components';
import { Bell, BellOff, Check, X } from 'lucide-react';

export default function NotificationSettings() {
  const { permission, enabled, toggleNotifications } = useNotifications();

  const getStatusText = () => {
    if (permission === 'denied') {
      return 'Blocked - Enable in browser settings';
    }
    if (enabled) {
      return 'Enabled - You\'ll receive browser notifications for new feedback';
    }
    return 'Disabled - Click to enable notifications';
  };

  const getStatusColor = () => {
    if (permission === 'denied') return '#ef4444';
    if (enabled) return '#10b981';
    return '#9ca3af';
  };

  return (
    <Container>
      <SettingsCard>
        <CardHeader>
          <IconWrapper $color={getStatusColor()}>
            {enabled ? <Bell size={20} /> : <BellOff size={20} />}
          </IconWrapper>
          <HeaderText>
            <Title>Real-time Notifications</Title>
            <Subtitle>{getStatusText()}</Subtitle>
          </HeaderText>
        </CardHeader>

        <CardBody>
          <Description>
            Get instant browser notifications when clients comment, approve, or request changes on your shared plans.
          </Description>

          {permission !== 'denied' && (
            <ToggleButton
              onClick={toggleNotifications}
              $enabled={enabled}
            >
              {enabled ? (
                <>
                  <Check size={16} />
                  Notifications Enabled
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Enable Notifications
                </>
              )}
            </ToggleButton>
          )}

          {permission === 'denied' && (
            <WarningBox>
              <X size={16} />
              <WarningText>
                Notifications are blocked. To enable them, please allow notifications for this site in your browser settings.
              </WarningText>
            </WarningBox>
          )}
        </CardBody>
      </SettingsCard>

      {enabled && (
        <InfoBox>
          <InfoTitle>How it works:</InfoTitle>
          <InfoList>
            <li>We check for new feedback every 30 seconds</li>
            <li>You'll see a browser notification when new activity is detected</li>
            <li>Click the notification to view the feedback</li>
            <li>Notifications work even when the tab is in the background</li>
          </InfoList>
        </InfoBox>
      )}
    </Container>
  );
}

// Styled Components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SettingsCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0 0 16px 0;
`;

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid ${props => props.$enabled
    ? props.theme.colors.primary.main
    : props.theme.colors.border.default};
  background: ${props => props.$enabled
    ? props.theme.colors.primary.main
    : props.theme.colors.background.paper};
  color: ${props => props.$enabled
    ? 'white'
    : props.theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$enabled
      ? props.theme.colors.primary.dark
      : props.theme.colors.background.hover};
    transform: translateY(-1px);
  }

  svg {
    flex-shrink: 0;
  }
`;

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
`;

const WarningText = styled.p`
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
`;

const InfoBox = styled.div`
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
`;

const InfoTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(139, 92, 246, 1);
  margin: 0 0 12px 0;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: start;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 0.875rem;
    color: ${props => props.theme.colors.text.secondary};
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    &:before {
      content: '•';
      color: rgba(139, 92, 246, 1);
      font-weight: bold;
      flex-shrink: 0;
    }
  }
`;
