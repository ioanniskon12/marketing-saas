/**
 * Dark Mode Toggle Component
 *
 * A button to toggle between light and dark themes
 */

"use client";

import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ToggleButton = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border: 2px solid ${({ theme }) => theme.colors.primary.light};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  transition: all ${({ theme }) => theme.transitions.base};
  z-index: ${({ theme }) => theme.zIndex.fixed};
  backdrop-filter: blur(8px);

  &:hover {
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 8px 24px ${({ theme }) => theme.colors.primary.main}50;
    border-color: ${({ theme }) => theme.colors.primary.contrast};
  }

  &:active {
    transform: scale(0.95) rotate(0deg);
  }

  svg {
    width: 24px;
    height: 24px;
    transition: transform ${({ theme }) => theme.transitions.base};
  }

  &:hover svg {
    transform: rotate(20deg);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    bottom: ${({ theme }) => theme.spacing.lg};
    right: ${({ theme }) => theme.spacing.lg};
    width: 48px;
    height: 48px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleButton
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun /> : <Moon />}
    </ToggleButton>
  );
}
