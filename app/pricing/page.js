"use client";

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Check, X, Sparkles, MessageCircle, ChevronDown, ArrowRight } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 140px 24px 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const FloatingOrb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 140, 66, 0.1);
  color: #ff8c42;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
  line-height: 1.1;

  span {
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #e67a35 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
`;

const BillingToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 12px;
`;

const ToggleButton = styled.button`
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$active ? `
    background: white;
    color: #0f172a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  ` : `
    background: transparent;
    color: #64748b;
  `}

  &:hover {
    color: #0f172a;
  }
`;

const SaveBadge = styled.span`
  padding: 4px 8px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
`;

const PricingSection = styled.section`
  padding: 0 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const PricingCard = styled.div`
  padding: 40px;
  border-radius: 24px;
  position: relative;
  transition: all 0.3s;

  ${props => props.$popular ? `
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #ff8c42 100%);
    background-size: 200% 200%;
    animation: gradientShift 5s ease infinite;
    box-shadow: 0 25px 50px -12px rgba(255, 140, 66, 0.4);
    transform: scale(1.05);
    z-index: 10;

    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  ` : `
    background: white;
    border: 1px solid #e2e8f0;

    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }
  `}
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
  color: white;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
`;

const PlanName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$popular ? 'white' : '#0f172a'};
  margin-bottom: 8px;
`;

const PlanDescription = styled.p`
  font-size: 14px;
  color: ${props => props.$popular ? 'rgba(255, 255, 255, 0.8)' : '#64748b'};
  margin-bottom: 24px;
`;

const PriceContainer = styled.div`
  margin-bottom: 24px;
`;

const Price = styled.span`
  font-size: 48px;
  font-weight: 800;
  color: ${props => props.$popular ? 'white' : '#0f172a'};
`;

const PricePeriod = styled.span`
  font-size: 16px;
  color: ${props => props.$popular ? 'rgba(255, 255, 255, 0.8)' : '#64748b'};
`;

const BilledText = styled.p`
  font-size: 13px;
  color: ${props => props.$popular ? 'rgba(255, 255, 255, 0.7)' : '#94a3b8'};
  margin-top: 4px;
`;

const CTAButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 32px;

  ${props => props.$popular ? `
    background: white;
    color: #ff8c42;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  ` : `
    background: #0f172a;
    color: white;

    &:hover {
      background: #1e293b;
      transform: translateY(-2px);
    }
  `}
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeaturesLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$popular ? 'white' : '#0f172a'};
  margin-bottom: 8px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${props => props.$popular ? 'rgba(255, 255, 255, 0.9)' : '#475569'};
`;

const FeatureIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: ${props => props.$popular ? '#86efac' : '#22c55e'};
  }
`;

const ComparisonSection = styled.section`
  padding: 80px 24px;
  background: #f8fafc;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto 48px;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16px;
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
`;

const ComparisonTable = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
  }
`;

const TableHeaderCell = styled.div`
  padding: 20px;
  font-weight: 600;
  text-align: center;

  ${props => props.$first && `
    text-align: left;
    background: #f8fafc;
    color: #0f172a;
  `}

  ${props => props.$popular && `
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
    color: white;
  `}

  ${props => !props.$first && !props.$popular && `
    background: #f8fafc;
    color: #0f172a;
  `}
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
  }
`;

const TableCell = styled.div`
  padding: 16px 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$first ? 'flex-start' : 'center'};
  color: ${props => props.$first ? '#475569' : '#0f172a'};

  ${props => props.$popular && `
    background: rgba(255, 140, 66, 0.03);
  `}
`;

const FAQSection = styled.section`
  padding: 80px 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  border: 1px solid ${props => props.$open ? 'rgba(255, 140, 66, 0.3)' : '#e2e8f0'};
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s;
  background: ${props => props.$open ? 'linear-gradient(135deg, rgba(255, 140, 66, 0.03) 0%, rgba(255, 107, 53, 0.03) 100%)' : 'white'};

  ${props => props.$open && `
    box-shadow: 0 8px 24px rgba(255, 140, 66, 0.1);
  `}
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  text-align: left;
`;

const FAQIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background: ${props => props.$open ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : '#f1f5f9'};
  transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0deg)'};

  svg {
    color: ${props => props.$open ? 'white' : '#64748b'};
  }
`;

const FAQAnswer = styled.div`
  padding: ${props => props.$open ? '0 24px 20px' : '0 24px'};
  max-height: ${props => props.$open ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s;
  color: #64748b;
  line-height: 1.7;
`;

const CTASection = styled.section`
  padding: 100px 24px;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 50%, #e67a35 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const CTATitle = styled.h2`
  font-size: 42px;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const CTASubtitle = styled.p`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const CTAPrimary = styled(Link)`
  padding: 16px 32px;
  background: white;
  color: #ff8c42;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

const CTASecondary = styled(Link)`
  padding: 16px 32px;
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small creators",
      monthlyPrice: 29,
      yearlyPrice: 290,
      popular: false,
      features: [
        "5 social accounts",
        "100 scheduled posts/month",
        "Basic analytics",
        "1 user",
        "Email support",
        "Content calendar",
        "Post templates"
      ]
    },
    {
      name: "Pro",
      description: "For growing businesses and teams",
      monthlyPrice: 79,
      yearlyPrice: 790,
      popular: true,
      features: [
        "15 social accounts",
        "Unlimited scheduled posts",
        "Advanced analytics",
        "Up to 5 users",
        "Priority chat support",
        "AI content suggestions",
        "Custom branding",
        "API access"
      ]
    },
    {
      name: "Enterprise",
      description: "For large teams and agencies",
      monthlyPrice: null,
      yearlyPrice: null,
      popular: false,
      features: [
        "Unlimited social accounts",
        "Unlimited scheduled posts",
        "Custom analytics & reports",
        "Unlimited users",
        "Dedicated account manager",
        "Custom integrations",
        "SSO / SAML",
        "SLA agreement"
      ]
    }
  ];

  const comparisonFeatures = [
    { name: "Social Accounts", starter: "5", pro: "15", enterprise: "Unlimited" },
    { name: "Scheduled Posts", starter: "100/month", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Team Members", starter: "1", pro: "5", enterprise: "Unlimited" },
    { name: "Analytics", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
    { name: "AI Suggestions", starter: false, pro: true, enterprise: true },
    { name: "Custom Branding", starter: false, pro: true, enterprise: true },
    { name: "API Access", starter: false, pro: true, enterprise: true },
    { name: "Priority Support", starter: false, pro: true, enterprise: true },
    { name: "Dedicated Manager", starter: false, pro: false, enterprise: true },
    { name: "SSO / SAML", starter: false, pro: false, enterprise: true }
  ];

  const faqs = [
    {
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the credit will be applied to future invoices."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All plans come with a 14-day free trial with full access to all features. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual Enterprise plans."
    },
    {
      question: "Can I get a refund?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us within 30 days of your purchase for a full refund."
    },
    {
      question: "Do you offer discounts for nonprofits?",
      answer: "Yes! We offer 50% off for registered nonprofits and educational institutions. Contact our sales team with proof of nonprofit status."
    }
  ];

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb style={{ top: '80px', left: '10%', background: '#86efac' }} />
        <FloatingOrb style={{ top: '150px', right: '10%', background: '#93c5fd', animationDelay: '2s' }} />

        <Badge>Pricing</Badge>
        <Title>
          Simple, transparent <span>pricing</span>
        </Title>
        <Subtitle>
          Choose the perfect plan for your business. Start free, upgrade when you need more.
        </Subtitle>

        <BillingToggle>
          <ToggleButton
            $active={billingCycle === 'monthly'}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </ToggleButton>
          <ToggleButton
            $active={billingCycle === 'yearly'}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <SaveBadge>Save 17%</SaveBadge>
          </ToggleButton>
        </BillingToggle>
      </HeroSection>

      <PricingSection>
        <PricingGrid>
          {plans.map((plan) => (
            <PricingCard key={plan.name} $popular={plan.popular}>
              {plan.popular && <PopularBadge>Most Popular</PopularBadge>}

              <PlanName $popular={plan.popular}>{plan.name}</PlanName>
              <PlanDescription $popular={plan.popular}>{plan.description}</PlanDescription>

              <PriceContainer>
                {plan.monthlyPrice ? (
                  <>
                    <Price $popular={plan.popular}>
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                    </Price>
                    <PricePeriod $popular={plan.popular}>/month</PricePeriod>
                    {billingCycle === 'yearly' && (
                      <BilledText $popular={plan.popular}>Billed ${plan.yearlyPrice}/year</BilledText>
                    )}
                  </>
                ) : (
                  <Price $popular={plan.popular}>Custom</Price>
                )}
              </PriceContainer>

              <CTAButton href={plan.monthlyPrice ? '/register' : '/contact'} $popular={plan.popular}>
                {plan.monthlyPrice ? 'Start Free Trial' : 'Contact Sales'}
              </CTAButton>

              <FeaturesList>
                <FeaturesLabel $popular={plan.popular}>Includes:</FeaturesLabel>
                {plan.features.map((feature, index) => (
                  <Feature key={index} $popular={plan.popular}>
                    <FeatureIcon $popular={plan.popular}>
                      <Check size={16} />
                    </FeatureIcon>
                    {feature}
                  </Feature>
                ))}
              </FeaturesList>
            </PricingCard>
          ))}
        </PricingGrid>
      </PricingSection>

      <ComparisonSection>
        <SectionHeader>
          <SectionTitle>Compare all features</SectionTitle>
          <SectionSubtitle>See what's included in each plan</SectionSubtitle>
        </SectionHeader>

        <ComparisonTable>
          <TableHeader>
            <TableHeaderCell $first>Features</TableHeaderCell>
            <TableHeaderCell>Starter</TableHeaderCell>
            <TableHeaderCell $popular>Pro</TableHeaderCell>
            <TableHeaderCell>Enterprise</TableHeaderCell>
          </TableHeader>

          {comparisonFeatures.map((feature, index) => (
            <TableRow key={index}>
              <TableCell $first>{feature.name}</TableCell>
              <TableCell>
                {typeof feature.starter === 'boolean' ? (
                  feature.starter ? <Check size={18} color="#22c55e" /> : <X size={18} color="#cbd5e1" />
                ) : feature.starter}
              </TableCell>
              <TableCell $popular>
                {typeof feature.pro === 'boolean' ? (
                  feature.pro ? <Check size={18} color="#ff8c42" /> : <X size={18} color="#cbd5e1" />
                ) : feature.pro}
              </TableCell>
              <TableCell>
                {typeof feature.enterprise === 'boolean' ? (
                  feature.enterprise ? <Check size={18} color="#22c55e" /> : <X size={18} color="#cbd5e1" />
                ) : feature.enterprise}
              </TableCell>
            </TableRow>
          ))}
        </ComparisonTable>
      </ComparisonSection>

      <FAQSection>
        <SectionHeader>
          <Badge style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>FAQ</Badge>
          <SectionTitle>Pricing questions</SectionTitle>
          <SectionSubtitle>Everything you need to know about our pricing</SectionSubtitle>
        </SectionHeader>

        {faqs.map((faq, index) => (
          <FAQItem key={index} $open={openFaq === index}>
            <FAQQuestion onClick={() => setOpenFaq(openFaq === index ? null : index)}>
              {faq.question}
              <FAQIconWrapper $open={openFaq === index}>
                <ChevronDown size={18} />
              </FAQIconWrapper>
            </FAQQuestion>
            <FAQAnswer $open={openFaq === index}>
              {faq.answer}
            </FAQAnswer>
          </FAQItem>
        ))}
      </FAQSection>

      <CTASection>
        <CTATitle>Start your free trial today</CTATitle>
        <CTASubtitle>14 days free. No credit card required. Cancel anytime.</CTASubtitle>
        <CTAButtons>
          <CTAPrimary href="/register">
            Start Free 14-Day Trial
            <ArrowRight size={18} />
          </CTAPrimary>
          <CTASecondary href="/contact">Contact Sales</CTASecondary>
        </CTAButtons>
      </CTASection>

      <MarketingFooter />
    </PageContainer>
  );
}
