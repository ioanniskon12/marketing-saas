/**
 * Brand Switcher
 *
 * Dropdown to switch between brands.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { ROLE_COLORS } from '@/lib/permissions/rbac';
import { Modal, Button, Input } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';

const Container = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.neutral[300]};
    background: ${props => props.theme.colors.neutral[50]};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary.main}20`};
  }
`;

const BrandInfo = styled.div`
  flex: 1;
  text-align: left;
  overflow: hidden;
`;

const BrandName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BrandRole = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IconWrapper = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + ${props => props.theme.spacing.sm});
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  padding: ${props => props.theme.spacing.sm};
  z-index: ${props => props.theme.zIndex.dropdown};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all ${props => props.theme.transitions.base};
  max-height: 300px;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[300]};
    border-radius: ${props => props.theme.borderRadius.full};
  }
`;

const DropdownSection = styled.div`
  padding: ${props => props.theme.spacing.xs} 0;
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const DropdownSectionTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const BrandItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }
`;

const BrandAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.$color || props.theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  flex-shrink: 0;
`;

const BrandDetails = styled.div`
  flex: 1;
  text-align: left;
`;

const BrandItemName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const BrandItemRole = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
`;

const CheckIcon = styled.div`
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
`;

const CreateButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.primary.main};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.primary.main}10;
  }

  svg {
    flex-shrink: 0;
  }
`;

export default function BrandSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [creating, setCreating] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  const { currentWorkspace, workspaces, loading, setCurrentWorkspace, refreshWorkspaces } = useWorkspace();
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBrandSelect = (brand) => {
    setCurrentWorkspace(brand);
    setIsOpen(false);
  };

  const handleCreateBrand = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateBrandSubmit = async (e) => {
    e.preventDefault();

    if (!newBrandName.trim()) {
      showToast.error('Please enter a brand name');
      return;
    }

    setCreating(true);

    try {
      // Generate slug from name
      const slug = newBrandName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create brand
      const { data: brand, error: brandError } = await supabase
        .from('workspaces')
        .insert({
          name: newBrandName.trim(),
          slug: slug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (brandError) throw brandError;

      // Note: The workspace_add_owner trigger automatically adds the creator as owner member

      showToast.success('Brand created successfully!');

      // Refresh brands and switch to new one
      await refreshWorkspaces();
      setCurrentWorkspace({ ...brand, role: 'owner' });

      // Close modal and reset form
      setIsCreateModalOpen(false);
      setNewBrandName('');
    } catch (error) {
      console.error('Error creating brand:', error);
      showToast.error(error.message || 'Failed to create brand');
    } finally {
      setCreating(false);
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

  // Show loading state
  if (loading || !currentWorkspace) {
    return (
      <Container>
        <Trigger disabled>
          <BrandInfo>
            <BrandName>Loading...</BrandName>
          </BrandInfo>
        </Trigger>
      </Container>
    );
  }

  return (
    <Container ref={dropdownRef}>
      <Trigger onClick={() => setIsOpen(!isOpen)}>
        <BrandInfo>
          <BrandName>{currentWorkspace.name}</BrandName>
          <BrandRole>{currentWorkspace.role}</BrandRole>
        </BrandInfo>
        <IconWrapper>
          <ChevronsUpDown size={16} />
        </IconWrapper>
      </Trigger>

      <Dropdown $isOpen={isOpen}>
        <DropdownSection>
          <DropdownSectionTitle>Brands</DropdownSectionTitle>
          {workspaces.map((brand) => (
            <BrandItem
              key={brand.id}
              onClick={() => handleBrandSelect(brand)}
            >
              <BrandAvatar $color={ROLE_COLORS[brand.role]}>
                {getInitials(brand.name)}
              </BrandAvatar>

              <BrandDetails>
                <BrandItemName>{brand.name}</BrandItemName>
                <BrandItemRole>{brand.role}</BrandItemRole>
              </BrandDetails>

              {currentWorkspace.id === brand.id && (
                <CheckIcon>
                  <Check size={16} />
                </CheckIcon>
              )}
            </BrandItem>
          ))}
        </DropdownSection>

        <DropdownSection>
          <CreateButton onClick={handleCreateBrand}>
            <Plus size={16} />
            Create Brand
          </CreateButton>
        </DropdownSection>
      </Dropdown>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewBrandName('');
        }}
        title="Create New Brand"
      >
        <form onSubmit={handleCreateBrandSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="brandName"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                fontSize: '14px',
              }}
            >
              Brand Name
            </label>
            <Input
              id="brandName"
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="e.g., Client Name or Company Name"
              disabled={creating}
              autoFocus
            />
            <p
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6B7280',
              }}
            >
              Create a brand for each client or project you manage
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewBrandName('');
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !newBrandName.trim()}
            >
              {creating ? 'Creating...' : 'Create Brand'}
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
