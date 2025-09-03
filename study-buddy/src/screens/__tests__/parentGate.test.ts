import { generateParentGate } from '@utils/config/constants';

describe('Parent gate generation', () => {
  it('generates valid question/answer for age template', () => {
    const gate = generateParentGate({ parentGate: { minNumber: 10, maxNumber: 30, operation: 'addition' } as any });
    expect(gate.question).toMatch(/What|\?|\d+/);
    expect(gate.answer).toMatch(/^\d+$/);
  });
});
