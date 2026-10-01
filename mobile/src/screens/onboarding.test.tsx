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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue({ replace: jest.fn() } as never);
    jest.mocked(useProfile).mockReturnValue({
      updateProfile,
      setView,
    } as never);
  });

  it('requires a name and guide before continuing to the next step', () => {
    render(<Onboarding />);

    const continueButton = screen.getByRole('button', { name: "Let's Get Started!" });
    expect(continueButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(screen.getByLabelText('Your name'), 'Sam');
    fireEvent.press(screen.getByLabelText('Choose Angela'));
    expect(continueButton.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(continueButton);
    expect(screen.getByText('Your age range?')).toBeTruthy();
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'Sam', name: 'Sam', persona: 'Angela' }),
    );
  });
});
