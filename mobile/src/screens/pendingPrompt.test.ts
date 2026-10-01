import {
  consumePendingPrompt,
  setPendingPrompt,
  subscribePendingPrompt,
} from './pendingPrompt';

describe('pending chat prompts', () => {
  beforeEach(() => {
    consumePendingPrompt();
  });

  it('queues one prompt for the chat screen and clears it when consumed', () => {
    setPendingPrompt('Explain this in plain language');

    expect(consumePendingPrompt()).toBe('Explain this in plain language');
    expect(consumePendingPrompt()).toBeNull();
  });

  it('notifies mounted chat listeners and supports unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribePendingPrompt(listener);

    setPendingPrompt('What does this button do?');
    unsubscribe();
    setPendingPrompt('How can I retry?');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('What does this button do?');
  });
});
