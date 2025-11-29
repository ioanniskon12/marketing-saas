/**
 * Excel Import Component
 *
 * Allows users to upload Excel files with social media posts
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import * as XLSX from 'xlsx';

const Container = styled.div`
  width: 100%;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.$isDragActive ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  background: ${props => props.$isDragActive ? `${props.theme.colors.primary.main}10` : props.theme.colors.neutral[50]};
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.primary.main};
`;

const UploadText = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const UploadHint = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewSection = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.paper};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PreviewTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
`;

const PostItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const PostContent = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  white-space: pre-wrap;
  line-height: 1.5;
`;

const PostHashtags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
`;

const HashtagChip = styled.span`
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  padding: 2px 8px;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.error.light};
  color: ${props => props.theme.colors.error.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

export default function ExcelImport({ onImport, onClose }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [parsedPosts, setParsedPosts] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input
    e.target.value = '';
  };

  const parseHashtags = (hashtagText) => {
    if (!hashtagText) return [];

    // Extract hashtags from text (look for #word patterns)
    const hashtags = hashtagText.match(/#[\w]+/g);
    if (!hashtags) return [];

    // Remove # prefix and return unique hashtags
    return [...new Set(hashtags.map(tag => tag.replace('#', '')))];
  };

  const handleFile = async (file) => {
    setError(null);

    // Check if it's an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setFileName(file.name);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Parse posts from Excel
      const posts = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        // Check if this row has captions (skip headers and empty rows)
        const firstCell = row[0];
        if (!firstCell || typeof firstCell !== 'string') continue;

        // If first cell contains hashtags, process caption cells
        const hashtagText = firstCell;
        const hashtags = parseHashtags(hashtagText);

        // Process each caption in this row (columns 1+)
        for (let j = 1; j < row.length; j++) {
          const caption = row[j];
          if (caption && typeof caption === 'string' && caption.trim().length > 0) {
            posts.push({
              content: caption.trim(),
              hashtags: hashtags,
              row: i + 1,
              column: j + 1,
            });
          }
        }
      }

      if (posts.length === 0) {
        setError('No posts found in the Excel file. Make sure you have hashtags in the first column and captions in subsequent columns.');
        return;
      }

      setParsedPosts(posts);
      showToast.success(`Found ${posts.length} post${posts.length > 1 ? 's' : ''} to import`);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setError('Failed to parse Excel file. Please make sure it\'s a valid Excel file.');
    }
  };

  const handleImport = async () => {
    if (parsedPosts.length === 0) return;

    setImporting(true);
    try {
      await onImport(parsedPosts);
      setParsedPosts([]);
      setFileName('');
      if (onClose) onClose();
    } catch (error) {
      console.error('Import error:', error);
      setError('Failed to import posts. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    setParsedPosts([]);
    setFileName('');
    setError(null);
    if (onClose) onClose();
  };

  return (
    <Container>
      {parsedPosts.length === 0 ? (
        <>
          <DropZone
            $isDragActive={isDragActive}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon>
              <FileSpreadsheet size={48} />
            </UploadIcon>
            <UploadText>
              {isDragActive ? 'Drop your Excel file here' : 'Click to upload or drag and drop'}
            </UploadText>
            <UploadHint>
              Excel files (.xlsx, .xls) with hashtags in first column and captions in subsequent columns
            </UploadHint>
          </DropZone>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
          />

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}
        </>
      ) : (
        <PreviewSection>
          <PreviewHeader>
            <PreviewTitle>
              <CheckCircle size={20} />
              {parsedPosts.length} Post{parsedPosts.length > 1 ? 's' : ''} Ready to Import
            </PreviewTitle>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>{fileName}</span>
          </PreviewHeader>

          <PostsList>
            {parsedPosts.map((post, index) => (
              <PostItem key={index}>
                <PostContent>{post.content}</PostContent>
                {post.hashtags.length > 0 && (
                  <PostHashtags>
                    {post.hashtags.map((tag, idx) => (
                      <HashtagChip key={idx}>#{tag}</HashtagChip>
                    ))}
                  </PostHashtags>
                )}
              </PostItem>
            ))}
          </PostsList>

          <ButtonGroup>
            <Button variant="ghost" onClick={handleCancel} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} loading={importing}>
              Import {parsedPosts.length} Post{parsedPosts.length > 1 ? 's' : ''}
            </Button>
          </ButtonGroup>
        </PreviewSection>
      )}
    </Container>
  );
}
