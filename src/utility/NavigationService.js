import {createNavigationContainerRef} from '@react-navigation/native';

// Create navigation reference that can be used throughout the app
export const navigationRef = createNavigationContainerRef();

// Helper function to navigate to a specific screen
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Retry after a short delay if navigation is not ready
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
      }
    }, 500);
  }
}

// Helper function to check if navigation is ready
export function isNavigationReady() {
  return navigationRef.isReady();
}

