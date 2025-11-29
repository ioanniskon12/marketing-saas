/**
 * Best Times Modal for Calendar
 *
 * Shows optimal posting times for each day based on selected country/timezone
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Clock, Search, Check, Calendar } from 'lucide-react';
import { countries, getDayByDayPostingTimes, platformInfo } from '@/lib/data/best-posting-times';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all ${props => props.theme.transitions.fast};
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows['2xl']};
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.95)'};
  transition: all ${props => props.theme.transitions.fast};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 2px solid ${props => props.theme.colors.border.default};
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.background.paper};
  z-index: 1;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: linear-gradient(135deg, ${props => props.theme.colors.success.main}, ${props => props.theme.colors.success.dark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${props => props.theme.shadows.md};
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.neutral[200]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  padding-left: 48px;
  background: ${props => props.theme.colors.background.default};
  border: 2px solid ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.fast};

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.success.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.success.main}15;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.secondary};
  pointer-events: none;
`;

const CountryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.default};
  border-radius: ${props => props.theme.borderRadius.lg};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.neutral[100]};
    border-radius: ${props => props.theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.success.main};
    border-radius: ${props => props.theme.borderRadius.sm};
  }
`;

const CountryCard = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$selected
    ? `linear-gradient(135deg, ${props.theme.colors.success.main}15, ${props.theme.colors.success.main}25)`
    : props.theme.colors.background.paper};
  border: 2px solid ${props => props.$selected
    ? props.theme.colors.success.main
    : props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.success.main};
    background: ${props => `linear-gradient(135deg, ${props.theme.colors.success.main}10, ${props.theme.colors.success.main}20)`};
  }
`;

const CountryFlag = styled.span`
  font-size: 24px;
  flex-shrink: 0;
`;

const CountryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CountryName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.success.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'scale(1)' : 'scale(0)'};
  transition: all ${props => props.theme.transitions.fast};
`;

const SelectedCountryBanner = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, ${props => props.theme.colors.success.main}15, ${props => props.theme.colors.success.main}25);
  border: 2px solid ${props => props.theme.colors.success.main};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const SelectedCountryFlag = styled.span`
  font-size: 32px;
`;

const SelectedCountryText = styled.div`
  flex: 1;
`;

const SelectedCountryName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const SelectedCountryTimezone = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const DaysList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.default};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border.default};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.success.main};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const DayLabel = styled.div`
  min-width: 100px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary.main}, ${props => props.theme.colors.primary.dark});
  color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const TimeBadgesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  flex: 1;
`;

const TimeBadge = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.success.main}, ${props => props.theme.colors.success.dark});
  color: white;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.xs};
  box-shadow: ${props => props.theme.shadows.sm};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function BestTimesModal({ isOpen, onClose, onTimezoneChange }) {
  const { currentWorkspace } = useWorkspace();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load saved country preference if exists
    const saved = localStorage.getItem(`calendar_country_${currentWorkspace?.id}`);
    let countryToSet;

    if (saved) {
      const country = countries.find(c => c.code === saved);
      if (country) {
        countryToSet = country;
      } else {
        // Default to Rome (Italy)
        countryToSet = countries[0];
      }
    } else {
      // Default to Rome (Italy)
      countryToSet = countries[0];
    }

    setSelectedCountry(countryToSet);

    // Notify parent about initial timezone
    if (onTimezoneChange && countryToSet) {
      onTimezoneChange(countryToSet.timezone, countryToSet.name);
    }
  }, [currentWorkspace, onTimezoneChange]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    if (currentWorkspace) {
      localStorage.setItem(`calendar_country_${currentWorkspace.id}`, country.code);
    }
    // Notify parent about timezone change
    if (onTimezoneChange) {
      onTimezoneChange(country.timezone, country.name);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.timezone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get day-by-day posting times for Instagram (default platform for calendar context)
  const dayByDayData = selectedCountry
    ? getDayByDayPostingTimes(selectedCountry.region, 'instagram')
    : null;

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal $isOpen={isOpen}>
        <Header>
          <HeaderTitle>
            <IconWrapper>
              <Clock size={20} />
            </IconWrapper>
            <Title>Best Times to Post</Title>
          </HeaderTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <SearchWrapper>
            <SearchIcon>
              <Search size={20} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search for your audience's location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>

          <CountryList>
            {filteredCountries.map((country) => (
              <CountryCard
                key={country.code}
                $selected={selectedCountry?.code === country.code}
                onClick={() => handleCountrySelect(country)}
              >
                <CountryFlag>{country.flag}</CountryFlag>
                <CountryInfo>
                  <CountryName>{country.name}</CountryName>
                </CountryInfo>
                <CheckIcon $visible={selectedCountry?.code === country.code}>
                  <Check size={12} />
                </CheckIcon>
              </CountryCard>
            ))}
          </CountryList>

          {selectedCountry && (
            <>
              <SelectedCountryBanner>
                <SelectedCountryFlag>{selectedCountry.flag}</SelectedCountryFlag>
                <SelectedCountryText>
                  <SelectedCountryName>{selectedCountry.name}</SelectedCountryName>
                  <SelectedCountryTimezone>{selectedCountry.timezone}</SelectedCountryTimezone>
                </SelectedCountryText>
              </SelectedCountryBanner>

              {dayByDayData ? (
                <DaysList>
                  {daysOfWeek.map((day) => {
                    const dayTimes = dayByDayData[day.key];
                    if (!dayTimes || dayTimes.length === 0) return null;

                    return (
                      <DayRow key={day.key}>
                        <DayLabel>{day.label}</DayLabel>
                        <TimeBadgesContainer>
                          {dayTimes.map((slot, index) => (
                            <TimeBadge key={index}>
                              {slot.label}
                            </TimeBadge>
                          ))}
                        </TimeBadgesContainer>
                      </DayRow>
                    );
                  })}
                </DaysList>
              ) : (
                <EmptyState>
                  No data available for this location
                </EmptyState>
              )}
            </>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
}
