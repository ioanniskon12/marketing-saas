"use client";

import styled from 'styled-components';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Building } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 80px;
  background: linear-gradient(180deg, #fff5ee 0%, white 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;

  &.left {
    top: -100px;
    left: -200px;
    background: #ff8c42;
  }

  &.right {
    bottom: -100px;
    right: -200px;
    background: #ff6b35;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
  color: #ff8c42;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
  line-height: 1.1;

  span {
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #64748b;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Section = styled.section`
  padding: 80px 24px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const ContactInfo = styled.div``;

const InfoTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
`;

const InfoText = styled.p`
  font-size: 17px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 40px;
`;

const ContactCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ContactCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.$bg || '#e0e7ff'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardContent = styled.div``;

const CardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

const CardText = styled.p`
  font-size: 15px;
  color: #64748b;
  line-height: 1.5;
`;

const CardLink = styled.a`
  font-size: 15px;
  color: #ff8c42;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ContactForm = styled.form`
  background: white;
  border-radius: 24px;
  padding: 40px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
`;

const FormTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const FormSubtitle = styled.p`
  font-size: 15px;
  color: #64748b;
  margin-bottom: 32px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff8c42;
    box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff8c42;
    box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  min-height: 140px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff8c42;
    box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 140, 66, 0.4);
  }
`;

const SupportSection = styled.div`
  background: #f8fafc;
  padding: 80px 24px;
`;

const SupportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const SupportCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: transparent;
  }
`;

const SupportIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${props => props.$bg || '#e0e7ff'};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const SupportTitle = styled.h4`
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
`;

const SupportText = styled.p`
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
`;

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <HeroContent>
          <Badge>Get In Touch</Badge>
          <Title>
            We'd love to <span>hear from you</span>
          </Title>
          <Subtitle>
            Have questions about SocialHub? Our team is here to help you
            find the perfect solution for your social media needs.
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <Section>
        <Container>
          <ContactGrid>
            <ContactInfo>
              <InfoTitle>Let's Start a Conversation</InfoTitle>
              <InfoText>
                Whether you have a question about features, pricing, need a demo,
                or anything else, our team is ready to answer all your questions.
              </InfoText>

              <ContactCards>
                <ContactCard>
                  <CardIcon $bg="#d1fae5">
                    <Mail size={24} color="#10b981" />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Email Us</CardTitle>
                    <CardLink href="mailto:hello@socialhub.com">hello@socialhub.com</CardLink>
                  </CardContent>
                </ContactCard>

                <ContactCard>
                  <CardIcon $bg="#fff5ee">
                    <Phone size={24} color="#ff8c42" />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Call Us</CardTitle>
                    <CardLink href="tel:+15551234567">+1 (555) 123-4567</CardLink>
                  </CardContent>
                </ContactCard>

                <ContactCard>
                  <CardIcon $bg="#fce7f3">
                    <MapPin size={24} color="#ec4899" />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Visit Us</CardTitle>
                    <CardText>123 Market Street, Suite 456<br />San Francisco, CA 94105</CardText>
                  </CardContent>
                </ContactCard>

                <ContactCard>
                  <CardIcon $bg="#fef3c7">
                    <Clock size={24} color="#f59e0b" />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>Business Hours</CardTitle>
                    <CardText>Monday - Friday: 9:00 AM - 6:00 PM PST</CardText>
                  </CardContent>
                </ContactCard>
              </ContactCards>
            </ContactInfo>

            <ContactForm onSubmit={handleSubmit}>
              <FormTitle>Send us a Message</FormTitle>
              <FormSubtitle>Fill out the form and we'll get back to you within 24 hours.</FormSubtitle>

              <FormRow>
                <FormGroup>
                  <FormLabel>First Name</FormLabel>
                  <FormInput type="text" placeholder="John" required />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Last Name</FormLabel>
                  <FormInput type="text" placeholder="Doe" required />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <FormLabel>Email Address</FormLabel>
                <FormInput type="email" placeholder="john@example.com" required />
              </FormGroup>

              <FormGroup>
                <FormLabel>Company</FormLabel>
                <FormInput type="text" placeholder="Your company name" />
              </FormGroup>

              <FormGroup>
                <FormLabel>How can we help?</FormLabel>
                <FormSelect required>
                  <option value="">Select a topic</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="demo">Request a Demo</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Message</FormLabel>
                <FormTextarea placeholder="Tell us more about your needs..." required />
              </FormGroup>

              <SubmitButton type="submit">
                Send Message <Send size={18} />
              </SubmitButton>
            </ContactForm>
          </ContactGrid>
        </Container>
      </Section>

      <SupportSection>
        <Container>
          <SectionHeader>
            <SectionTitle>Other Ways to Get Help</SectionTitle>
            <SectionSubtitle>
              Choose the support option that works best for you
            </SectionSubtitle>
          </SectionHeader>

          <SupportGrid>
            <SupportCard>
              <SupportIcon $bg="#fff5ee">
                <MessageCircle size={32} color="#ff8c42" />
              </SupportIcon>
              <SupportTitle>Live Chat</SupportTitle>
              <SupportText>
                Chat with our support team in real-time. Available Monday through Friday, 9 AM - 6 PM PST.
              </SupportText>
            </SupportCard>

            <SupportCard>
              <SupportIcon $bg="#d1fae5">
                <Headphones size={32} color="#10b981" />
              </SupportIcon>
              <SupportTitle>Help Center</SupportTitle>
              <SupportText>
                Browse our comprehensive knowledge base with tutorials, guides, and FAQs.
              </SupportText>
            </SupportCard>

            <SupportCard>
              <SupportIcon $bg="#fce7f3">
                <Building size={32} color="#ec4899" />
              </SupportIcon>
              <SupportTitle>Enterprise Support</SupportTitle>
              <SupportText>
                Dedicated support for enterprise customers with priority response times.
              </SupportText>
            </SupportCard>
          </SupportGrid>
        </Container>
      </SupportSection>

      <MarketingFooter />
    </PageContainer>
  );
}
