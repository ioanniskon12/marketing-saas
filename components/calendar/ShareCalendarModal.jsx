/**
 * Share Calendar Modal Component
 *
 * Two-state modal for creating and sharing calendar links
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Copy, Mail, Check, X } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const ShareCalendarModal = ({ isOpen, onClose, startDate, endDate }) => {
  const { currentWorkspace } = useWorkspace();

  const [formData, setFormData] = useState({
    title: 'Content Calendar',
    description: '',
    startDate: startDate || '',
    endDate: endDate || '',
    permissionLevel: 'view',
    allowDownload: true,
    showAnalytics: false,
    password: '',
    expiresInDays: '',
    brandColor: '#8B5CF6',
    logoUrl: currentWorkspace?.logo_url || '',
    companyName: currentWorkspace?.name || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showToast.error('Title is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      showToast.error('Start and end dates are required');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      showToast.error('End date must be after start date');
      return;
    }

    if (!currentWorkspace) {
      showToast.error('No workspace selected');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare request body
      const body = {
        workspaceId: currentWorkspace.id,
        title: formData.title,
        description: formData.description || null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        permissionLevel: formData.permissionLevel,
        allowDownload: formData.allowDownload,
        showAnalytics: formData.showAnalytics,
        password: formData.password || null,
        expiresInDays: formData.expiresInDays ? parseInt(formData.expiresInDays) : null,
        brandColor: formData.brandColor || '#8B5CF6',
        logoUrl: formData.logoUrl || null,
        companyName: formData.companyName || null,
      };

      const response = await fetch('/api/calendar/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      setShareData(data);
      showToast.success('Share link created successfully!');

    } catch (error) {
      console.error('Error creating share link:', error);
      showToast.error(error.message || 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      showToast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast.error('Failed to copy link');
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Calendar Share: ${formData.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to share our content calendar with you:\n\n${shareData.shareUrl}\n\n` +
      `${formData.description ? `${formData.description}\n\n` : ''}` +
      `${formData.password ? `Password: ${formData.password}\n\n` : ''}` +
      `Best regards`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleReset = () => {
    setShareData(null);
    setFormData({
      title: 'Content Calendar',
      description: '',
      startDate: startDate || '',
      endDate: endDate || '',
      permissionLevel: 'view',
      allowDownload: true,
      showAnalytics: false,
      password: '',
      expiresInDays: '',
      brandColor: '#8B5CF6',
      companyName: '',
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {shareData ? 'Share Link Created' : 'Share Calendar'}
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {!shareData ? (
            // STATE 1: Form
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">
                  Title <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Content Calendar"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add a description for this calendar share..."
                  rows={3}
                />
              </FormGroup>

              <DateRange>
                <FormGroup>
                  <Label htmlFor="startDate">
                    Start Date <Required>*</Required>
                  </Label>
                  <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="endDate">
                    End Date <Required>*</Required>
                  </Label>
                  <Input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </DateRange>

              <FormGroup>
                <Label htmlFor="permissionLevel">Permission Level</Label>
                <Select
                  id="permissionLevel"
                  name="permissionLevel"
                  value={formData.permissionLevel}
                  onChange={handleChange}
                >
                  <option value="view">View Only</option>
                  <option value="comment">View & Comment</option>
                  <option value="approve">View, Comment & Approve</option>
                </Select>
                <HelpText>
                  {formData.permissionLevel === 'view' && 'Viewers can only see posts'}
                  {formData.permissionLevel === 'comment' && 'Viewers can leave feedback on posts'}
                  {formData.permissionLevel === 'approve' && 'Viewers can approve or reject posts'}
                </HelpText>
              </FormGroup>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    name="allowDownload"
                    checked={formData.allowDownload}
                    onChange={handleChange}
                  />
                  <span>Allow downloading as Excel</span>
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    name="showAnalytics"
                    checked={formData.showAnalytics}
                    onChange={handleChange}
                  />
                  <span>Show analytics data</span>
                </CheckboxLabel>
              </CheckboxGroup>

              <FormGroup>
                <Label htmlFor="password">Password Protection (Optional)</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave empty for public access"
                  autoComplete="new-password"
                />
                <HelpText>Viewers will need this password to access the calendar</HelpText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="expiresInDays">Link Expiration</Label>
                <Select
                  id="expiresInDays"
                  name="expiresInDays"
                  value={formData.expiresInDays}
                  onChange={handleChange}
                >
                  <option value="">Never expires</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="brandColor">Brand Color</Label>
                <ColorPickerWrapper>
                  <ColorInput
                    type="color"
                    id="brandColor"
                    name="brandColor"
                    value={formData.brandColor}
                    onChange={handleChange}
                  />
                  <Input
                    type="text"
                    value={formData.brandColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                    placeholder="#8B5CF6"
                    style={{ flex: 1 }}
                  />
                </ColorPickerWrapper>
                <HelpText>Choose a color to customize the shared calendar appearance</HelpText>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company name"
                />
                <HelpText>Will be displayed on the shared calendar page</HelpText>
              </FormGroup>
            </Form>
          ) : (
            // STATE 2: Success
            <SuccessState>
              <SuccessIcon>
                <Check size={48} />
              </SuccessIcon>
              <SuccessMessage>Your calendar share link is ready!</SuccessMessage>
              <SuccessDescription>
                Share this link with your team, clients, or stakeholders to give them access to your content calendar.
              </SuccessDescription>

              <ShareUrlBox>
                <Label>Share Link</Label>
                <UrlInputWrapper>
                  <UrlInput
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                  />
                  <CopyButton onClick={handleCopy} $copied={copied}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </CopyButton>
                </UrlInputWrapper>
              </ShareUrlBox>

              {formData.password && (
                <PasswordBox>
                  <Label>Password</Label>
                  <PasswordDisplay>{formData.password}</PasswordDisplay>
                  <HelpText>Share this password with viewers separately</HelpText>
                </PasswordBox>
              )}

              <ActionButtons>
                <SecondaryButton onClick={handleEmail}>
                  <Mail size={18} />
                  Share via Email
                </SecondaryButton>
                <PrimaryButton onClick={handleReset}>
                  Create Another Link
                </PrimaryButton>
              </ActionButtons>

              <ShareDetails>
                <DetailRow>
                  <DetailLabel>Permission Level:</DetailLabel>
                  <DetailValue>
                    {formData.permissionLevel.charAt(0).toUpperCase() + formData.permissionLevel.slice(1)}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Date Range:</DetailLabel>
                  <DetailValue>
                    {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                  </DetailValue>
                </DetailRow>
                {formData.expiresInDays && (
                  <DetailRow>
                    <DetailLabel>Expires:</DetailLabel>
                    <DetailValue>
                      {new Date(Date.now() + formData.expiresInDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </DetailValue>
                  </DetailRow>
                )}
              </ShareDetails>
            </SuccessState>
          )}
        </ModalBody>

        {!shareData && (
          <ModalFooter>
            <SecondaryButton type="button" onClick={handleClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Share Link'}
            </PrimaryButton>
          </ModalFooter>
        )}
      </ModalContainer>
    </Overlay>
  );
};

// Styled Components

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Required = styled.span`
  color: ${props => props.theme.colors.error || '#ef4444'};
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background};
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const DateRange = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${props => props.theme.colors.primary};
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ColorPickerWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ColorInput = styled.input`
  width: 60px;
  height: 40px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  background: ${props => props.theme.colors.background.paper};

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.backgroundSecondary};
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  background-color: transparent;
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: ${props => props.theme.colors.backgroundSecondary};
  }
`;

// Success State Styles

const SuccessState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.success || '#10b981'}20;
  color: ${props => props.theme.colors.success || '#10b981'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessMessage = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const SuccessDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  max-width: 400px;
`;

const ShareUrlBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
`;

const UrlInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.backgroundSecondary};
`;

const CopyButton = styled.button`
  padding: 10px 16px;
  background-color: ${props => props.$copied ? props.theme.colors.success || '#10b981' : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
  }
`;

const PasswordBox = styled.div`
  width: 100%;
  padding: 16px;
  background-color: ${props => props.theme.colors.warning || '#fbbf24'}20;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.warning || '#fbbf24'};
  text-align: left;
`;

const PasswordDisplay = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  padding: 8px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 4px;
  margin: 8px 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const ShareDetails = styled.div`
  width: 100%;
  padding: 16px;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export default ShareCalendarModal;
