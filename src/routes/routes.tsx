import { Platform, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Gamepad2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";

import HomeScreen from "../screens/Home";
import BasicControl from "../screens/BasicControl";

const { Screen, Navigator } = createBottomTabNavigator();

export function BottomRoutes() {
    const insets = useSafeAreaInsets();
    // No Android, a margem inferior (insets.bottom) pode ser 0 em alguns dispositivos sem navegação por gestos,
    // então garantimos um espaçamento mínimo com Platform.OS.
    const bottomPadding = Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom;

    return (
        <Navigator
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
                    borderRightWidth: route.name !== "basiccontrol" ? 3 : 0,
                    borderRightColor: Colors.dark,
                },
                tabBarActiveBackgroundColor: Colors.yellow,
                tabBarInactiveBackgroundColor: Colors.bg,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused }) => {
                    const iconProps = {
                        size: 24,
                        color: Colors.dark,
                        strokeWidth: focused ? 2.5 : 2,
                    };
                    if (route.name === "home") return <Home {...iconProps} />;
                    if (route.name === "basiccontrol") return <Gamepad2 {...iconProps} />;
                },
            })}
        >
            <Screen name="home" component={HomeScreen} />
            <Screen name="basiccontrol" component={BasicControl} />
        </Navigator>
    );
}