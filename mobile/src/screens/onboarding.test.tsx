import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '@/context/ProfileContext';
import Onboarding from '../../app/onboarding/index';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/context/ProfileContext', () => ({
  useProfile: jest.fn(),
}));

describe('onboarding route', () => {
  const updateProfile = jest.fn();
  const setView = jest.fn();
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    jest.mocked(useProfile).mockReturnValue({
      profile: { level: null, age: null },
      updateProfile,
      setView,
    } as never);
  });

  it('shows overall progress and lets a person skip onboarding with a beginner default', () => {
    render(<Onboarding />);

    expect(screen.getByText('Step 1 of 3')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Skip for now' }));

    expect(updateProfile).toHaveBeenCalledWith({ aiLevel: 0, level: 'Beginner' });
    expect(setView).toHaveBeenCalledWith('app');
    expect(replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('keeps age optional and continues to level selection without storing an age', () => {
    render(<Onboarding />);

    const continueButton = screen.getByRole('button', { name: "Let's Get Started!" });
    expect(continueButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(screen.getByLabelText('Your name'), 'Sam');
    fireEvent.press(screen.getByLabelText('Choose Angela'));
    expect(continueButton.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(continueButton);
    expect(screen.getByText('Would you like to share your age range?')).toBeTruthy();
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'Sam', name: 'Sam', persona: 'Angela' }),
    );

    fireEvent.press(screen.getByRole('button', { name: 'Prefer not to say' }));
    expect(updateProfile).toHaveBeenCalledWith({ age: null, aiLevel: 0 });
    expect(screen.getByText('How would you like to begin?')).toBeTruthy();
  });
});
