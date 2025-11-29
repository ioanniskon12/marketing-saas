/**
 * Test Media Page
 *
 * Test page for MediaUploader and MediaLibrarySelector components
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import MediaUploader from '@/components/media/MediaUploader';
import MediaLibrarySelector from '@/components/media/MediaLibrarySelector';
import { Button } from '@/components/ui';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing['3xl']};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing['3xl']};
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const SectionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
`;

const SelectedFiles = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const SelectedTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const FileThumbnail = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.sm};
  object-fit: cover;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const FileSize = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const StatusBadge = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.success.main}20;
  color: ${props => props.theme.colors.success.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function TestMediaPage() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (results) => {
    console.log('Upload complete:', results);
    setUploadedFiles(prev => [...results, ...prev]);
    alert(`Success! Uploaded ${results.length} file${results.length > 1 ? 's' : ''}`);
  };

  const handleMediaSelect = (files) => {
    console.log('Selected files:', files);
    setSelectedFiles(files);
    setShowLibrary(false);
    alert(`Selected ${files.length} file${files.length > 1 ? 's' : ''} from library`);
  };

  return (
    <Container>
      <Title>🧪 Test Media System</Title>

      {/* Section 1: Upload Test */}
      <Section>
        <SectionTitle>1. Test Media Uploader</SectionTitle>
        <SectionDescription>
          Drag and drop files here or click to browse. This tests the batch upload functionality with progress tracking.
        </SectionDescription>

        <MediaUploader
          onUploadComplete={handleUploadComplete}
          onUploadStart={() => console.log('Upload started')}
          onUploadProgress={(progress) => console.log('Progress:', progress)}
          multiple={true}
          autoUpload={false}
          showPreview={true}
        />

        {uploadedFiles.length > 0 && (
          <SelectedFiles>
            <SelectedTitle>Recently Uploaded ({uploadedFiles.length})</SelectedTitle>
            <FileList>
              {uploadedFiles.slice(0, 5).map((file, index) => (
                <FileItem key={index}>
                  <FileThumbnail src={file.url} alt={file.fileName} />
                  <FileInfo>
                    <FileName>{file.fileName}</FileName>
                    <FileSize>{formatBytes(file.fileSize)} • {file.mimeType}</FileSize>
                  </FileInfo>
                  <StatusBadge>✓ Uploaded</StatusBadge>
                </FileItem>
              ))}
            </FileList>
          </SelectedFiles>
        )}
      </Section>

      {/* Section 2: Library Test */}
      <Section>
        <SectionTitle>2. Test Media Library Selector</SectionTitle>
        <SectionDescription>
          Click the button below to open the media library modal. You can search, filter, and select files from your workspace.
        </SectionDescription>

        <Button
          variant="primary"
          onClick={() => setShowLibrary(true)}
        >
          📚 Open Media Library
        </Button>

        {selectedFiles.length > 0 ? (
          <SelectedFiles>
            <SelectedTitle>Selected from Library ({selectedFiles.length})</SelectedTitle>
            <FileList>
              {selectedFiles.map((file) => (
                <FileItem key={file.id}>
                  <FileThumbnail src={file.url} alt={file.name} />
                  <FileInfo>
                    <FileName>{file.name}</FileName>
                    <FileSize>{formatBytes(file.size)} • {file.mimeType}</FileSize>
                  </FileInfo>
                  <StatusBadge>✓ Selected</StatusBadge>
                </FileItem>
              ))}
            </FileList>
          </SelectedFiles>
        ) : (
          <SelectedFiles>
            <EmptyState>
              No files selected from library yet. Click "Open Media Library" to select files.
            </EmptyState>
          </SelectedFiles>
        )}
      </Section>

      {/* Media Library Modal */}
      <MediaLibrarySelector
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleMediaSelect}
        multiSelect={true}
        allowedTypes={['image', 'video']}
        maxSelection={10}
      />
    </Container>
  );
}
