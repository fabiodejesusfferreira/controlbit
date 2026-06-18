import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, Gamepad2, PencilRuler } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { TabParamList, RootStackParamList } from "../types/root-param-list";

import HomeScreen from "../screens/Home";
import BasicControl from "../screens/BasicControl";
import CustomControl from "../screens/CustomControl";
import CustomPlay from "../screens/CustomPlay";

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────

const { Screen: TabScreen, Navigator: TabNavigator } =
  createBottomTabNavigator<TabParamList>();

function BottomRoutes() {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom;

  return (
    <TabNavigator
      // Pré-carrega todas as tabs na inicialização — elimina o freeze da
      // primeira visita a cada tab
      initialRouteName="home"
      screenOptions={({ route }) => ({
        headerShown: false,
        // Não desmonta telas inativas: mantém state e evita re-mount jank
        lazy: false,
        tabBarStyle: {
          borderTopWidth: 3,
          borderTopColor: Colors.dark,
          backgroundColor: Colors.bg,
          height: 44 + bottomPadding,
          paddingBottom: bottomPadding,
        },
        tabBarItemStyle: {
          borderRightWidth: route.name !== "customcontrol" ? 3 : 0,
          borderRightColor: Colors.dark,
        },
        tabBarActiveBackgroundColor: Colors.yellow,
        tabBarInactiveBackgroundColor: Colors.bg,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          const iconProps = {
            size: 22,
            color: Colors.dark,
            strokeWidth: focused ? 2.5 : 1.8,
          };
          if (route.name === "home") return <Home {...iconProps} />;
          if (route.name === "basiccontrol") return <Gamepad2 {...iconProps} />;
          if (route.name === "customcontrol") return <PencilRuler {...iconProps} />;
        },
      })}
    >
      <TabScreen name="home" component={HomeScreen} />
      <TabScreen name="basiccontrol" component={BasicControl} />
      <TabScreen name="customcontrol" component={CustomControl} />
    </TabNavigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────

const { Screen: StackScreen, Navigator: StackNavigator } =
  createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <StackNavigator
      screenOptions={{
        headerShown: false,
        // Animação padrão mais rápida para o stack
        animation: "fade_from_bottom",
        animationDuration: 200,
      }}
    >
      {/* Tabs — sem animação extra ao entrar na raiz */}
      <StackScreen
        name="tabs"
        component={BottomRoutes}
        options={{ animation: "none" }}
      />

      {/* CustomControl standalone (usado via navigate do Home) */}
      <StackScreen
        name="customcontrol"
        component={CustomControl}
        options={{ animation: "slide_from_right", animationDuration: 220 }}
      />

      {/* CustomPlay — apresentação modal full screen */}
      <StackScreen
        name="customplay"
        component={CustomPlay}
        options={{
          animation: "fade_from_bottom",
          animationDuration: 200,
          presentation: "fullScreenModal",
        }}
      />
    </StackNavigator>
  );
}