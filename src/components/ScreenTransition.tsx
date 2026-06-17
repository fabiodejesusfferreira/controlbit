import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";

interface ScreenTransitionProps {
    children: React.ReactNode;
    /**
     * Duration em milissegundos. Padrão: 300ms
     */
    duration?: number;
    /**
     * Deslocamento vertical inicial (slide-up). Padrão: 24
     */
    slideOffset?: number;
}

/**
 * Envolve qualquer tela e aplica uma animação de entrada suave
 * (fade + deslize para cima) sempre que o componente é montado.
 */
export function ScreenTransition({
    children,
    duration = 300,
    slideOffset = 24,
}: ScreenTransitionProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(slideOffset);

    useEffect(() => {
        opacity.value = withTiming(1, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(0, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
