"use client";

import styled from 'styled-components';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User, Tag } from 'lucide-react';
import MarketingNavbar from '../components/MarketingNavbar';
import MarketingFooter from '../components/MarketingFooter';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
`;

const HeroSection = styled.section`
  padding: 120px 24px 60px;
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

const FeaturedPost = styled(Link)`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  background: white;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  text-decoration: none;
  margin-bottom: 60px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: transparent;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const FeaturedImage = styled.div`
  background: ${props => props.$bg || 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)'};
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  color: white;

  @media (max-width: 968px) {
    min-height: 250px;
  }
`;

const FeaturedContent = styled.div`
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 968px) {
    padding: 32px;
  }
`;

const FeaturedBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: #d1fae5;
  color: #059669;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  width: fit-content;
`;

const FeaturedTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  line-height: 1.3;
`;

const FeaturedExcerpt = styled.p`
  font-size: 16px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 24px;
`;

const FeaturedMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  color: #94a3b8;
  font-size: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PostCard = styled(Link)`
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: transparent;
  }
`;

const PostImage = styled.div`
  height: 200px;
  background: ${props => props.$bg || 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
`;

const PostContent = styled.div`
  padding: 24px;
`;

const PostCategory = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.$bg || '#fff5ee'};
  color: ${props => props.$color || '#ff8c42'};
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const PostTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const PostExcerpt = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: #94a3b8;
  font-size: 13px;
`;

const Categories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 48px;
`;

const CategoryButton = styled.button`
  padding: 10px 20px;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
  background: ${props => props.$active ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff8c42;
    color: ${props => props.$active ? 'white' : '#ff8c42'};
  }
`;

const NewsletterSection = styled.div`
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  border-radius: 24px;
  padding: 60px;
  text-align: center;
  margin-top: 60px;

  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

const NewsletterTitle = styled.h3`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
`;

const NewsletterText = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    background: white;
  }
`;

const NewsletterButton = styled.button`
  padding: 16px 32px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
`;

export default function Blog() {
  const categories = ['All', 'Social Media', 'Marketing', 'Tips & Tricks', 'Product Updates', 'Case Studies'];

  const posts = [
    {
      title: '10 Instagram Trends to Watch in 2025',
      excerpt: 'Stay ahead of the curve with these emerging Instagram trends that will shape the platform this year.',
      category: 'Social Media',
      categoryBg: '#fce7f3',
      categoryColor: '#ec4899',
      date: 'Dec 5, 2025',
      readTime: '8 min read',
      bg: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      emoji: '📸'
    },
    {
      title: 'How to Create a Content Calendar That Works',
      excerpt: 'A step-by-step guide to planning and organizing your social media content for maximum impact.',
      category: 'Tips & Tricks',
      categoryBg: '#fef3c7',
      categoryColor: '#f59e0b',
      date: 'Dec 3, 2025',
      readTime: '6 min read',
      bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      emoji: '📅'
    },
    {
      title: 'The Complete Guide to Social Media Analytics',
      excerpt: 'Understanding your metrics is key to growth. Learn how to interpret and act on your data.',
      category: 'Marketing',
      categoryBg: '#fff5ee',
      categoryColor: '#ff8c42',
      date: 'Dec 1, 2025',
      readTime: '10 min read',
      bg: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
      emoji: '📊'
    },
    {
      title: 'New Feature: AI-Powered Caption Generator',
      excerpt: 'We just launched our new AI caption tool. Here is how it can save you hours every week.',
      category: 'Product Updates',
      categoryBg: '#d1fae5',
      categoryColor: '#10b981',
      date: 'Nov 28, 2025',
      readTime: '4 min read',
      bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      emoji: '✨'
    },
    {
      title: 'How GrowthCo Increased Engagement by 300%',
      excerpt: 'A deep dive into how one of our customers transformed their social media presence.',
      category: 'Case Studies',
      categoryBg: '#fff5ee',
      categoryColor: '#ff6b35',
      date: 'Nov 25, 2025',
      readTime: '12 min read',
      bg: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
      emoji: '🚀'
    },
    {
      title: 'TikTok vs Instagram Reels: Which is Better?',
      excerpt: 'An in-depth comparison of the two short-form video giants and which one you should focus on.',
      category: 'Social Media',
      categoryBg: '#fce7f3',
      categoryColor: '#ec4899',
      date: 'Nov 22, 2025',
      readTime: '9 min read',
      bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      emoji: '🎬'
    }
  ];

  return (
    <PageContainer>
      <MarketingNavbar />

      <HeroSection>
        <FloatingOrb className="left" />
        <FloatingOrb className="right" />
        <HeroContent>
          <Badge>SocialHub Blog</Badge>
          <Title>
            Insights to <span>grow your presence</span>
          </Title>
          <Subtitle>
            Tips, strategies, and insights to help you master social media
            and grow your online presence.
          </Subtitle>
        </HeroContent>
      </HeroSection>

      <Section>
        <Container>
          <FeaturedPost href="/blog/ultimate-guide-social-media-2025">
            <FeaturedImage $bg="linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)">
              📱
            </FeaturedImage>
            <FeaturedContent>
              <FeaturedBadge>Featured</FeaturedBadge>
              <FeaturedTitle>
                The Ultimate Guide to Social Media Marketing in 2025
              </FeaturedTitle>
              <FeaturedExcerpt>
                Everything you need to know about building a successful social media strategy
                this year. From platform selection to content creation and analytics.
              </FeaturedExcerpt>
              <FeaturedMeta>
                <MetaItem>
                  <User size={16} />
                  Sarah Chen
                </MetaItem>
                <MetaItem>
                  <Calendar size={16} />
                  Dec 7, 2025
                </MetaItem>
                <MetaItem>
                  <Clock size={16} />
                  15 min read
                </MetaItem>
              </FeaturedMeta>
            </FeaturedContent>
          </FeaturedPost>

          <Categories>
            {categories.map((cat, index) => (
              <CategoryButton key={index} $active={index === 0}>
                {cat}
              </CategoryButton>
            ))}
          </Categories>

          <PostsGrid>
            {posts.map((post, index) => (
              <PostCard key={index} href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <PostImage $bg={post.bg}>
                  {post.emoji}
                </PostImage>
                <PostContent>
                  <PostCategory $bg={post.categoryBg} $color={post.categoryColor}>
                    {post.category}
                  </PostCategory>
                  <PostTitle>{post.title}</PostTitle>
                  <PostExcerpt>{post.excerpt}</PostExcerpt>
                  <PostMeta>
                    <MetaItem>
                      <Calendar size={14} />
                      {post.date}
                    </MetaItem>
                    <MetaItem>
                      <Clock size={14} />
                      {post.readTime}
                    </MetaItem>
                  </PostMeta>
                </PostContent>
              </PostCard>
            ))}
          </PostsGrid>

          <NewsletterSection>
            <NewsletterTitle>Stay Updated</NewsletterTitle>
            <NewsletterText>
              Get the latest tips and insights delivered to your inbox every week.
            </NewsletterText>
            <NewsletterForm onSubmit={(e) => e.preventDefault()}>
              <NewsletterInput type="email" placeholder="Enter your email" />
              <NewsletterButton type="submit">Subscribe</NewsletterButton>
            </NewsletterForm>
          </NewsletterSection>
        </Container>
      </Section>

      <MarketingFooter />
    </PageContainer>
  );
}
