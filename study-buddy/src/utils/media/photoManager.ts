import * as FileSystem from 'expo-file-system';
import { getStorageItem, setStorageItem } from '@utils/core/storage';

const PHOTO_DIR = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + 'StudyBuddyPhotos/';
const PHOTO_INDEX_KEY = 'photoIndex';

// Ensure photo directory exists
export const ensurePhotoDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
};

// Save photo with metadata
export const savePhoto = async (photoUri: string): Promise<string> => {
  await ensurePhotoDirectory();
  
  const timestamp = Date.now();
  const fileName = `homework_${timestamp}.jpg`;
  const destUri = PHOTO_DIR + fileName;
  
  await FileSystem.copyAsync({
    from: photoUri,
    to: destUri
  });
  
  // Update photo index
  const indexStr = await getStorageItem(PHOTO_INDEX_KEY);
  const index = indexStr ? JSON.parse(indexStr) : [];
  index.push({ fileName, timestamp, uri: destUri });
  await setStorageItem(PHOTO_INDEX_KEY, JSON.stringify(index));
  
  return destUri;
};

// Clean old photos based on settings
export const cleanOldPhotos = async (): Promise<void> => {
  try {
    const settingsStr = await getStorageItem('photoSettings');
    const settings = settingsStr ? JSON.parse(settingsStr) : { autoDeleteDays: 7 };
    
    const indexStr = await getStorageItem(PHOTO_INDEX_KEY);
    if (!indexStr) return;
    
    const index = JSON.parse(indexStr);
    const now = Date.now();
    const maxAge = settings.autoDeleteDays * 24 * 60 * 60 * 1000;
    
    const updatedIndex: Array<{ fileName: string; timestamp: number; uri: string }> = [];
    
    for (const photo of index) {
      if (now - photo.timestamp > maxAge) {
        // Delete old photo
        try {
          await FileSystem.deleteAsync(photo.uri, { idempotent: true });
        } catch (e) {
          console.log('Error deleting photo:', e);
        }
      } else {
        updatedIndex.push(photo);
      }
    }
    
    await setStorageItem(PHOTO_INDEX_KEY, JSON.stringify(updatedIndex));
  } catch (e) {
    console.log('Error cleaning photos:', e);
  }
};

// Get all photos
export const getAllPhotos = async (): Promise<Array<{ fileName: string; timestamp: number; uri: string }>> => {
  const indexStr = await getStorageItem(PHOTO_INDEX_KEY);
  return indexStr ? JSON.parse(indexStr) : [];
};
