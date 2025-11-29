/**
 * Caption Generator Component
 *
 * AI-powered caption generation using OpenAI GPT-4 with platform-specific prompts.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronUp, Hash, Eye, Lightbulb } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { PLATFORM_CONFIG } from '@/config/platformConfig';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const TitleIcon = styled.div`
  color: ${props => props.theme.colors.primary.main};
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[50]};
  }
`;

const GeneratorContent = styled.div`
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const GenerateButton = styled(Button)`
  width: 100%;
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const CaptionCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.paper};
  border: 2px solid ${props => props.$isSelected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const CaptionText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.sm};
  white-space: pre-wrap;
`;

const CaptionActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[200]};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const HashtagsSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary.light};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const HashtagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const HashtagChip = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.primary.main};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary.main};
    color: white;
  }
`;

const ModeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[100]};
  padding: 4px;
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const ModeButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.$active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary.dark : props.theme.colors.neutral[200]};
    color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  }
`;

const VisualSuggestion = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.success.main}15`};
  border: 2px dashed ${props => props.theme.colors.success.main};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const VisualTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.success.main};
  margin-bottom: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.success.main};
  }
`;

const VisualText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.5;
`;

const AdditionalNotes = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => `${props.theme.colors.info.main}15`};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};

  strong {
    color: ${props => props.theme.colors.info.main};
  }
`;

export default function CaptionGenerator({
  onSelectCaption,
  platforms = [],
  accounts = [],
  imageUrl = null,
  currentContent = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('quick'); // 'quick' or 'platform-specific'
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [numberOfVariations, setNumberOfVariations] = useState(3);
  const [captions, setCaptions] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Platform-specific states
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('post');
  const [platformResults, setPlatformResults] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

  // Get unique platforms from selected accounts
  useEffect(() => {
    if (platforms.length > 0 && accounts.length > 0) {
      const uniquePlatforms = [...new Set(
        platforms
          .map(accountId => {
            const account = accounts.find(a => a.id === accountId);
            return account?.platform;
          })
          .filter(Boolean)
      )];

      setAvailablePlatforms(uniquePlatforms);

      // Auto-select first platform if only one
      if (uniquePlatforms.length === 1) {
        setSelectedPlatform(uniquePlatforms[0]);
      } else if (uniquePlatforms.length > 0 && !selectedPlatform) {
        setSelectedPlatform(uniquePlatforms[0]);
      }
    }
  }, [platforms, accounts]);

  const handleGenerate = async () => {
    if (!prompt.trim() && !imageUrl) {
      showToast.error('Please enter a topic or prompt');
      return;
    }

    if (mode === 'platform-specific' && !selectedPlatform) {
      showToast.error('Please select a platform');
      return;
    }

    try {
      setGenerating(true);
      setCaptions([]);
      setPlatformResults([]);

      if (mode === 'platform-specific') {
        // Use new platform-specific AI generation
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: selectedPlatform,
            postType: selectedPostType,
            topic: prompt,
            tone,
            numberOfVariations,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate content');
        }

        setPlatformResults(data.variations || []);
        showToast.success('Content generated successfully!');
      } else {
        // Use existing quick generation
        const body = imageUrl && !prompt.trim()
          ? {
              type: 'from-image',
              imageUrl,
              platforms,
              tone,
              numberOfVariations,
            }
          : {
              type: 'generate',
              prompt,
              platforms,
              tone,
              includeHashtags,
              includeEmojis,
              numberOfVariations,
            };

        const response = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate captions');
        }

        setCaptions(data.captions || []);
        showToast.success('Captions generated successfully!');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      showToast.error(error.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateHashtags = async () => {
    const content = currentContent || prompt;

    if (!content.trim()) {
      showToast.error('Please enter some content first');
      return;
    }

    try {
      setGeneratingHashtags(true);

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hashtags',
          caption: content,
          platforms,
          numberOfHashtags: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate hashtags');
      }

      setHashtags(data.hashtags || []);
      showToast.success('Hashtags generated successfully!');
    } catch (error) {
      console.error('Error generating hashtags:', error);
      showToast.error(error.message || 'Failed to generate hashtags');
    } finally {
      setGeneratingHashtags(false);
    }
  };

  const handleSelectCaption = (caption) => {
    onSelectCaption?.(caption);
    showToast.success('Caption applied!');
  };

  const handleCopy = async (caption, index) => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      showToast.success('Caption copied to clipboard');
    } catch (error) {
      showToast.error('Failed to copy caption');
    }
  };

  const handleHashtagClick = (hashtag) => {
    const newContent = currentContent + (currentContent ? ' ' : '') + hashtag;
    onSelectCaption?.(newContent);
  };

  // Get available post types for selected platform
  const getPostTypesForPlatform = () => {
    if (!selectedPlatform) return [];
    const platformConfig = PLATFORM_CONFIG[selectedPlatform];
    if (!platformConfig) return [];
    return Object.keys(platformConfig.types).map(key => ({
      value: key,
      label: platformConfig.types[key].name,
    }));
  };

  return (
    <Container>
      <Header>
        <Title>
          <TitleIcon>
            <Sparkles size={20} />
          </TitleIcon>
          AI Content Generator
        </Title>
        <ToggleButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {isOpen ? 'Hide' : 'Show'}
        </ToggleButton>
      </Header>

      <GeneratorContent $isOpen={isOpen}>
        {/* Mode Selector */}
        <ModeSelector>
          <ModeButton
            $active={mode === 'quick'}
            onClick={() => setMode('quick')}
            type="button"
          >
            Quick Generate
          </ModeButton>
          <ModeButton
            $active={mode === 'platform-specific'}
            onClick={() => setMode('platform-specific')}
            type="button"
          >
            Platform-Specific
          </ModeButton>
        </ModeSelector>

        <Form>
          {!imageUrl && (
            <Input
              label={mode === 'platform-specific' ? "Topic" : "What would you like to post about?"}
              placeholder={mode === 'platform-specific' ? "E.g., New product launch" : "E.g., New product launch, team milestone, industry insights..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
            />
          )}

          {imageUrl && mode === 'quick' && (
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              💡 AI will analyze your uploaded image to generate relevant captions
            </div>
          )}

          {/* Platform-Specific Options */}
          {mode === 'platform-specific' && availablePlatforms.length > 0 && (
            <OptionsGrid>
              <Select
                label="Platform"
                value={selectedPlatform}
                onChange={(e) => {
                  setSelectedPlatform(e.target.value);
                  setSelectedPostType('post'); // Reset post type
                }}
                options={availablePlatforms.map(platform => {
                  const config = PLATFORM_CONFIG[platform];
                  return {
                    value: platform,
                    label: config?.name || platform,
                  };
                })}
                disabled={generating}
              />

              <Select
                label="Post Type"
                value={selectedPostType}
                onChange={(e) => setSelectedPostType(e.target.value)}
                options={getPostTypesForPlatform()}
                disabled={generating || !selectedPlatform}
              />
            </OptionsGrid>
          )}

          <OptionsGrid>
            <Select
              label="Tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              options={[
                { value: 'professional', label: 'Professional' },
                { value: 'casual', label: 'Casual' },
                { value: 'funny', label: 'Funny' },
                { value: 'inspirational', label: 'Inspirational' },
                { value: 'educational', label: 'Educational' },
              ]}
              disabled={generating}
            />

            <Select
              label="Variations"
              value={numberOfVariations}
              onChange={(e) => setNumberOfVariations(Number(e.target.value))}
              options={[
                { value: 1, label: '1 Caption' },
                { value: 3, label: '3 Captions' },
                { value: 5, label: '5 Captions' },
              ]}
              disabled={generating}
            />
          </OptionsGrid>

          {mode === 'quick' && (
            <CheckboxGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  disabled={generating}
                />
                Include Hashtags
              </CheckboxLabel>

              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  disabled={generating}
                />
                Include Emojis
              </CheckboxLabel>
            </CheckboxGroup>
          )}

          <GenerateButton
            variant="primary"
            onClick={handleGenerate}
            loading={generating}
            disabled={(!prompt.trim() && !imageUrl) || generating || (mode === 'platform-specific' && !selectedPlatform)}
          >
            <Sparkles size={16} />
            {mode === 'platform-specific' ? 'Generate Content' : 'Generate Captions'}
          </GenerateButton>

          {currentContent && (
            <Button
              variant="outline"
              onClick={handleGenerateHashtags}
              loading={generatingHashtags}
              disabled={generatingHashtags}
            >
              <Hash size={16} />
              Generate Hashtags
            </Button>
          )}
        </Form>

        {/* Quick Mode Results */}
        {mode === 'quick' && captions.length > 0 && (
          <Results>
            {captions.map((caption, index) => (
              <CaptionCard
                key={index}
                onClick={() => handleSelectCaption(caption)}
              >
                <CaptionText>{caption}</CaptionText>
                <CaptionActions>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCaption(caption);
                  }}>
                    Use This Caption
                  </ActionButton>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(caption, index);
                  }}>
                    {copiedIndex === index ? (
                      <>
                        <Check size={12} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </ActionButton>
                </CaptionActions>
              </CaptionCard>
            ))}

            <Button
              variant="outline"
              onClick={handleGenerate}
              loading={generating}
              size="sm"
            >
              <RefreshCw size={14} />
              Generate More
            </Button>
          </Results>
        )}

        {/* Platform-Specific Results */}
        {mode === 'platform-specific' && platformResults.length > 0 && (
          <Results>
            {platformResults.map((result, index) => (
              <CaptionCard
                key={index}
                onClick={() => handleSelectCaption(result.caption)}
              >
                <CaptionText>{result.caption}</CaptionText>

                {/* Visual Suggestion */}
                {result.visualSuggestion && (
                  <VisualSuggestion>
                    <VisualTitle>
                      <Eye size={16} />
                      Visual Suggestion
                    </VisualTitle>
                    <VisualText>{result.visualSuggestion}</VisualText>
                  </VisualSuggestion>
                )}

                {/* Hashtags */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <HashtagsSection style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hash size={14} />
                      Suggested Hashtags
                    </div>
                    <HashtagsGrid>
                      {result.hashtags.map((hashtag, hIndex) => (
                        <HashtagChip
                          key={hIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHashtagClick(hashtag.startsWith('#') ? hashtag : `#${hashtag}`);
                          }}
                        >
                          {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                        </HashtagChip>
                      ))}
                    </HashtagsGrid>
                  </HashtagsSection>
                )}

                {/* Additional Notes */}
                {result.additionalNotes && (
                  <AdditionalNotes>
                    <strong>Tip:</strong> {result.additionalNotes}
                  </AdditionalNotes>
                )}

                <CaptionActions>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCaption(result.caption);
                  }}>
                    Use This Content
                  </ActionButton>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(result.caption, index);
                  }}>
                    {copiedIndex === index ? (
                      <>
                        <Check size={12} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </ActionButton>
                </CaptionActions>
              </CaptionCard>
            ))}

            <Button
              variant="outline"
              onClick={handleGenerate}
              loading={generating}
              size="sm"
            >
              <RefreshCw size={14} />
              Generate More
            </Button>
          </Results>
        )}

        {hashtags.length > 0 && (
          <HashtagsSection>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Suggested Hashtags (click to add)
            </div>
            <HashtagsGrid>
              {hashtags.map((hashtag, index) => (
                <HashtagChip
                  key={index}
                  onClick={() => handleHashtagClick(hashtag)}
                >
                  {hashtag}
                </HashtagChip>
              ))}
            </HashtagsGrid>
          </HashtagsSection>
        )}

        {captions.length === 0 && !generating && isOpen && (
          <EmptyState>
            Enter a prompt and click "Generate Captions" to get AI-powered suggestions
          </EmptyState>
        )}
      </GeneratorContent>
    </Container>
  );
}
