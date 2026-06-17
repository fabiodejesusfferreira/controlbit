import { Platform, TouchableOpacity } from "react-native";
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

// ─── Bottom Tabs (Home + BasicControl) ───────────────────────────────────────

const { Screen: TabScreen, Navigator: TabNavigator } =
  createBottomTabNavigator<TabParamList>();

function BottomRoutes() {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom;

  return (
    <TabNavigator
      screenOptions={({ route }) => ({
        headerShown: false,
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

// ─── Root Stack (Tabs + telas sem tab bar) ───────────────────────────────────

const { Screen: StackScreen, Navigator: StackNavigator } =
  createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <StackNavigator screenOptions={{ headerShown: false }}>
      <StackScreen name="tabs" component={BottomRoutes} />
      <StackScreen
        name="customcontrol"
        component={CustomControl}
        options={{ animation: "slide_from_right" }}
      />
      <StackScreen
        name="customplay"
        component={CustomPlay}
        options={{
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
        }}
      />
    </StackNavigator>
  );
}