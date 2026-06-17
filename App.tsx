// @ts-ignore
import "./global.css"
import "react-native-css-interop/jsx-runtime"
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { Routes } from './src/routes';
import * as Font from "expo-font";
import { BluetoothProvider } from "./src/context/BluetoothContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync({
                    "SpaceGrotesk-Bold": require("./assets/fonts/SpaceGrotesk-Bold.ttf"),
                    "SpaceGrotesk-Medium": require("./assets/fonts/SpaceGrotesk-Medium.ttf"),
                    "SpaceMono-Regular": require("./assets/fonts/SpaceMono-Regular.ttf"),
                    "SpaceMono-Bold": require("./assets/fonts/SpaceMono-Bold.ttf"),
                });
            } catch (e) {
                console.warn("Font loading error:", e);
            } finally {
              setAppReady(true)
            }
        }
        prepare();
    }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <BluetoothProvider>
        <Routes />
      </BluetoothProvider>
    </SafeAreaProvider>
  );
}