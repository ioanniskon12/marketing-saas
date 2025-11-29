/**
 * Bulk Importer Component
 *
 * Import posts from Excel files with validation and progress tracking.
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Container = styled.div`
  width: 100%;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.$dragActive ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  background: ${props => props.$dragActive ? `${props.theme.colors.primary.main}10` : props.theme.colors.neutral[50]};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }
`;

const UploadIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary.light};
  color: ${props => props.theme.colors.primary.main};
`;

const UploadText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const UploadHint = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
  justify-content: center;
`;

const ProgressSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary.main};
  transition: width ${props => props.theme.transitions.normal};
  width: ${props => props.$progress}%;
`;

const ProgressText = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ValidationResults = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SummaryCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.paper};
  border: 2px solid ${props => props.$color || props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.$color || props.theme.colors.text.primary};
`;

const SummaryLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: ${props => props.theme.spacing.xs};
`;

const IssuesList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const IssueItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const IssueHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const IssueRow = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.neutral[100]};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const IssueContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
  font-style: italic;
`;

const IssueMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const IssueMessage = styled.div`
  display: flex;
  align-items: start;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$type === 'error' ? props.theme.colors.error.main : props.theme.colors.warning.main};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

export default function BulkImporter({ isOpen, onClose, onImportComplete }) {
  const { currentWorkspace } = useWorkspace();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      showToast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
    setImportResult(null);
    setProgress(0);
  };

  const handleValidate = async () => {
    if (!file || !currentWorkspace) return;

    try {
      setValidating(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspace_id', currentWorkspace.id);
      formData.append('mode', 'validate');

      setProgress(30);

      const response = await fetch('/api/posts/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      setProgress(100);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate file');
      }

      setValidationResult(data.validation);

      if (data.validation.summary.invalid === 0) {
        showToast.success('File validated successfully! All posts are valid.');
      } else {
        showToast.warning(`Found ${data.validation.summary.invalid} invalid posts`);
      }
    } catch (error) {
      console.error('Error validating file:', error);
      showToast.error(error.message || 'Failed to validate file');
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !currentWorkspace) return;

    try {
      setImporting(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspace_id', currentWorkspace.id);
      formData.append('mode', 'import');

      setProgress(20);

      const response = await fetch('/api/posts/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      setProgress(100);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import posts');
      }

      setImportResult(data);

      showToast.success(`Successfully imported ${data.summary.imported} posts!`);

      // Notify parent component
      onImportComplete?.();

      // Reset after short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error importing posts:', error);
      showToast.error(error.message || 'Failed to import posts');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/posts/template');

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'posts-import-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast.error('Failed to download template');
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const canImport = file && validationResult && validationResult.canProceed && !importing;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Posts"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={importing || validating}>
            Cancel
          </Button>
          {file && !importResult && (
            <>
              <Button
                variant="outline"
                onClick={handleValidate}
                loading={validating}
                disabled={importing || validating}
              >
                Validate
              </Button>
              <Button
                onClick={handleImport}
                loading={importing}
                disabled={!canImport}
              >
                Import Posts
              </Button>
            </>
          )}
        </>
      }
    >
      <Container>
        {!file && (
          <>
            <UploadArea
              $dragActive={dragActive}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon>
                <FileSpreadsheet size={32} />
              </UploadIcon>
              <UploadText>
                {dragActive ? 'Drop file here' : 'Drag & drop Excel file here'}
              </UploadText>
              <UploadHint>or click to browse (max 10MB)</UploadHint>
            </UploadArea>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            <Actions>
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
            </Actions>
          </>
        )}

        {file && !importResult && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <FileText size={24} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={importing || validating}
              >
                <X size={16} />
              </Button>
            </div>

            {(validating || importing) && (
              <ProgressSection>
                <ProgressBar>
                  <ProgressFill $progress={progress} />
                </ProgressBar>
                <ProgressText>
                  {validating ? 'Validating...' : 'Importing...'} {progress}%
                </ProgressText>
              </ProgressSection>
            )}

            {validationResult && (
              <ValidationResults>
                <Summary>
                  <SummaryCard>
                    <SummaryValue>{validationResult.summary.total}</SummaryValue>
                    <SummaryLabel>Total Posts</SummaryLabel>
                  </SummaryCard>

                  <SummaryCard $color="#10b981">
                    <SummaryValue $color="#10b981">
                      {validationResult.summary.valid}
                    </SummaryValue>
                    <SummaryLabel>Valid</SummaryLabel>
                  </SummaryCard>

                  <SummaryCard $color="#ef4444">
                    <SummaryValue $color="#ef4444">
                      {validationResult.summary.invalid}
                    </SummaryValue>
                    <SummaryLabel>Invalid</SummaryLabel>
                  </SummaryCard>

                  {validationResult.summary.warnings > 0 && (
                    <SummaryCard $color="#f59e0b">
                      <SummaryValue $color="#f59e0b">
                        {validationResult.summary.warnings}
                      </SummaryValue>
                      <SummaryLabel>Warnings</SummaryLabel>
                    </SummaryCard>
                  )}
                </Summary>

                {validationResult.issues && validationResult.issues.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                      Issues Found:
                    </h4>
                    <IssuesList>
                      {validationResult.issues.map((issue, index) => (
                        <IssueItem key={index}>
                          <IssueHeader>
                            <IssueRow>Row {issue.row}</IssueRow>
                            <AlertCircle size={16} color="#ef4444" />
                          </IssueHeader>
                          <IssueContent>"{issue.content}"</IssueContent>
                          <IssueMessages>
                            {issue.errors.map((error, i) => (
                              <IssueMessage key={`error-${i}`} $type="error">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                              </IssueMessage>
                            ))}
                            {issue.warnings && issue.warnings.map((warning, i) => (
                              <IssueMessage key={`warning-${i}`} $type="warning">
                                <AlertTriangle size={14} />
                                <span>{warning}</span>
                              </IssueMessage>
                            ))}
                          </IssueMessages>
                        </IssueItem>
                      ))}
                    </IssuesList>
                  </div>
                )}

                {validationResult.duplicates && validationResult.duplicates.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
                      Duplicate Content Detected:
                    </h4>
                    <IssuesList>
                      {validationResult.duplicates.map((dup, index) => (
                        <IssueItem key={index}>
                          <IssueHeader>
                            <IssueRow>Row {dup.rowNumber}</IssueRow>
                            <AlertTriangle size={16} color="#f59e0b" />
                          </IssueHeader>
                          <IssueContent>"{dup.content}"</IssueContent>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            Duplicate of row {dup.duplicateOf}
                          </div>
                        </IssueItem>
                      ))}
                    </IssuesList>
                  </div>
                )}

                {validationResult.summary.invalid === 0 && (
                  <EmptyState>
                    <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                      All posts are valid!
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '8px' }}>
                      Click "Import Posts" to proceed
                    </div>
                  </EmptyState>
                )}
              </ValidationResults>
            )}
          </>
        )}

        {importResult && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Import Complete!
            </h3>
            <div style={{ fontSize: '14px', color: '#6B7280' }}>
              Successfully imported {importResult.summary.imported} of {importResult.summary.total} posts
            </div>
            {importResult.summary.failed > 0 && (
              <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>
                {importResult.summary.failed} posts failed to import
              </div>
            )}
          </div>
        )}
      </Container>
    </Modal>
  );
}
