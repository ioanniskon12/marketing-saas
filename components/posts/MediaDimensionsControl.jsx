/**
 * Media Dimensions Control Component
 *
 * Allows users to customize media dimensions with aspect ratio locking,
 * presets, and platform-specific recommendations.
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Lock, Unlock, AlertTriangle, Check, Info } from 'lucide-react';
import { Input, Select } from '@/components/ui';
import {
  getDefaultSize,
  getPresets,
  validateDimensions,
  getSizeWarning,
  calculateAspectRatio,
  PLATFORM_CONFIG
} from '@/config/platformConfig';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.neutral[50]};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Title = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$active ? props.theme.colors.primary.main : props.theme.colors.background.paper};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.$active ? props.theme.colors.primary.dark : `${props.theme.colors.primary.main}10`};
  }
`;

const DimensionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${props => props.theme.spacing.md};
  align-items: end;
`;

const AspectRatioLock = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$locked ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  color: ${props => props.$locked ? 'white' : props.theme.colors.text.secondary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: 2px;

  &:hover {
    background: ${props => props.$locked ? props.theme.colors.primary.dark : props.theme.colors.neutral[300]};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const PresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.sm};
`;

const PresetButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary.main : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.$selected ? `${props.theme.colors.primary.main}10` : props.theme.colors.background.paper};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => `${props.theme.colors.primary.main}10`};
  }
`;

const PresetName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const PresetDimensions = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const ValidationMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};

  ${props => props.$type === 'error' && `
    background: ${props.theme.colors.error.light}15;
    color: ${props.theme.colors.error.main};
    border: 2px solid ${props.theme.colors.error.main};
  `}

  ${props => props.$type === 'warning' && `
    background: ${props.theme.colors.warning.light}15;
    color: ${props.theme.colors.warning.main};
    border: 2px solid ${props.theme.colors.warning.main};
  `}

  ${props => props.$type === 'success' && `
    background: ${props.theme.colors.success.light}15;
    color: ${props.theme.colors.success.main};
    border: 2px solid ${props.theme.colors.success.main};
  `}

  ${props => props.$type === 'info' && `
    background: ${props.theme.colors.info.light}15;
    color: ${props.theme.colors.info.main};
    border: 2px solid ${props.theme.colors.info.main};
  `}

  svg {
    flex-shrink: 0;
  }
`;

const CurrentDimensions = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => `${props.theme.colors.primary.main}10`};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};

  strong {
    color: ${props => props.theme.colors.primary.main};
  }
`;

export default function MediaDimensionsControl({
  platform,
  postType = 'post',
  value = null,
  onChange,
  showPresets = true,
}) {
  const [useDefault, setUseDefault] = useState(true);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [warning, setWarning] = useState(null);

  // Get default dimensions and presets
  const defaultSize = platform && postType ? getDefaultSize(platform, postType) : null;
  const presets = platform && postType ? getPresets(platform, postType) : [];

  // Initialize with default or provided value
  useEffect(() => {
    if (value) {
      setUseDefault(false);
      setWidth(value.width.toString());
      setHeight(value.height.toString());
      const ratio = value.width / value.height;
      setAspectRatio(ratio);
    } else if (defaultSize) {
      setWidth(defaultSize.width.toString());
      setHeight(defaultSize.height.toString());
      const ratio = defaultSize.width / defaultSize.height;
      setAspectRatio(ratio);
    }
  }, [platform, postType, defaultSize]);

  // Validate dimensions and check warnings
  useEffect(() => {
    if (width && height) {
      const w = parseInt(width);
      const h = parseInt(height);

      if (!isNaN(w) && !isNaN(h)) {
        // Validate dimensions
        const validationResult = validateDimensions(w, h);
        setValidation(validationResult);

        // Check for platform-specific warnings
        if (platform && postType && !useDefault) {
          const sizeWarning = getSizeWarning(platform, postType, w, h);
          setWarning(sizeWarning);
        } else {
          setWarning(null);
        }

        // Notify parent component
        if (validationResult.isValid && !useDefault) {
          onChange?.({
            width: w,
            height: h,
            aspectRatio: calculateAspectRatio(w, h),
          });
        } else if (useDefault) {
          onChange?.(null); // Use platform default
        }
      }
    }
  }, [width, height, platform, postType, useDefault]);

  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);

    if (aspectRatioLocked && aspectRatio && newWidth) {
      const w = parseInt(newWidth);
      if (!isNaN(w)) {
        const newHeight = Math.round(w / aspectRatio);
        setHeight(newHeight.toString());
      }
    }
  };

  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);

    if (aspectRatioLocked && aspectRatio && newHeight) {
      const h = parseInt(newHeight);
      if (!isNaN(h)) {
        const newWidth = Math.round(h * aspectRatio);
        setWidth(newWidth.toString());
      }
    }
  };

  const toggleAspectRatioLock = () => {
    if (!aspectRatioLocked && width && height) {
      // Lock aspect ratio - calculate current ratio
      const w = parseInt(width);
      const h = parseInt(height);
      if (!isNaN(w) && !isNaN(h)) {
        setAspectRatio(w / h);
      }
    }
    setAspectRatioLocked(!aspectRatioLocked);
  };

  const applyPreset = (preset) => {
    setUseDefault(false);
    setWidth(preset.width.toString());
    setHeight(preset.height.toString());
    const ratio = preset.width / preset.height;
    setAspectRatio(ratio);
    setAspectRatioLocked(true);
  };

  const handleToggleDefault = () => {
    const newUseDefault = !useDefault;
    setUseDefault(newUseDefault);

    if (newUseDefault && defaultSize) {
      setWidth(defaultSize.width.toString());
      setHeight(defaultSize.height.toString());
      onChange?.(null); // Use platform default
    }
  };

  if (!platform || !postType) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>Media Dimensions</Title>
        <ToggleButton
          $active={useDefault}
          onClick={handleToggleDefault}
          type="button"
        >
          {useDefault ? <Check size={14} /> : null}
          Use Platform Default
        </ToggleButton>
      </Header>

      {!useDefault && showPresets && presets.length > 0 && (
        <>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
            Presets
          </div>
          <PresetsGrid>
            {presets.map((preset, index) => (
              <PresetButton
                key={index}
                type="button"
                $selected={width === preset.width.toString() && height === preset.height.toString()}
                onClick={() => applyPreset(preset)}
              >
                <PresetName>{preset.name}</PresetName>
                <PresetDimensions>
                  {preset.width} × {preset.height}
                </PresetDimensions>
                <PresetDimensions style={{ marginTop: '4px' }}>
                  {preset.aspectRatio}
                </PresetDimensions>
              </PresetButton>
            ))}
          </PresetsGrid>
        </>
      )}

      {!useDefault && (
        <>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>
            Custom Dimensions
          </div>
          <DimensionsGrid>
            <Input
              type="number"
              label="Width (px)"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              placeholder="1080"
              min="600"
              max="4096"
            />

            <AspectRatioLock
              $locked={aspectRatioLocked}
              onClick={toggleAspectRatioLock}
              type="button"
              title={aspectRatioLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
              {aspectRatioLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </AspectRatioLock>

            <Input
              type="number"
              label="Height (px)"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              placeholder="1350"
              min="600"
              max="4096"
            />
          </DimensionsGrid>
        </>
      )}

      {/* Current Dimensions Display */}
      {width && height && (
        <CurrentDimensions>
          <strong>Current:</strong> {width} × {height}px ({calculateAspectRatio(parseInt(width), parseInt(height))})
        </CurrentDimensions>
      )}

      {/* Validation Errors */}
      {!validation.isValid && validation.errors.map((error, index) => (
        <ValidationMessage key={index} $type="error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </ValidationMessage>
      ))}

      {/* Platform Warnings */}
      {validation.isValid && warning && (
        <ValidationMessage $type="warning">
          <Info size={18} />
          <span>{warning}</span>
        </ValidationMessage>
      )}

      {/* Success Message */}
      {validation.isValid && !warning && !useDefault && width && height && (
        <ValidationMessage $type="success">
          <Check size={18} />
          <span>Dimensions are valid for {PLATFORM_CONFIG[platform]?.name || platform}</span>
        </ValidationMessage>
      )}

      {/* Default Size Info */}
      {useDefault && defaultSize && (
        <ValidationMessage $type="info">
          <Info size={18} />
          <span>
            Using recommended size: {defaultSize.width} × {defaultSize.height}px ({defaultSize.aspectRatio})
          </span>
        </ValidationMessage>
      )}
    </Container>
  );
}
