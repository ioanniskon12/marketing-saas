/**
 * Workspace Settings Page
 *
 * Manage workspace details and team members.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Settings, Trash2, UserPlus, Mail, Shield, ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button, Input, Select, Modal, Card } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { ROLE_NAMES, ROLE_DESCRIPTIONS, ROLE_COLORS, hasPermission } from '@/lib/permissions/rbac';

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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-wrap: wrap;
  }
`;

const MemberAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$color || props.theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.lg};
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MemberEmail = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoleBadge = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$color ? `${props.$color}20` : props.theme.colors.neutral[100]};
  color: ${props => props.$color || props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
`;

const MemberActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  transition: all ${props => props.theme.transitions.fast};
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.colors.primary.main};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ModalContent = styled.div`
  min-height: 200px;
`;

const LogoPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.neutral[50]};
`;

const LogoPreview = styled.img`
  width: ${props => {
    if (props.$size === 'small') return '40px';
    if (props.$size === 'large') return '80px';
    return '60px'; // medium
  }};
  height: ${props => {
    if (props.$size === 'small') return '40px';
    if (props.$size === 'large') return '80px';
    return '60px'; // medium
  }};
  object-fit: contain;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const LogoPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.paper};
  border: 2px dashed ${props => props.theme.colors.neutral[300]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  padding: ${props => props.theme.spacing.xs};
`;

export default function WorkspaceSettingsPage() {
  const { user } = useAuth();
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const router = useRouter();

  const [workspaceName, setWorkspaceName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState('medium');
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const fileInputRef = useRef(null);

  // Add member modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');
  const [addingMember, setAddingMember] = useState(false);

  // Delete workspace modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name);
      setLogoUrl(currentWorkspace.logo_url || '');
      setLogoSize(currentWorkspace.logo_size || 'medium');
      loadMembers();
    }
  }, [currentWorkspace]);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMembers(data.members || []);
    } catch (error) {
      console.error('Error loading members:', error);
      showToast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();

    try {
      setSavingWorkspace(true);

      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName,
          logo_url: logoUrl,
          logo_size: logoSize
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      showToast.success('Workspace updated successfully');
      await refreshWorkspaces();
    } catch (error) {
      console.error('Error updating workspace:', error);
      showToast.error(error.message || 'Failed to update workspace');
    } finally {
      setSavingWorkspace(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      setAddingMember(true);

      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      showToast.success('Team member added successfully');
      setIsAddMemberModalOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('viewer');
      await loadMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      showToast.error(error.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      const response = await fetch(
        `/api/workspaces/${currentWorkspace.id}/members/${userId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      showToast.success('Role updated successfully');
      await loadMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      showToast.error(error.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `/api/workspaces/${currentWorkspace.id}/members/${userId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      showToast.success('Team member removed');
      await loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      showToast.error(error.message || 'Failed to remove member');
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      setDeletingWorkspace(true);

      const response = await fetch(`/api/workspaces/${currentWorkspace.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      showToast.success('Workspace deleted successfully');
      await refreshWorkspaces();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      showToast.error(error.message || 'Failed to delete workspace');
    } finally {
      setDeletingWorkspace(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        showToast.error('Please upload a JPG, PNG, WEBP, or SVG image');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast.error('File size too large. Maximum size is 5MB');
        return;
      }

      setLogoFile(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append('file', logoFile);

      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/logo`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setLogoUrl(data.logo_url);
      setLogoFile(null);
      showToast.success('Logo uploaded successfully');
      await refreshWorkspaces();
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) return;

    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/logo`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setLogoUrl('');
      showToast.success('Logo removed successfully');
      await refreshWorkspaces();
    } catch (error) {
      console.error('Error removing logo:', error);
      showToast.error(error.message || 'Failed to remove logo');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canManageWorkspace = hasPermission(currentWorkspace?.role, 'workspace:update');
  const canManageMembers = hasPermission(currentWorkspace?.role, 'members:create');
  const canDeleteWorkspace = hasPermission(currentWorkspace?.role, 'workspace:delete');

  if (loading) {
    return (
      <div>
        <PageTitle>Workspace Settings</PageTitle>
        <EmptyState>Loading workspace...</EmptyState>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div>
        <PageTitle>Workspace Settings</PageTitle>
        <EmptyState>
          No workspace found. Please create a workspace from the dashboard.
          <br /><br />
          Workspaces available: {workspaces.length}
          <br />
          <Link href="/dashboard" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
            Go to Dashboard
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <BackLink href="/dashboard/settings">
        <ArrowLeft size={16} />
        Back to Settings
      </BackLink>

      <PageTitle>Workspace Settings</PageTitle>
      <PageSubtitle>Manage your workspace and team members</PageSubtitle>

      <Grid>
        {/* Workspace Details */}
        <Card>
          <SectionHeader>
            <SectionTitle>
              <Settings size={24} />
              Workspace Details
            </SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleUpdateWorkspace}>
            <Input
              label="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={!canManageWorkspace || savingWorkspace}
              required
            />

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Workspace Logo
              </label>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>
                Upload a logo for your workspace. This will appear on shared calendar links.
              </p>

              {logoUrl && (
                <LogoPreviewContainer style={{ marginBottom: '12px' }}>
                  <LogoPreview
                    src={logoUrl}
                    alt="Workspace logo preview"
                    $size={logoSize}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>Current Logo</div>
                    <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                      Size: {logoSize}
                    </div>
                    {canManageWorkspace && (
                      <Button
                        type="button"
                        onClick={handleRemoveLogo}
                        style={{
                          background: '#EF4444',
                          padding: '6px 12px',
                          fontSize: '14px'
                        }}
                      >
                        <X size={16} style={{ marginRight: '4px' }} />
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </LogoPreviewContainer>
              )}

              <Select
                label="Logo Size"
                value={logoSize}
                onChange={(e) => setLogoSize(e.target.value)}
                disabled={!canManageWorkspace || savingWorkspace}
                options={[
                  { value: 'small', label: 'Small (40px)' },
                  { value: 'medium', label: 'Medium (60px)' },
                  { value: 'large', label: 'Large (80px)' }
                ]}
                helperText="Choose the size of your logo on shared calendar links"
              />

              {canManageWorkspace && (
                <div style={{ marginTop: '12px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {logoFile ? (
                    <div style={{
                      padding: '12px',
                      background: '#F3F4F6',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        Selected: {logoFile.name}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          type="button"
                          onClick={handleUploadLogo}
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setLogoFile(null)}
                          style={{ background: '#6B7280' }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ width: '100%', background: '#10B981' }}
                    >
                      <Upload size={18} style={{ marginRight: '8px' }} />
                      {logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                  )}

                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                    Supported formats: JPG, PNG, WEBP, SVG (max 5MB)
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Workspace Slug"
              value={currentWorkspace.slug}
              disabled
              helperText="Slug cannot be changed after creation"
            />

            <Input
              label="Subscription Plan"
              value={currentWorkspace.subscriptionPlan}
              disabled
              helperText="Upgrade or downgrade your plan in billing settings"
            />

            {canManageWorkspace && (
              <div>
                <Button type="submit" loading={savingWorkspace}>
                  Save Changes
                </Button>
              </div>
            )}
          </Form>
        </Card>

        {/* Team Members */}
        <Card>
          <SectionHeader>
            <SectionTitle>
              <Users size={24} />
              Team Members ({members.length})
            </SectionTitle>

            {canManageMembers && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <UserPlus size={16} />
                Add Member
              </Button>
            )}
          </SectionHeader>

          {loading ? (
            <EmptyState>Loading members...</EmptyState>
          ) : members.length > 0 ? (
            <MembersList>
              {members.map((member) => (
                <MemberCard key={member.userId}>
                  <MemberAvatar $color={ROLE_COLORS[member.role]}>
                    {getInitials(member.name)}
                  </MemberAvatar>

                  <MemberInfo>
                    <MemberName>
                      {member.name}
                      {member.isOwner && ' (Owner)'}
                    </MemberName>
                    <MemberEmail>{member.email}</MemberEmail>
                  </MemberInfo>

                  {!member.isOwner && canManageMembers ? (
                    <>
                      <Select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.userId, e.target.value)}
                        options={[
                          { value: 'viewer', label: 'Viewer' },
                          { value: 'contributor', label: 'Contributor' },
                          { value: 'editor', label: 'Editor' },
                          { value: 'admin', label: 'Admin' },
                        ]}
                      />

                      <MemberActions>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </MemberActions>
                    </>
                  ) : (
                    <RoleBadge $color={ROLE_COLORS[member.role]}>
                      {ROLE_NAMES[member.role]}
                    </RoleBadge>
                  )}
                </MemberCard>
              ))}
            </MembersList>
          ) : (
            <EmptyState>No team members yet</EmptyState>
          )}
        </Card>

        {/* Danger Zone */}
        {canDeleteWorkspace && (
          <Card variant="outlined">
            <SectionHeader>
              <SectionTitle style={{ color: '#EF4444' }}>
                <Shield size={24} />
                Danger Zone
              </SectionTitle>
            </SectionHeader>

            <p style={{ marginBottom: '16px', color: '#6B7280' }}>
              Once you delete a workspace, there is no going back. Please be certain.
            </p>

            <Button
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Workspace
            </Button>
          </Card>
        )}
      </Grid>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={addingMember}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              loading={addingMember}
            >
              Add Member
            </Button>
          </>
        }
      >
        <ModalContent>
          <Form onSubmit={handleAddMember}>
            <Input
              label="Email Address"
              type="email"
              leftIcon={<Mail size={20} />}
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />

            <Select
              label="Role"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              options={[
                { value: 'viewer', label: `Viewer - ${ROLE_DESCRIPTIONS.viewer}` },
                { value: 'contributor', label: `Contributor - ${ROLE_DESCRIPTIONS.contributor}` },
                { value: 'editor', label: `Editor - ${ROLE_DESCRIPTIONS.editor}` },
                { value: 'admin', label: `Admin - ${ROLE_DESCRIPTIONS.admin}` },
              ]}
            />
          </Form>
        </ModalContent>
      </Modal>

      {/* Delete Workspace Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Workspace"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingWorkspace}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteWorkspace}
              loading={deletingWorkspace}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <ModalContent>
          <p style={{ marginBottom: '16px' }}>
            Are you sure you want to delete <strong>{currentWorkspace.name}</strong>?
          </p>
          <p style={{ color: '#EF4444', marginBottom: '16px' }}>
            This action cannot be undone. The following will be permanently deleted from our database:
          </p>
          <ul style={{ color: '#EF4444', marginLeft: '20px', marginBottom: '16px' }}>
            <li>All posts and scheduled content</li>
            <li>All media files and images</li>
            <li>All social media account connections</li>
            <li>All analytics and performance data</li>
            <li>All team members and permissions</li>
          </ul>
          <p style={{ color: '#10B981', fontSize: '14px', background: '#10B98120', padding: '12px', borderRadius: '8px' }}>
            <strong>Note:</strong> Posts that have already been published to Facebook will remain on Facebook.
            Only the data in our system will be deleted.
          </p>
        </ModalContent>
      </Modal>
    </>
  );
}
