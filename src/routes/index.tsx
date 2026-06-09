import { NavigationContainer } from "@react-navigation/native";
import { BottomRoutes } from "./routes"
import { StatusBar } from "expo-status-bar";

export function Routes() {
    return (
        <NavigationContainer>
            <BottomRoutes />
            <StatusBar style="dark" />
        </NavigationContainer>
    )
}