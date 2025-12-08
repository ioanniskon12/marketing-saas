'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import {
  Calendar, Lock, CheckCircle, XCircle, Send, Play, MessageSquare, Users,
  ChevronLeft, ChevronRight, Clock, AlertTriangle, X, Maximize2
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { PLATFORM_CONFIG } from '@/lib/config/platforms';

const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

// Hero Section
const HeroSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px;
  text-align: center;
  color: white;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 24px 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
`;

const HeroStat = styled.div`
  text-align: center;
`;

const HeroStatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const HeroStatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

const ClientBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 20px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Content Section
const Content = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 40px 20px 60px;

  @media (max-width: 768px) {
    padding: 24px 16px 40px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
`;

const DeadlineBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: ${props => props.$urgent ? '#fef2f2' : '#fffbeb'};
  border: 1px solid ${props => props.$urgent ? '#fecaca' : '#fde68a'};
  border-radius: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
  }
`;

const DeadlineIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${props => props.$urgent ? '#fee2e2' : '#fef3c7'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 22px;
    height: 22px;
    color: ${props => props.$urgent ? '#dc2626' : '#d97706'};
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const DeadlineContent = styled.div`
  flex: 1;
`;

const DeadlineTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.$urgent ? '#991b1b' : '#92400e'};
  margin-bottom: 2px;
`;

const DeadlineText = styled.div`
  font-size: 14px;
  color: ${props => props.$urgent ? '#b91c1c' : '#b45309'};
`;

const DeadlineTime = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const TimeBlock = styled.div`
  text-align: center;
  min-width: 50px;
`;

const TimeValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$urgent ? '#dc2626' : '#d97706'};
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TimeLabel = styled.div`
  font-size: 11px;
  color: ${props => props.$urgent ? '#991b1b' : '#92400e'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

const PlatformTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
    margin-bottom: 16px;
  }
`;

const PlatformTab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid ${props => props.$active ? props.$color || '#667eea' : '#e2e8f0'};
  background: ${props => props.$active ? `${props.$color || '#667eea'}15` : 'white'};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$active ? props.$color || '#667eea' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$color || '#667eea'};
    background: ${props => `${props.$color || '#667eea'}10`};
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;
    border-radius: 8px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const TabCount = styled.span`
  background: ${props => props.$active ? props.$color || '#667eea' : '#e2e8f0'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;

  @media (max-width: 768px) {
    padding: 2px 6px;
    font-size: 11px;
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PostCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PostHeader = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
`;

const PlatformAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$color || '#8e8e8e'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PostMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlatformName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const PostDate = styled.div`
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ApprovalBadge = styled.div`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$approved ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$approved ? '#166534' : '#991b1b'};
`;

const MediaContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
`;

const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MediaVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 28px;
    height: 28px;
    margin-left: 4px;
  }
`;

const MediaCount = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const MediaWatermarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 30px;
  padding: 20px;
  overflow: hidden;
`;

const WatermarkText = styled.span`
  color: rgba(255, 255, 255, 0.25);
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  transform: rotate(-25deg);
  white-space: nowrap;
  user-select: none;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

const MediaWatermarkBadge = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 5;
`;

const NoMediaPlaceholder = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  gap: 8px;
`;

const CaptionSection = styled.div`
  padding: 12px 16px;
`;

const Caption = styled.p`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
`;

const Hashtags = styled.div`
  font-size: 12px;
  color: #667eea;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SeeMoreBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  margin-top: 8px;
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// Post Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalPlatformIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.$color || '#8e8e8e'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ModalPlatformInfo = styled.div`
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  span {
    font-size: 13px;
    color: #6b7280;
  }
`;

const ModalCloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #64748b;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ModalMediaSection = styled.div`
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 300px;

  @media (max-width: 768px) {
    min-height: 250px;
  }
`;

const ModalMedia = styled.img`
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
`;

const ModalVideo = styled.video`
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
`;

const ModalTextSection = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }
`;

const ModalCaptionArea = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
`;

const ModalCaption = styled.p`
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

const ModalHashtags = styled.div`
  font-size: 14px;
  color: #667eea;
  margin-top: 16px;
  line-height: 1.6;
`;

const ModalApprovalSection = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

// Approval Section - Always visible
const ApprovalArea = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const ApprovalStatus = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  background: ${props => props.$approved ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$approved ? '#166534' : '#991b1b'};
`;

const ApprovalStatusHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ApprovalComment = styled.div`
  font-size: 13px;
  margin-top: 8px;
  opacity: 0.85;
  font-style: italic;
  padding-left: 26px;
`;

const ApprovalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ApproveBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
  }

  &.approve {
    background: #10b981;
    color: white;
    &:hover { background: #059669; }
  }

  &.reject {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    &:hover {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fecaca;
    }
  }
`;

// Rejection Modal
const RejectModal = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #fecaca;
`;

const RejectModalTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 12px;
`;

const RejectTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  resize: none;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #ef4444;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const RejectActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const RejectCancelBtn = styled.button`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

const RejectConfirmBtn = styled.button`
  padding: 8px 16px;
  border: none;
  background: #ef4444;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Loading, Error, Password states
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  text-align: center;
  padding: 40px 20px;

  svg {
    width: 64px;
    height: 64px;
    color: #94a3b8;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
    max-width: 400px;
  }
`;

const PasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const PasswordCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const PasswordIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 36px;
    height: 36px;
    color: white;
  }
`;

const PasswordTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const PasswordDescription = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 24px 0;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  margin-bottom: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PasswordSubmit = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  svg {
    width: 64px;
    height: 64px;
    color: #94a3b8;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 15px;
    color: #6b7280;
    margin: 0;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: 24px;
    gap: 6px;
  }
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 2px solid ${props => props.$active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #667eea;
    background: ${props => props.$active ? '#667eea' : '#f8fafc'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    font-size: 13px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const PageInfo = styled.span`
  color: #64748b;
  font-size: 14px;
  padding: 0 12px;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 0 8px;
  }
`;

const Watermark = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 13px;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function SharePlanPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState(null);
  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [rejectingPost, setRejectingPost] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const POSTS_PER_PAGE = 18;

  useEffect(() => {
    if (params.shareId) {
      loadShare();
    }
  }, [params.shareId]);

  // Reset to page 1 when platform filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlatform]);

  const loadShare = async (enteredPassword = null) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/share/plan/${params.shareId}`;
      if (enteredPassword) {
        url += `?password=${encodeURIComponent(enteredPassword)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.passwordRequired) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError('Incorrect password');
          setPasswordRequired(true);
          setLoading(false);
          return;
        }
        setError(data.error || 'Failed to load plan');
        setLoading(false);
        return;
      }

      if (enteredPassword) {
        setVerifiedPassword(enteredPassword);
      }

      setShare(data.share);
      setPosts(data.posts || []);
      setFeedback(data.feedback || []);
      setAuthorName(data.share?.client_name || '');

    } catch (error) {
      console.error('Error loading share:', error);
      setError('Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    setPasswordRequired(false);
    loadShare(password);
  };

  const handleApprove = async (postId) => {
    if (!share) return;

    try {
      const response = await fetch(`/api/share/plan/${params.shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType: 'approval',
          postId,
          approved: true,
          comment: null,
          authorName: authorName || 'Anonymous',
          password: verifiedPassword
        })
      });

      if (!response.ok) throw new Error('Failed to approve');

      const data = await response.json();

      // Update feedback state locally without reloading
      setFeedback(prev => [...prev, data.feedback]);
      showToast.success('Post approved!');
    } catch (error) {
      console.error('Error approving:', error);
      showToast.error('Failed to approve post');
    }
  };

  const handleReject = async (postId) => {
    if (!share || !rejectComment.trim()) {
      showToast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`/api/share/plan/${params.shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackType: 'approval',
          postId,
          approved: false,
          comment: rejectComment.trim(),
          authorName: authorName || 'Anonymous',
          password: verifiedPassword
        })
      });

      if (!response.ok) throw new Error('Failed to reject');

      const data = await response.json();

      // Update feedback state locally without reloading
      setFeedback(prev => [...prev, data.feedback]);
      setRejectingPost(null);
      setRejectComment('');
      showToast.success('Feedback submitted');
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast.error('Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '15px' }}>Loading content plan...</p>
      </LoadingContainer>
    );
  }

  if (passwordRequired) {
    return (
      <PasswordContainer>
        <PasswordCard>
          <PasswordIcon>
            <Lock />
          </PasswordIcon>
          <PasswordTitle>Protected Content</PasswordTitle>
          <PasswordDescription>
            Enter the password to view this content plan.
          </PasswordDescription>
          <form onSubmit={handlePasswordSubmit}>
            {passwordError && <ErrorText>{passwordError}</ErrorText>}
            <PasswordInput
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <PasswordSubmit type="submit">
              Access Content
            </PasswordSubmit>
          </form>
        </PasswordCard>
      </PasswordContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Lock />
        <h2>Unable to Load</h2>
        <p>{error}</p>
      </ErrorContainer>
    );
  }

  if (!share) {
    return (
      <ErrorContainer>
        <Lock />
        <h2>Not Found</h2>
        <p>This share link is invalid or has been removed.</p>
      </ErrorContainer>
    );
  }

  const getPostApproval = (postId) => {
    return feedback.find(fb => fb.post_id === postId && fb.feedback_type === 'approval');
  };

  const getPrimaryPlatform = (platforms) => {
    if (!platforms || platforms.length === 0) return null;
    return PLATFORM_CONFIG[platforms[0]];
  };

  // Extract caption text (without hashtags) and hashtags separately
  const extractContentParts = (content) => {
    if (!content) return { caption: '', hashtags: '' };

    // Find hashtags (words starting with #)
    const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
    const hashtags = content.match(hashtagRegex) || [];

    // Remove hashtags from caption
    let caption = content.replace(hashtagRegex, '').trim();
    // Clean up extra whitespace
    caption = caption.replace(/\s+/g, ' ').trim();

    return {
      caption,
      hashtags: hashtags.join(' ')
    };
  };

  // Calculate stats
  const totalPosts = posts.length;
  const approvedPosts = posts.filter(p => {
    const approval = getPostApproval(p.id);
    return approval?.approved === true;
  }).length;
  const pendingPosts = posts.filter(p => !getPostApproval(p.id)).length;

  // Get unique platforms from all posts
  const uniquePlatforms = [...new Set(posts.flatMap(p => p.platforms || []))];

  // Count posts per platform
  const platformCounts = uniquePlatforms.reduce((acc, platform) => {
    acc[platform] = posts.filter(p => p.platforms?.includes(platform)).length;
    return acc;
  }, {});

  // Filter posts by selected platform (null means show all)
  const filteredPosts = (!selectedPlatform
    ? posts
    : posts.filter(p => p.platforms?.includes(selectedPlatform))
  ).sort((a, b) => {
    // Sort by scheduled_for date (earliest first)
    if (!a.scheduled_for && !b.scheduled_for) return 0;
    if (!a.scheduled_for) return 1; // Posts without dates go to the end
    if (!b.scheduled_for) return -1;
    return new Date(a.scheduled_for) - new Date(b.scheduled_for);
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Calculate time remaining until deadline
  const getTimeRemaining = () => {
    if (!share?.expires_at) return null;

    const now = new Date();
    const deadline = new Date(share.expires_at);
    const diff = deadline - now;

    if (diff <= 0) return { expired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Urgent if less than 24 hours
    const isUrgent = diff < (24 * 60 * 60 * 1000);

    return { days, hours, minutes, isUrgent };
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          {share.client_name && (
            <ClientBadge>
              <Users />
              Shared with {share.client_name}
            </ClientBadge>
          )}
          <HeroTitle>{share.title}</HeroTitle>
          {share.description && (
            <HeroDescription>{share.description}</HeroDescription>
          )}
          <HeroStats>
            <HeroStat>
              <HeroStatValue>{totalPosts}</HeroStatValue>
              <HeroStatLabel>Total Posts</HeroStatLabel>
            </HeroStat>
            <HeroStat>
              <HeroStatValue>{approvedPosts}</HeroStatValue>
              <HeroStatLabel>Approved</HeroStatLabel>
            </HeroStat>
            <HeroStat>
              <HeroStatValue>{pendingPosts}</HeroStatValue>
              <HeroStatLabel>Pending Review</HeroStatLabel>
            </HeroStat>
          </HeroStats>
        </HeroContent>
      </HeroSection>

      {/* Content */}
      <Content>
        <SectionTitle>Content for Review</SectionTitle>

        {/* Deadline Banner */}
        {timeRemaining && !timeRemaining.expired && (
          <DeadlineBanner $urgent={timeRemaining.isUrgent}>
            <DeadlineIcon $urgent={timeRemaining.isUrgent}>
              {timeRemaining.isUrgent ? <AlertTriangle /> : <Clock />}
            </DeadlineIcon>
            <DeadlineContent>
              <DeadlineTitle $urgent={timeRemaining.isUrgent}>
                {timeRemaining.isUrgent ? 'Deadline Approaching!' : 'Review Deadline'}
              </DeadlineTitle>
              <DeadlineText $urgent={timeRemaining.isUrgent}>
                Please approve or comment on the posts before the deadline
              </DeadlineText>
            </DeadlineContent>
            <DeadlineTime>
              {timeRemaining.days > 0 && (
                <TimeBlock>
                  <TimeValue $urgent={timeRemaining.isUrgent}>{timeRemaining.days}</TimeValue>
                  <TimeLabel $urgent={timeRemaining.isUrgent}>Days</TimeLabel>
                </TimeBlock>
              )}
              <TimeBlock>
                <TimeValue $urgent={timeRemaining.isUrgent}>{timeRemaining.hours}</TimeValue>
                <TimeLabel $urgent={timeRemaining.isUrgent}>Hours</TimeLabel>
              </TimeBlock>
              <TimeBlock>
                <TimeValue $urgent={timeRemaining.isUrgent}>{timeRemaining.minutes}</TimeValue>
                <TimeLabel $urgent={timeRemaining.isUrgent}>Min</TimeLabel>
              </TimeBlock>
            </DeadlineTime>
          </DeadlineBanner>
        )}

        {/* Platform Filter Tabs */}
        {uniquePlatforms.length > 1 && (
          <PlatformTabs>
            {uniquePlatforms.map(platform => {
              const config = PLATFORM_CONFIG[platform];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <PlatformTab
                  key={platform}
                  $active={selectedPlatform === platform}
                  $color={config.color}
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <Icon />
                  {config.label}
                  <TabCount $active={selectedPlatform === platform} $color={config.color}>
                    {platformCounts[platform]}
                  </TabCount>
                </PlatformTab>
              );
            })}
          </PlatformTabs>
        )}

        <PostsGrid>
          {paginatedPosts.length === 0 ? (
            <EmptyState>
              <Calendar />
              <h3>No Posts Yet</h3>
              <p>This content plan doesn't have any posts to review.</p>
            </EmptyState>
          ) : (
            paginatedPosts.map((post) => {
              const postApproval = getPostApproval(post.id);
              const platform = getPrimaryPlatform(post.platforms);
              const hasMedia = post.post_media && post.post_media.length > 0;
              const firstMedia = hasMedia ? post.post_media[0] : null;
              const isVideo = firstMedia && (firstMedia.mime_type?.startsWith('video/') || firstMedia.media_type === 'video');
              const isRejecting = rejectingPost === post.id;

              return (
                <PostCard key={post.id}>
                  <PostHeader>
                    {platform && (
                      <PlatformAvatar $color={platform.color}>
                        <platform.icon />
                      </PlatformAvatar>
                    )}
                    <PostMeta>
                      <PlatformName>
                        {(post.platforms || []).map(p => PLATFORM_CONFIG[p]?.label).filter(Boolean).join(', ') || 'Post'}
                      </PlatformName>
                      <PostDate>
                        <Calendar />
                        {post.scheduled_for ? new Date(post.scheduled_for).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Not scheduled'}
                      </PostDate>
                    </PostMeta>
                    {postApproval && (
                      <ApprovalBadge $approved={postApproval.approved}>
                        {postApproval.approved ? 'Approved' : 'Needs Changes'}
                      </ApprovalBadge>
                    )}
                  </PostHeader>

                  {hasMedia ? (
                    <MediaContainer>
                      {isVideo ? (
                        <>
                          <MediaVideo
                            src={firstMedia.file_url}
                            poster={firstMedia.thumbnail_url}
                          />
                          <VideoOverlay>
                            <Play />
                          </VideoOverlay>
                        </>
                      ) : (
                        <MediaImage src={firstMedia.file_url} alt="Post media" />
                      )}
                      {post.post_media.length > 1 && (
                        <MediaCount>+{post.post_media.length - 1} more</MediaCount>
                      )}
                      {/* Repeating watermark pattern - hard for AI to remove */}
                      <MediaWatermarkOverlay>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <WatermarkText key={i}>SocialPlan</WatermarkText>
                        ))}
                      </MediaWatermarkOverlay>
                      <MediaWatermarkBadge>
                        <span>Preview</span>
                      </MediaWatermarkBadge>
                    </MediaContainer>
                  ) : (
                    <NoMediaPlaceholder>
                      <MessageSquare size={28} />
                      Text post
                      <MediaWatermarkBadge>
                        <span>Preview</span>
                      </MediaWatermarkBadge>
                    </NoMediaPlaceholder>
                  )}

                  {post.content && (() => {
                    const { caption, hashtags } = extractContentParts(post.content);
                    return (
                      <CaptionSection>
                        {caption && <Caption>{caption}</Caption>}
                        {hashtags && <Hashtags>{hashtags}</Hashtags>}
                        <SeeMoreBtn onClick={() => setSelectedPost(post)}>
                          <Maximize2 />
                          View full post
                        </SeeMoreBtn>
                      </CaptionSection>
                    );
                  })()}

                  <ApprovalArea>
                    {postApproval ? (
                      <ApprovalStatus $approved={postApproval.approved}>
                        <ApprovalStatusHeader>
                          {postApproval.approved ? <CheckCircle /> : <XCircle />}
                          {postApproval.approved ? 'Approved' : 'Changes Requested'} by {postApproval.author_name}
                        </ApprovalStatusHeader>
                        {postApproval.comment && (
                          <ApprovalComment>"{postApproval.comment}"</ApprovalComment>
                        )}
                      </ApprovalStatus>
                    ) : (
                      <>
                        <ApprovalButtons>
                          <ApproveBtn
                            className="approve"
                            onClick={() => handleApprove(post.id)}
                          >
                            <CheckCircle />
                            Approve
                          </ApproveBtn>
                          <ApproveBtn
                            className="reject"
                            onClick={() => setRejectingPost(post.id)}
                          >
                            <XCircle />
                            Request Changes
                          </ApproveBtn>
                        </ApprovalButtons>

                        {isRejecting && (
                          <RejectModal>
                            <RejectModalTitle>What changes are needed?</RejectModalTitle>
                            <RejectTextarea
                              placeholder="Please describe what needs to be changed..."
                              value={rejectComment}
                              onChange={(e) => setRejectComment(e.target.value)}
                              autoFocus
                            />
                            <RejectActions>
                              <RejectCancelBtn onClick={() => {
                                setRejectingPost(null);
                                setRejectComment('');
                              }}>
                                Cancel
                              </RejectCancelBtn>
                              <RejectConfirmBtn
                                onClick={() => handleReject(post.id)}
                                disabled={!rejectComment.trim()}
                              >
                                Submit Feedback
                              </RejectConfirmBtn>
                            </RejectActions>
                          </RejectModal>
                        )}
                      </>
                    )}
                  </ApprovalArea>
                </PostCard>
              );
            })
          )}
        </PostsGrid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PageButton
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </PageButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PageButton
                    key={page}
                    $active={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageButton>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <PageInfo key={page}>...</PageInfo>;
              }
              return null;
            })}

            <PageButton
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </PageButton>
          </Pagination>
        )}

        <Watermark>
          Powered by <a href="/">SocialPlan</a>
        </Watermark>
      </Content>

      {/* Full Post Modal */}
      {selectedPost && (() => {
        const platform = getPrimaryPlatform(selectedPost.platforms);
        const hasMedia = selectedPost.post_media && selectedPost.post_media.length > 0;
        const firstMedia = hasMedia ? selectedPost.post_media[0] : null;
        const isVideo = firstMedia && (firstMedia.mime_type?.startsWith('video/') || firstMedia.media_type === 'video');
        const { caption, hashtags } = extractContentParts(selectedPost.content);
        const postApproval = getPostApproval(selectedPost.id);

        return (
          <ModalOverlay onClick={() => setSelectedPost(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {platform && (
                    <ModalPlatformIcon $color={platform.color}>
                      <platform.icon />
                    </ModalPlatformIcon>
                  )}
                  <ModalPlatformInfo>
                    <h3>{(selectedPost.platforms || []).map(p => PLATFORM_CONFIG[p]?.label).filter(Boolean).join(', ') || 'Post'}</h3>
                    <span>
                      {selectedPost.scheduled_for ? new Date(selectedPost.scheduled_for).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Not scheduled'}
                    </span>
                  </ModalPlatformInfo>
                </ModalTitle>
                <ModalCloseBtn onClick={() => setSelectedPost(null)}>
                  <X />
                </ModalCloseBtn>
              </ModalHeader>

              <ModalBody>
                <ModalMediaSection>
                  {hasMedia ? (
                    isVideo ? (
                      <ModalVideo
                        src={firstMedia.file_url}
                        poster={firstMedia.thumbnail_url}
                        controls
                        autoPlay
                      />
                    ) : (
                      <ModalMedia src={firstMedia.file_url} alt="Post media" />
                    )
                  ) : (
                    <NoMediaPlaceholder style={{ width: '100%', height: '100%', aspectRatio: 'auto', minHeight: '300px' }}>
                      <MessageSquare size={48} />
                      Text post
                    </NoMediaPlaceholder>
                  )}
                  {/* Watermark in modal too */}
                  <MediaWatermarkOverlay>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <WatermarkText key={i}>SocialPlan</WatermarkText>
                    ))}
                  </MediaWatermarkOverlay>
                </ModalMediaSection>

                <ModalTextSection>
                  <ModalCaptionArea>
                    {caption && <ModalCaption>{caption}</ModalCaption>}
                    {hashtags && <ModalHashtags>{hashtags}</ModalHashtags>}
                  </ModalCaptionArea>

                  <ModalApprovalSection>
                    {postApproval ? (
                      <ApprovalStatus $approved={postApproval.approved}>
                        <ApprovalStatusHeader>
                          {postApproval.approved ? <CheckCircle /> : <XCircle />}
                          {postApproval.approved ? 'Approved' : 'Changes Requested'} by {postApproval.author_name}
                        </ApprovalStatusHeader>
                        {postApproval.comment && (
                          <ApprovalComment>"{postApproval.comment}"</ApprovalComment>
                        )}
                      </ApprovalStatus>
                    ) : (
                      <ApprovalButtons>
                        <ApproveBtn
                          className="approve"
                          onClick={() => {
                            handleApprove(selectedPost.id);
                            setSelectedPost(null);
                          }}
                        >
                          <CheckCircle />
                          Approve
                        </ApproveBtn>
                        <ApproveBtn
                          className="reject"
                          onClick={() => {
                            setRejectingPost(selectedPost.id);
                            setSelectedPost(null);
                          }}
                        >
                          <XCircle />
                          Request Changes
                        </ApproveBtn>
                      </ApprovalButtons>
                    )}
                  </ModalApprovalSection>
                </ModalTextSection>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        );
      })()}
    </Container>
  );
}
