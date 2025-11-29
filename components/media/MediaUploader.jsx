/**
 * Media Uploader Component
 *
 * Drag-and-drop file uploader for images and videos
 * Supports batch uploads with progress tracking
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Video, Loader } from 'lucide-react';
import { uploadMediaBatch, validateMediaFile, formatFileSize, getMediaCategory } from '@/lib/media-storage';
import { showToast } from '@/components/ui/Toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const UploaderContainer = styled.div`
  width: 100%;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.$isDragging ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing['3xl']};
  text-align: center;
  background: ${props => props.$isDragging ? `${props.theme.colors.primary.main}10` : props.theme.colors.neutral[50]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.medium};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}08`};
    transform: translateY(-2px);
  }

  ${props => props.$disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  `}
`;

const UploadIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => `${props.theme.colors.primary.main}15`};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const UploadDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const UploadHint = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => {
    if (props.$status === 'uploading') return `${props.theme.colors.info.main}15`;
    if (props.$status === 'success') return `${props.theme.colors.success.main}15`;
    if (props.$status === 'error') return `${props.theme.colors.error.main}15`;
    return props.theme.colors.neutral[100];
  }};
  color: ${props => {
    if (props.$status === 'uploading') return props.theme.colors.info.main;
    if (props.$status === 'success') return props.theme.colors.success.main;
    if (props.$status === 'error') return props.theme.colors.error.main;
    return props.theme.colors.text.secondary;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const FileThumbnail = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.md};
  object-fit: cover;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMetadata = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => {
    if (props.$status === 'uploading') return props.theme.colors.info.main;
    if (props.$status === 'success') return props.theme.colors.success.main;
    if (props.$status === 'error') return props.theme.colors.error.main;
    return props.theme.colors.text.secondary;
  }};
  flex-shrink: 0;
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.error.light}20;
    color: ${props => props.theme.colors.error.main};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.full};
  transition: width ${props => props.theme.transitions.medium};
  width: ${props => props.$progress}%;
`;

export default function MediaUploader({
  onUploadComplete,
  onUploadStart,
  onUploadProgress,
  allowedTypes = ['image/*', 'video/*'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  multiple = true,
  autoUpload = false,
  showPreview = true,
}) {
  const { currentWorkspace } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Handle file selection
  const handleFiles = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    // Validate files
    const validatedFiles = fileArray.map(file => {
      const validation = validateMediaFile(file, {
        maxSize: maxFileSize,
        allowedTypes,
      });

      return {
        file,
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category: getMediaCategory(file.type),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        status: validation.valid ? 'pending' : 'error',
        error: validation.errors[0] || null,
        progress: 0,
      };
    });

    setFiles(prev => [...prev, ...validatedFiles]);

    // Auto-upload if enabled
    if (autoUpload) {
      handleUpload(validatedFiles);
    }
  }, [allowedTypes, maxFileSize, autoUpload]);

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      if (!multiple && droppedFiles.length > 1) {
        showToast.error('Please select only one file');
        return;
      }
      handleFiles(droppedFiles);
    }
  };

  // Handle click to select files
  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  // Handle upload
  const handleUpload = async (filesToUpload = files) => {
    if (!currentWorkspace) {
      showToast.error('No workspace selected');
      return;
    }

    // Filter out files that are already uploaded or have errors
    const pendingFiles = filesToUpload.filter(f => f.status === 'pending');

    if (pendingFiles.length === 0) {
      showToast.error('No files to upload');
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    // Update status to uploading
    setFiles(prev => prev.map(f =>
      pendingFiles.find(pf => pf.id === f.id)
        ? { ...f, status: 'uploading' }
        : f
    ));

    try {
      const fileObjects = pendingFiles.map(f => f.file);

      const { results, errors } = await uploadMediaBatch(
        fileObjects,
        currentWorkspace.id,
        (current, total) => {
          const progress = Math.round((current / total) * 100);
          onUploadProgress?.(progress);

          // Update individual file progress
          setFiles(prev => prev.map((f, index) => {
            if (index < current && f.status === 'uploading') {
              return { ...f, status: 'success', progress: 100 };
            }
            return f;
          }));
        }
      );

      // Update final status
      setFiles(prev => prev.map(f => {
        const uploadedResult = results.find(r => r.fileName === f.name);
        if (uploadedResult) {
          return { ...f, status: 'success', result: uploadedResult, progress: 100 };
        }

        const uploadedError = errors.find(e => e.file === f.name);
        if (uploadedError) {
          return { ...f, status: 'error', error: uploadedError.error };
        }

        return f;
      }));

      // Show success/error messages
      if (results.length > 0) {
        showToast.success(`Successfully uploaded ${results.length} file${results.length > 1 ? 's' : ''}`);
        onUploadComplete?.(results);
      }

      if (errors.length > 0) {
        showToast.error(`Failed to upload ${errors.length} file${errors.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('Failed to upload files');

      // Mark all uploading files as error
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error', error: error.message }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file from list
  const handleRemove = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Clear all files
  const handleClear = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  // Get icon for file type
  const getFileIcon = (file) => {
    if (file.status === 'uploading') return <Loader className="spinner" />;
    if (file.status === 'success') return <CheckCircle />;
    if (file.status === 'error') return <AlertCircle />;

    return file.category === 'video' ? <Video /> : <ImageIcon />;
  };

  return (
    <UploaderContainer>
      <DropZone
        $isDragging={isDragging}
        $disabled={isUploading}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon>
          <Upload size={32} />
        </UploadIcon>
        <UploadTitle>
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </UploadTitle>
        <UploadDescription>
          or click to browse from your computer
        </UploadDescription>
        <UploadHint>
          Supports: Images and Videos • Max size: {formatFileSize(maxFileSize)} per file
        </UploadHint>
      </DropZone>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={handleFileInputChange}
      />

      {files.length > 0 && (
        <FileList>
          {files.map(file => (
            <FileItem key={file.id}>
              {showPreview && file.preview ? (
                <FileThumbnail src={file.preview} alt={file.name} />
              ) : (
                <FileIcon $status={file.status}>
                  {getFileIcon(file)}
                </FileIcon>
              )}

              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileMetadata>
                  {formatFileSize(file.size)} • {file.category}
                </FileMetadata>
                {file.status === 'uploading' && (
                  <ProgressBar>
                    <ProgressFill $progress={file.progress} />
                  </ProgressBar>
                )}
              </FileInfo>

              <FileStatus $status={file.status}>
                {file.status === 'pending' && 'Ready'}
                {file.status === 'uploading' && 'Uploading...'}
                {file.status === 'success' && 'Uploaded'}
                {file.status === 'error' && (file.error || 'Failed')}
              </FileStatus>

              {file.status !== 'uploading' && (
                <RemoveButton onClick={() => handleRemove(file.id)}>
                  <X />
                </RemoveButton>
              )}
            </FileItem>
          ))}
        </FileList>
      )}
    </UploaderContainer>
  );
}
