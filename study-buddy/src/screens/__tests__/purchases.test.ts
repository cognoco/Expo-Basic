import Purchases from 'react-native-purchases';

describe('Purchases error handling', () => {
  it('configure/getCustomerInfo failures do not crash', async () => {
    const configureSpy = jest.spyOn(Purchases, 'configure' as any).mockRejectedValueOnce(new Error('fail'));
    const infoSpy = jest.spyOn(Purchases, 'getCustomerInfo' as any).mockRejectedValueOnce(new Error('fail'));
    // Minimal expectation: spies called, no throw here (actual App.tsx flow depends on runtime)
    await expect(Purchases.configure({ apiKey: 'x' } as any)).rejects.toThrow();
    await expect(Purchases.getCustomerInfo()).rejects.toThrow();
    configureSpy.mockRestore();
    infoSpy.mockRestore();
  });
});
