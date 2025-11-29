'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      showToast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      showToast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <PageContainer>
        <AuthCard>
          <SuccessSection>
            <SuccessIcon>
              <CheckCircle size={64} />
            </SuccessIcon>
            <SuccessTitle>Check your email</SuccessTitle>
            <SuccessText>
              We've sent a password reset link to <strong>{email}</strong>
            </SuccessText>
            <SuccessText>
              Click the link in the email to reset your password. The link will expire in 24 hours.
            </SuccessText>
            <BackButton href="/login">
              <ArrowLeft size={18} />
              Back to login
            </BackButton>
            <ResendText>
              Didn't receive the email?{' '}
              <ResendLink onClick={() => setEmailSent(false)}>
                Try again
              </ResendLink>
            </ResendText>
          </SuccessSection>
        </AuthCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AuthCard>
        <LogoSection>
          <Logo>🔒</Logo>
          <AppName>Forgot your password?</AppName>
          <Tagline>No worries, we'll send you reset instructions</Tagline>
        </LogoSection>

        <FormSection>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Email address</Label>
              <InputWrapper>
                <InputIcon>
                  <Mail size={18} />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </InputWrapper>
              <HelpText>
                Enter the email address associated with your account
              </HelpText>
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send reset link
                </>
              )}
            </SubmitButton>
          </Form>

          <BackLink href="/login">
            <ArrowLeft size={16} />
            Back to login
          </BackLink>
        </FormSection>
      </AuthCard>

      <Footer>
        <FooterLink href="/privacy">Privacy Policy</FooterLink>
        <FooterDot>•</FooterDot>
        <FooterLink href="/terms">Terms of Service</FooterLink>
      </Footer>
    </PageContainer>
  );
}

// Styled Components

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const LogoSection = styled.div`
  padding: 40px 40px 32px;
  text-align: center;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const Logo = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const AppName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
`;

const Tagline = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
`;

const FormSection = styled.div`
  padding: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #1a202c;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 8px 0 0 0;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  font-size: 0.875rem;
  color: #718096;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #8B5CF6;
  }
`;

const SuccessSection = styled.div`
  padding: 60px 40px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  margin-bottom: 24px;
`;

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px 0;
`;

const SuccessText = styled.p`
  font-size: 0.875rem;
  color: #718096;
  line-height: 1.6;
  margin: 0 0 16px 0;

  strong {
    color: #1a202c;
    font-weight: 600;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-top: 24px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
  }
`;

const ResendText = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 24px 0 0 0;
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: #8B5CF6;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 20px;
`;

const FooterLink = styled(Link)`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const FooterDot = styled.span`
  color: rgba(255, 255, 255, 0.5);
`;
