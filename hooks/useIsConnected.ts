import * as React from "react";
import { Platform } from "react-native";
import { addNetworkStateListener } from "expo-network";
// Custom hook to check network connectivity
export const useIsConnected = () => {
  const [isConnected, setIsConnected] = React.useState(true); // Assume online by default

  React.useEffect(() => {
    if (Platform.OS !== "web") {
      const subscription = addNetworkStateListener((state) => {
        setIsConnected(state.isConnected === true);
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return isConnected;
};