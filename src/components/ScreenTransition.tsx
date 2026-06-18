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
     * Duration em milissegundos. Padrão: 220ms
     */
    duration?: number;
    /**
     * Deslocamento vertical inicial (slide-up). Padrão: 10
     */
    slideOffset?: number;
}

/**
 * Envolve qualquer tela e aplica uma animação de entrada suave
 * (fade sutil + deslize mínimo). Começa em 0.85 de opacidade para
 * evitar o flash de tela branca perceptível nas tabs.
 */
export function ScreenTransition({
    children,
    duration = 220,
    slideOffset = 10,
}: ScreenTransitionProps) {
    // Começa quase visível — elimina o flash branco ao trocar tabs
    const opacity = useSharedValue(0.85);
    const translateY = useSharedValue(slideOffset);

    useEffect(() => {
        opacity.value = withTiming(1, {
            duration,
            easing: Easing.out(Easing.quad),
        });
        translateY.value = withTiming(0, {
            duration,
            easing: Easing.out(Easing.quad),
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
