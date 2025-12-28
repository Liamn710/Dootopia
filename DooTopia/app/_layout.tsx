import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { DataCacheProvider } from "./context/DataCacheContext";

export default function RootLayout() {
  return (
    <DataCacheProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </DataCacheProvider>
  );
}
