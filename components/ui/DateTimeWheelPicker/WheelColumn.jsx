/**
 * iOS-Style Wheel Column Component
 * Handles smooth scrolling, snap-to-center, and touch/mouse events
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { WheelColumnContainer, WheelScroller, WheelItem } from './styled';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

export default function WheelColumn({
  items = [],
  value,
  onChange,
  width = '110px',
}) {
  const [offset, setOffset] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const scrollerRef = useRef(null);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef(null);

  // Find current value index
  const currentIndex = items.findIndex(item =>
    typeof item === 'object' ? item.value === value : item === value
  );

  // Initialize offset based on current value
  useEffect(() => {
    if (currentIndex >= 0) {
      const targetOffset = CENTER_INDEX * ITEM_HEIGHT - currentIndex * ITEM_HEIGHT;
      setOffset(targetOffset);
    }
  }, [currentIndex]);

  // Calculate which item is currently centered
  const getCenteredIndex = useCallback((currentOffset) => {
    const index = Math.round(-currentOffset / ITEM_HEIGHT + CENTER_INDEX);
    return Math.max(0, Math.min(items.length - 1, index));
  }, [items.length]);

  // Snap to nearest item
  const snapToNearest = useCallback((currentOffset, velocity = 0) => {
    const centeredIndex = getCenteredIndex(currentOffset);
    const targetOffset = CENTER_INDEX * ITEM_HEIGHT - centeredIndex * ITEM_HEIGHT;

    setIsSnapping(true);
    setOffset(targetOffset);

    setTimeout(() => {
      setIsSnapping(false);
      const item = items[centeredIndex];
      const newValue = typeof item === 'object' ? item.value : item;
      if (newValue !== value) {
        onChange?.(newValue);
      }
    }, 200);
  }, [getCenteredIndex, items, value, onChange]);

  // Handle momentum scrolling
  const applyMomentum = useCallback(() => {
    if (Math.abs(velocityRef.current) < 1) {
      snapToNearest(offset, velocityRef.current);
      return;
    }

    const newOffset = offset + velocityRef.current;
    const maxOffset = CENTER_INDEX * ITEM_HEIGHT;
    const minOffset = CENTER_INDEX * ITEM_HEIGHT - (items.length - 1) * ITEM_HEIGHT;

    const boundedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset));
    setOffset(boundedOffset);

    velocityRef.current *= 0.82; // Friction
    animationRef.current = requestAnimationFrame(applyMomentum);
  }, [offset, items.length, snapToNearest]);

  // Mouse/Touch Start
  const handleStart = useCallback((clientY) => {
    setIsDragging(true);
    setIsSnapping(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startYRef.current = clientY;
    lastYRef.current = clientY;
    startOffsetRef.current = offset;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  }, [offset]);

  // Mouse/Touch Move
  const handleMove = useCallback((clientY) => {
    if (!isDragging) return;

    const deltaY = clientY - startYRef.current;
    const newOffset = startOffsetRef.current + deltaY;

    // Calculate velocity
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    if (deltaTime > 0) {
      velocityRef.current = (clientY - lastYRef.current) / deltaTime * 1.5;
    }
    lastYRef.current = clientY;
    lastTimeRef.current = now;

    const maxOffset = CENTER_INDEX * ITEM_HEIGHT;
    const minOffset = CENTER_INDEX * ITEM_HEIGHT - (items.length - 1) * ITEM_HEIGHT;

    // Add resistance at bounds
    let boundedOffset = newOffset;
    if (newOffset > maxOffset) {
      boundedOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    } else if (newOffset < minOffset) {
      boundedOffset = minOffset + (newOffset - minOffset) * 0.3;
    }

    setOffset(boundedOffset);
  }, [isDragging, items.length]);

  // Mouse/Touch End
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    // Always snap immediately, no momentum
    snapToNearest(offset, 0);
  }, [offset, snapToNearest]);

  // Mouse Events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch Events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Keyboard Events
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.max(0, currentIndex - 1);
      const targetOffset = CENTER_INDEX * ITEM_HEIGHT - newIndex * ITEM_HEIGHT;
      snapToNearest(targetOffset, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.min(items.length - 1, currentIndex + 1);
      const targetOffset = CENTER_INDEX * ITEM_HEIGHT - newIndex * ITEM_HEIGHT;
      snapToNearest(targetOffset, 0);
    }
  };

  // Mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ITEM_HEIGHT : ITEM_HEIGHT;
    snapToNearest(offset + delta, 0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Global mouse move/up listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const centeredIndex = getCenteredIndex(offset);

  return (
    <WheelColumnContainer
      $width={width}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <WheelScroller
        ref={scrollerRef}
        $offset={offset}
        $isSnapping={isSnapping}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => {
          const label = typeof item === 'object' ? item.label : item;
          const distance = index - centeredIndex;
          const isCenter = index === centeredIndex;

          return (
            <WheelItem
              key={index}
              $isCenter={isCenter}
              $distance={distance}
            >
              {label}
            </WheelItem>
          );
        })}
      </WheelScroller>
    </WheelColumnContainer>
  );
}
