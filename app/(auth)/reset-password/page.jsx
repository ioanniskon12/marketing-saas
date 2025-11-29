'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/components/ui/Toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength === null) return '#e5e7eb';
    if (strength <= 1) return '#ef4444';
    if (strength <= 2) return '#f59e0b';
    if (strength <= 3) return '#10b981';
    return '#10b981';
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    if (strength === null) return '';
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      showToast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      showToast.success('Password updated successfully!');
      router.push('/login');
    } catch (error) {
      console.error('Password reset error:', error);
      showToast.error(error.message || 'Failed to reset password');
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
          <Logo>🔐</Logo>
          <AppName>Reset your password</AppName>
          <Tagline>Enter your new password below</Tagline>
        </LogoSection>

        <FormSection>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>New password</Label>
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
                  autoComplete="new-password"
                  autoFocus
                />
                <TogglePassword onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </TogglePassword>
              </InputWrapper>
              {formData.password && (
                <PasswordStrength>
                  <StrengthBar>
                    <StrengthFill $width={(passwordStrength() || 0) * 25} $color={getStrengthColor()} />
                  </StrengthBar>
                  <StrengthText $color={getStrengthColor()}>
                    {getStrengthText()}
                  </StrengthText>
                </PasswordStrength>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Confirm new password</Label>
              <InputWrapper>
                <InputIcon>
                  <Lock size={18} />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {formData.confirmPassword && (
                  <StatusIcon>
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle size={18} color="#10b981" />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" />
                    )}
                  </StatusIcon>
                )}
              </InputWrapper>
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Updating password...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Reset password
                </>
              )}
            </SubmitButton>
          </Form>

          <BackLink href="/login">
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

const StatusIcon = styled.div`
  position: absolute;
  right: 14px;
  display: flex;
  align-items: center;
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StrengthBar = styled.div`
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  transition: all 0.3s ease;
`;

const StrengthText = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$color};
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

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  font-size: 0.875rem;
  color: #718096;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #8B5CF6;
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
