import { ensureCameraPermission } from '@utils/permissions';
import * as CameraMod from 'expo-camera';

describe('Camera permission', () => {
  it('denied permission returns granted=false', async () => {
    jest.spyOn(CameraMod.Camera, 'getCameraPermissionsAsync' as any).mockResolvedValueOnce({ granted: false } as any);
    jest.spyOn(CameraMod.Camera, 'requestCameraPermissionsAsync' as any).mockResolvedValueOnce({ granted: false } as any);
    const res = await ensureCameraPermission();
    expect(res.granted).toBe(false);
  });
});
