'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      showToast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      showToast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <PageContainer>
      <AuthCard>
        <LogoSection>
          <Logo>📱</Logo>
          <AppName>Social Media SaaS</AppName>
          <Tagline>Manage all your social media in one place</Tagline>
        </LogoSection>

        <FormSection>
          <FormTitle>Welcome back</FormTitle>
          <FormSubtitle>Sign in to your account to continue</FormSubtitle>

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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <LabelRow>
                <Label>Password</Label>
                <ForgotLink href="/forgot-password">
                  Forgot password?
                </ForgotLink>
              </LabelRow>
              <InputWrapper>
                <InputIcon>
                  <Lock size={18} />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <TogglePassword onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </TogglePassword>
              </InputWrapper>
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </SubmitButton>
          </Form>

          <Divider>
            <DividerLine />
            <DividerText>or</DividerText>
            <DividerLine />
          </Divider>

          <SignupPrompt>
            Don't have an account?{' '}
            <SignupLink href="/register">
              Sign up for free
            </SignupLink>
          </SignupPrompt>
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

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
`;

const FormSubtitle = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 32px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ForgotLink = styled(Link)`
  font-size: 0.875rem;
  color: #8B5CF6;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
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

const TogglePassword = styled.button`
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: #1a202c;
  }
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
  margin-top: 8px;

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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: #e5e7eb;
`;

const DividerText = styled.span`
  padding: 0 12px;
  font-size: 0.875rem;
  color: #9ca3af;
`;

const SignupPrompt = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: #718096;
`;

const SignupLink = styled(Link)`
  color: #8B5CF6;
  text-decoration: none;
  font-weight: 600;

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
