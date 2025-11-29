/**
 * UI Components Demo Page
 *
 * Showcases all reusable UI components with examples.
 * Access at /ui-demo
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Search } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Spinner, showToast } from '@/components/ui';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.default};
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto ${props => props.theme.spacing.xl};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.primary.main};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: ${props => props.theme.spacing.lg};
  transition: gap ${props => props.theme.transitions.fast};

  &:hover {
    gap: ${props => props.theme.spacing.md};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing['2xl']};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ComponentGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Label = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

export default function UIDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsyncAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast.success('Action completed successfully!');
    }, 2000);
  };

  return (
    <Container>
      <Header>
        <BackLink href="/dashboard">
          <ArrowLeft size={20} />
          Back to Dashboard
        </BackLink>
        <Title>UI Components Demo</Title>
        <Subtitle>Explore all available UI components with live examples</Subtitle>
      </Header>

      <Content>
        {/* Buttons */}
        <Section>
          <SectionTitle>Buttons</SectionTitle>

          <ComponentGroup>
            <Label>Variants</Label>
            <Grid>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </Grid>

            <Label>Sizes</Label>
            <Grid>
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </Grid>

            <Label>States</Label>
            <Grid>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button fullWidth>Full Width</Button>
            </Grid>
          </ComponentGroup>
        </Section>

        {/* Inputs */}
        <Section>
          <SectionTitle>Inputs</SectionTitle>

          <ComponentGroup>
            <FormGrid>
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail size={20} />}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                leftIcon={<Lock size={20} />}
                rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                onRightIconClick={() => setShowPassword(!showPassword)}
              />

              <Input
                label="Search"
                placeholder="Search..."
                leftIcon={<Search size={20} />}
              />

              <Input
                label="With Error"
                error="This field is required"
                required
              />

              <Input
                label="With Helper Text"
                helperText="Enter at least 8 characters"
              />

              <Input
                label="Disabled"
                value="Cannot edit"
                disabled
              />
            </FormGrid>
          </ComponentGroup>
        </Section>

        {/* Select */}
        <Section>
          <SectionTitle>Select</SectionTitle>

          <ComponentGroup>
            <FormGrid>
              <Select
                label="Platform"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'twitter', label: 'Twitter' },
                  { value: 'linkedin', label: 'LinkedIn' },
                ]}
              />

              <Select
                label="Status"
                placeholder="Choose status"
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'published', label: 'Published' },
                ]}
              />

              <Select
                label="With Error"
                error="Please select an option"
                required
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                ]}
              />

              <Select
                label="Disabled"
                disabled
                options={[
                  { value: 'option1', label: 'Option 1' },
                ]}
              />
            </FormGrid>
          </ComponentGroup>
        </Section>

        {/* Modal */}
        <Section>
          <SectionTitle>Modal</SectionTitle>

          <ComponentGroup>
            <Label>Click to open modal</Label>
            <div>
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              footer={
                <>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </>
              }
            >
              <p>This is an example modal with a title, content, and footer actions.</p>
              <p>You can close it by clicking the X button, clicking outside, or pressing Escape.</p>
            </Modal>
          </ComponentGroup>
        </Section>

        {/* Cards */}
        <Section>
          <SectionTitle>Cards</SectionTitle>

          <ComponentGroup>
            <Label>Variants</Label>
            <Grid>
              <Card variant="default">
                <h4>Default Card</h4>
                <p>With shadow and border</p>
              </Card>

              <Card variant="outlined">
                <h4>Outlined Card</h4>
                <p>With border only</p>
              </Card>

              <Card variant="elevated">
                <h4>Elevated Card</h4>
                <p>With larger shadow</p>
              </Card>

              <Card variant="ghost">
                <h4>Ghost Card</h4>
                <p>No border or shadow</p>
              </Card>
            </Grid>

            <Label>With Subcomponents</Label>
            <Card>
              <Card.Header>
                <Card.Title>Card Title</Card.Title>
                <Card.Description>
                  This is a card description that provides more context
                </Card.Description>
              </Card.Header>

              <Card.Body>
                <p>Main card content goes here. You can put any content in the body.</p>
              </Card.Body>

              <Card.Footer>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </Card.Footer>
            </Card>

            <Label>Hoverable Card</Label>
            <Card hoverable>
              <h4>Hover over me!</h4>
              <p>I have a hover effect</p>
            </Card>
          </ComponentGroup>
        </Section>

        {/* Spinners */}
        <Section>
          <SectionTitle>Spinners</SectionTitle>

          <ComponentGroup>
            <Label>Sizes</Label>
            <Grid>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="xs" />
                <span>Extra Small</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="sm" />
                <span>Small</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="md" />
                <span>Medium</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="lg" />
                <span>Large</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size="xl" />
                <span>Extra Large</span>
              </div>
            </Grid>

            <Label>Colors</Label>
            <Grid>
              <Spinner variant="primary" label="Primary" />
              <Spinner variant="secondary" label="Secondary" />
              <Spinner variant="success" label="Success" />
              <Spinner variant="error" label="Error" />
              <Spinner variant="gray" label="Gray" />
            </Grid>
          </ComponentGroup>
        </Section>

        {/* Toast */}
        <Section>
          <SectionTitle>Toast Notifications</SectionTitle>

          <ComponentGroup>
            <Label>Click buttons to see toast notifications</Label>
            <Grid>
              <Button onClick={() => showToast.success('Operation successful!')}>
                Success Toast
              </Button>
              <Button onClick={() => showToast.error('Something went wrong')}>
                Error Toast
              </Button>
              <Button onClick={() => showToast.info('Here is some information')}>
                Info Toast
              </Button>
              <Button onClick={() => showToast.warning('Please be careful!')}>
                Warning Toast
              </Button>
              <Button
                loading={loading}
                onClick={handleAsyncAction}
              >
                {loading ? 'Processing...' : 'Async Action'}
              </Button>
            </Grid>
          </ComponentGroup>
        </Section>
      </Content>
    </Container>
  );
}
