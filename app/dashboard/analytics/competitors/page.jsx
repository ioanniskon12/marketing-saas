/**
 * Competitor Tracking Dashboard
 *
 * Monitor competitor performance across social platforms.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, TrendingUp, TrendingDown, Users, Eye, Activity, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { showToast } from '@/components/ui/Toast';
import { Button, Modal, Input, Select } from '@/components/ui';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CompetitorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const CompetitorCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  position: relative;
`;

const CompetitorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$src ? `url(${props.$src})` : props.theme.colors.neutral[200]};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.secondary};
`;

const CompetitorInfo = styled.div`
  flex: 1;
`;

const CompetitorName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const CompetitorUsername = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const DeleteButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error.light};
    color: ${props => props.theme.colors.error.main};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const Metric = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const MetricChange = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$positive ? props.theme.colors.success.main : props.theme.colors.error.main};
  display: flex;
  align-items: center;
  gap: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'tiktok', label: 'TikTok' },
];

export default function CompetitorsPage() {
  const { currentWorkspace } = useWorkspace();

  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingCompetitor, setAddingCompetitor] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'instagram',
    platform_username: '',
    profile_url: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (currentWorkspace) {
      loadCompetitors();
    }
  }, [currentWorkspace]);

  const loadCompetitors = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/competitors?workspace_id=${currentWorkspace.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load competitors');
      }

      setCompetitors(data.competitors || []);
    } catch (error) {
      console.error('Error loading competitors:', error);
      showToast.error(error.message || 'Failed to load competitors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (e) => {
    e.preventDefault();

    try {
      setAddingCompetitor(true);

      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: currentWorkspace.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add competitor');
      }

      showToast.success('Competitor added successfully');
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        platform: 'instagram',
        platform_username: '',
        profile_url: '',
        avatar_url: '',
      });
      loadCompetitors();
    } catch (error) {
      console.error('Error adding competitor:', error);
      showToast.error(error.message || 'Failed to add competitor');
    } finally {
      setAddingCompetitor(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId) => {
    if (!confirm('Are you sure you want to remove this competitor?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/competitors?competitor_id=${competitorId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete competitor');
      }

      showToast.success('Competitor removed');
      loadCompetitors();
    } catch (error) {
      console.error('Error deleting competitor:', error);
      showToast.error(error.message || 'Failed to delete competitor');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (loading) {
    return (
      <Container>
        <div>Loading competitors...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Competitor Tracking</Title>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Competitor
        </Button>
      </Header>

      {competitors.length === 0 ? (
        <EmptyState>
          <h3>No Competitors Added</h3>
          <p style={{ color: '#6B7280', marginBottom: '16px' }}>
            Start tracking your competitors to compare performance
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Add Your First Competitor
          </Button>
        </EmptyState>
      ) : (
        <CompetitorsGrid>
          {competitors.map((competitor) => {
            const latest = competitor.latestSnapshot;
            const previous = competitor.previousSnapshot;

            const followersChange = latest && previous
              ? latest.followers_count - previous.followers_count
              : 0;

            return (
              <CompetitorCard key={competitor.id}>
                <DeleteButton
                  onClick={() => handleDeleteCompetitor(competitor.id)}
                  title="Remove competitor"
                >
                  <Trash2 size={16} />
                </DeleteButton>

                <CompetitorHeader>
                  <Avatar $src={competitor.avatar_url}>
                    {!competitor.avatar_url && competitor.name.charAt(0)}
                  </Avatar>
                  <CompetitorInfo>
                    <CompetitorName>{competitor.name}</CompetitorName>
                    <CompetitorUsername>
                      @{competitor.platform_username} • {competitor.platform}
                    </CompetitorUsername>
                  </CompetitorInfo>
                </CompetitorHeader>

                {latest ? (
                  <MetricsGrid>
                    <Metric>
                      <MetricLabel>Followers</MetricLabel>
                      <MetricValue>
                        {formatNumber(latest.followers_count)}
                        {followersChange !== 0 && (
                          <MetricChange $positive={followersChange > 0}>
                            {followersChange > 0 ? (
                              <TrendingUp size={14} />
                            ) : (
                              <TrendingDown size={14} />
                            )}
                            {Math.abs(followersChange)}
                          </MetricChange>
                        )}
                      </MetricValue>
                    </Metric>

                    <Metric>
                      <MetricLabel>Posts</MetricLabel>
                      <MetricValue>
                        {formatNumber(latest.posts_count)}
                      </MetricValue>
                    </Metric>

                    <Metric>
                      <MetricLabel>Avg Engagement</MetricLabel>
                      <MetricValue>
                        {formatNumber(latest.avg_likes)}
                      </MetricValue>
                    </Metric>

                    <Metric>
                      <MetricLabel>Engagement Rate</MetricLabel>
                      <MetricValue>
                        {latest.avg_engagement_rate?.toFixed(2)}%
                      </MetricValue>
                    </Metric>
                  </MetricsGrid>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#6B7280' }}>
                    No data collected yet
                  </div>
                )}
              </CompetitorCard>
            );
          })}
        </CompetitorsGrid>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Competitor"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              disabled={addingCompetitor}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCompetitor}
              loading={addingCompetitor}
            >
              Add Competitor
            </Button>
          </>
        }
      >
        <Form onSubmit={handleAddCompetitor}>
          <Input
            label="Competitor Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Corp"
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Main competitor in..."
          />

          <Select
            label="Platform *"
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            options={PLATFORMS}
            required
          />

          <Input
            label="Username *"
            value={formData.platform_username}
            onChange={(e) => setFormData({ ...formData, platform_username: e.target.value })}
            placeholder="competitor_username"
            required
          />

          <Input
            label="Profile URL"
            value={formData.profile_url}
            onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
            placeholder="https://instagram.com/competitor_username"
          />

          <Input
            label="Avatar URL"
            value={formData.avatar_url}
            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />
        </Form>
      </Modal>
    </Container>
  );
}
