import { apiFetchRaw } from './client';
import { sendChat } from './chat';

jest.mock('./client', () => ({
  apiFetchRaw: jest.fn(),
}));

const mockApiFetchRaw = jest.mocked(apiFetchRaw);

describe('sendChat', () => {
  beforeEach(() => {
    mockApiFetchRaw.mockReset();
  });

  it('parses UI-message stream deltas and reports cumulative text', async () => {
    mockApiFetchRaw.mockResolvedValue({
      ok: true,
      text: async () =>
        'data: {"type":"text-delta","delta":"Hello"}\n' +
        'data: {"type":"text-delta","delta":" there"}\n' +
        'data: [DONE]\n',
    } as Response);
    const onDelta = jest.fn();

    const result = await sendChat({
      messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }],
      onDelta,
    });

    expect(result).toBe('Hello there');
    expect(onDelta.mock.calls).toEqual([['Hello'], ['Hello there']]);
  });

  it('surfaces backend errors without hiding their message', async () => {
    mockApiFetchRaw.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Chat service unavailable' }),
    } as Response);

    await expect(
      sendChat({ messages: [{ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }] }),
    ).rejects.toThrow('Chat service unavailable');
  });
});
