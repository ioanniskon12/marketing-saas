/**
 * Social Listening Dashboard
 *
 * Monitor brand mentions, hashtags, and keywords across social platforms.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Filter, MessageSquare, Heart, Share2, TrendingUp, Flag, Check } from 'lucide-react';
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

const Controls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const KeywordsList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
`;

const KeywordChip = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary.light};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const MentionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MentionCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => {
    if (props.$flagged) return props.theme.colors.error.main;
    if (props.$sentiment === 'positive') return props.theme.colors.success.main;
    if (props.$sentiment === 'negative') return props.theme.colors.error.main;
    return props.theme.colors.neutral[300];
  }};
  opacity: ${props => props.$read ? 0.7 : 1};
`;

const MentionHeader = styled.div`
  display: flex;
  align-items: start;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$src ? `url(${props.$src})` : props.theme.colors.neutral[200]};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const MentionInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const AuthorMeta = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const MentionActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  background: ${props => props.$active ? props.theme.colors.primary.light : props.theme.colors.neutral[100]};
  color: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary.light};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const MentionContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MentionMetrics = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
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

const KEYWORD_TYPES = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'hashtag', label: 'Hashtag' },
  { value: 'mention', label: 'Mention (@)' },
  { value: 'brand', label: 'Brand Name' },
];

export default function ListeningPage() {
  const { currentWorkspace } = useWorkspace();

  const [mentions, setMentions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingKeyword, setAddingKeyword] = useState(false);

  const [filters, setFilters] = useState({
    platform: '',
    sentiment: '',
    unreadOnly: false,
  });

  const [formData, setFormData] = useState({
    keyword: '',
    type: 'keyword',
    platforms: [],
  });

  useEffect(() => {
    if (currentWorkspace) {
      loadListeningData();
    }
  }, [currentWorkspace, filters]);

  const loadListeningData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        workspace_id: currentWorkspace.id,
        ...filters,
      });

      const response = await fetch(`/api/listening?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load listening data');
      }

      setMentions(data.mentions || []);
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error('Error loading listening data:', error);
      showToast.error(error.message || 'Failed to load listening data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async (e) => {
    e.preventDefault();

    try {
      setAddingKeyword(true);

      const response = await fetch('/api/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: currentWorkspace.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add keyword');
      }

      showToast.success('Keyword added successfully');
      setShowAddModal(false);
      setFormData({ keyword: '', type: 'keyword', platforms: [] });
      loadListeningData();
    } catch (error) {
      console.error('Error adding keyword:', error);
      showToast.error(error.message || 'Failed to add keyword');
    } finally {
      setAddingKeyword(false);
    }
  };

  const handleToggleRead = async (mentionId, currentReadState) => {
    try {
      const response = await fetch('/api/listening', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mention_id: mentionId,
          is_read: !currentReadState,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mention');
      }

      loadListeningData();
    } catch (error) {
      console.error('Error updating mention:', error);
      showToast.error('Failed to update mention');
    }
  };

  const handleToggleFlag = async (mentionId, currentFlagState) => {
    try {
      const response = await fetch('/api/listening', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mention_id: mentionId,
          is_flagged: !currentFlagState,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mention');
      }

      loadListeningData();
    } catch (error) {
      console.error('Error updating mention:', error);
      showToast.error('Failed to update mention');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Social Listening</Title>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowAddModal(true)}
        >
          Add Keyword
        </Button>
      </Header>

      {keywords.length > 0 && (
        <KeywordsList>
          {keywords.map(keyword => (
            <KeywordChip key={keyword.id}>
              {keyword.keyword} ({keyword.type})
            </KeywordChip>
          ))}
        </KeywordsList>
      )}

      <Controls>
        <Select
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          options={[
            { value: '', label: 'All Platforms' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'twitter', label: 'Twitter' },
          ]}
        />

        <Select
          value={filters.sentiment}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          options={[
            { value: '', label: 'All Sentiments' },
            { value: 'positive', label: 'Positive' },
            { value: 'neutral', label: 'Neutral' },
            { value: 'negative', label: 'Negative' },
          ]}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(e) => setFilters({ ...filters, unreadOnly: e.target.checked })}
          />
          Unread only
        </label>
      </Controls>

      {mentions.length === 0 ? (
        <EmptyState>
          <h3>No Mentions Found</h3>
          <p style={{ color: '#6B7280', marginBottom: '16px' }}>
            Add keywords to start tracking mentions
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Add Your First Keyword
          </Button>
        </EmptyState>
      ) : (
        <MentionsList>
          {mentions.map(mention => (
            <MentionCard
              key={mention.id}
              $read={mention.is_read}
              $flagged={mention.is_flagged}
              $sentiment={mention.sentiment}
            >
              <MentionHeader>
                <Avatar $src={mention.author_avatar_url} />
                <MentionInfo>
                  <AuthorName>{mention.author_display_name || mention.author_username}</AuthorName>
                  <AuthorMeta>
                    @{mention.author_username} • {mention.platform} • {formatDate(mention.published_at)}
                  </AuthorMeta>
                </MentionInfo>
                <MentionActions>
                  <ActionButton
                    $active={mention.is_read}
                    onClick={() => handleToggleRead(mention.id, mention.is_read)}
                    title={mention.is_read ? 'Mark as unread' : 'Mark as read'}
                  >
                    <Check size={16} />
                  </ActionButton>
                  <ActionButton
                    $active={mention.is_flagged}
                    onClick={() => handleToggleFlag(mention.id, mention.is_flagged)}
                    title={mention.is_flagged ? 'Unflag' : 'Flag'}
                  >
                    <Flag size={16} />
                  </ActionButton>
                </MentionActions>
              </MentionHeader>

              <MentionContent>{mention.content}</MentionContent>

              <MentionMetrics>
                <Metric>
                  <Heart size={14} />
                  {mention.likes_count || 0}
                </Metric>
                <Metric>
                  <MessageSquare size={14} />
                  {mention.comments_count || 0}
                </Metric>
                <Metric>
                  <Share2 size={14} />
                  {mention.shares_count || 0}
                </Metric>
                {mention.engagement_rate && (
                  <Metric>
                    <TrendingUp size={14} />
                    {mention.engagement_rate}%
                  </Metric>
                )}
              </MentionMetrics>
            </MentionCard>
          ))}
        </MentionsList>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Keyword to Track"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              disabled={addingKeyword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddKeyword}
              loading={addingKeyword}
            >
              Add Keyword
            </Button>
          </>
        }
      >
        <Form onSubmit={handleAddKeyword}>
          <Input
            label="Keyword *"
            value={formData.keyword}
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
            placeholder="your-brand-name"
            required
          />

          <Select
            label="Type *"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={KEYWORD_TYPES}
            required
          />

          <div>
            <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Platforms to Monitor
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {['instagram', 'facebook', 'linkedin', 'twitter'].map(platform => (
                <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          platforms: [...formData.platforms, platform],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          platforms: formData.platforms.filter(p => p !== platform),
                        });
                      }
                    }}
                  />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </Form>
      </Modal>
    </Container>
  );
}
