import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

// Placeholder for storage utils that will be migrated
// import { getStorageItem } from '@utils/core/storage';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    // TODO: Implement after migrating storage utils
    // const hasLaunched = await getStorageItem('hasLaunched');
    // setIsFirstLaunch(!hasLaunched);
    
    // Temporary: assume first launch for now
    setIsFirstLaunch(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isFirstLaunch) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/mode-selection" />;
}