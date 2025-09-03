import { Camera } from 'expo-camera';
import { ensureCameraPermission } from '@utils/permissions';
import { savePhoto as savePhotoToDisk, cleanOldPhotos } from '@utils/media/photoManager';
import { getJson } from '@utils/core/storageKeys';
import { z } from 'zod';
import { Analytics } from '@utils/analytics/events';

type CameraRefLike = { takePictureAsync: (opts?: any) => Promise<{ uri: string }> } | null | undefined;

const PhotoSettingsSchema = z.object({
  autoDeleteDays: z.number().int().min(1).max(365).default(7),
  privacyOverlay: z.boolean().default(false),
});

export async function takeProofPhoto(cameraRef?: CameraRefLike, ageGroup: string = 'elementary'): Promise<string | null> {
  const perm = await ensureCameraPermission();
  if (!perm.granted) return null;

  // If a Camera ref is provided (screen-managed camera), capture using it
  if (cameraRef && typeof cameraRef.takePictureAsync === 'function') {
    const photo = await cameraRef.takePictureAsync();
    const saved = await savePhoto(photo.uri, ageGroup);
    return saved;
  }

  // Fallback: no ref provided — cannot capture without UI camera. Return null.
  return null;
}

export async function savePhoto(uri: string, ageGroup: string = 'elementary'): Promise<string> {
  // Respect privacy settings (overlay is a visual concern handled by UI; photos are stored locally only)
  const settings = await getJson('photoSettings' as any, PhotoSettingsSchema, { autoDeleteDays: 7, privacyOverlay: false });
  const savedUri = await savePhotoToDisk(uri);
  Analytics.proofPhotoCaptured({ ageGroup, uri: savedUri });
  // Opportunistic cleanup
  cleanOldPhotos().catch(() => {});
  return savedUri;
}

export { cleanOldPhotos };
