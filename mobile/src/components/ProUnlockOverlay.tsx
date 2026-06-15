import React from 'react';
import { SuccessCelebration } from '@/components/SuccessCelebration';
import { useEntitlement } from '@/context/EntitlementContext';

/**
 * App-wide "You're Pro now!" celebration. Mounted once at the root so it fires
 * from any screen the moment entitlement flips true — a purchase on the
 * paywall, an account sign-in, or a redeemed access code.
 */
export function ProUnlockOverlay() {
  const { justUnlocked, clearJustUnlocked } = useEntitlement();
  return (
    <SuccessCelebration
      visible={justUnlocked}
      title="You're Pro now!"
      subtitle="Everything is unlocked. Enjoy Boomer AI."
      onDone={clearJustUnlocked}
    />
  );
}
