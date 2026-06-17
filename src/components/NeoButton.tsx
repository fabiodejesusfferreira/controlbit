import React from "react";
import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor,
} from "react-native-reanimated";
import { Colors, FontFamily } from "../constants/theme";

interface NeoButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: "primary" | "yellow" | "danger" | "dark" | "white";
    size?: "sm" | "md" | "lg";
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

const variantStyles = {
    primary: {
        bg: Colors.primary,
        pressedBg: "#0056b3",
        text: Colors.white,
        border: Colors.dark,
        shadow: Colors.dark,
    },
    yellow: {
        bg: Colors.yellow,
        text: Colors.dark,
        border: Colors.dark,
        shadow: Colors.dark,
    },
    danger: {
        bg: Colors.danger,
        text: Colors.white,
        border: Colors.dark,
        shadow: Colors.dark,
    },
    dark: {
        bg: Colors.dark,
        text: Colors.white,
        border: Colors.dark,
        shadow: Colors.dark,
    },
    white: {
        bg: Colors.white,
        text: Colors.dark,
        border: Colors.dark,
        shadow: Colors.dark,
    },
};

const sizeStyles = {
    sm: { paddingH: 10, paddingV: 8, fontSize: 12, shadowOffset: 3 },
    md: { paddingH: 16, paddingV: 12, fontSize: 14, shadowOffset: 4 },
    lg: { paddingH: 20, paddingV: 16, fontSize: 16, shadowOffset: 5 },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const NeoButton: React.FC<NeoButtonProps> = ({
    label,
    variant = "primary",
    size = "md",
    icon,
    style,
    textStyle,
    fullWidth = false,
    onPress,
    disabled,
    ...rest
}) => {
    const pressed = useSharedValue(0);
    const vStyle = variantStyles[variant];
    const sStyle = sizeStyles[size];

    // Animação de movimento (pressionar para baixo/direita)
    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: withTiming(pressed.value * sStyle.shadowOffset, { duration: 80 }) },
            { translateY: withTiming(pressed.value * sStyle.shadowOffset, { duration: 80 }) },
        ],
    }));

    // NOVA ANIMAÇÃO: Controla a opacidade da camada preta
    const overlayStyle = useAnimatedStyle(() => ({
        // Multiplica por 0.15 para que a opacidade máxima seja 15%
        opacity: withTiming(pressed.value * 0.15, { duration: 80 }),
    }));

    return (
        <View style={[{ position: "relative" }, fullWidth && { width: "100%" }, style]}>
            {/* View Sólida Preta (Sombra de Fundo) */}
            <View
                style={{
                    position: "absolute",
                    top: sStyle.shadowOffset,
                    left: sStyle.shadowOffset,
                    right: -sStyle.shadowOffset,
                    bottom: -sStyle.shadowOffset,
                    backgroundColor: Colors.dark,
                }}
            />

            <Animated.View style={[animatedButtonStyle, { width: "100%" }]}>
                <TouchableOpacity
                    onPressIn={() => (pressed.value = 1)}
                    onPressOut={() => (pressed.value = 0)}
                    onPress={onPress}
                    disabled={disabled}
                    activeOpacity={1} // Mantém 1 para que o fundo em si não fique transparente
                    style={[
                        {
                            backgroundColor: disabled ? Colors.grayMid : vStyle.bg,
                            borderWidth: 3,
                            borderColor: vStyle.border,
                            paddingHorizontal: sStyle.paddingH,
                            paddingVertical: sStyle.paddingV,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            overflow: "hidden", // Garante que a camada preta não passe das bordas
                        },
                    ]}
                    {...rest}
                >
                    {/* CONTEÚDO DO BOTÃO */}
                    {icon}
                    <Text
                        style={[
                            {
                                fontSize: sStyle.fontSize,
                                color: disabled ? Colors.grayDark : vStyle.text,
                                fontWeight: "bold",
                                fontFamily: FontFamily.title,
                            },
                            textStyle,
                        ]}
                    >
                        {label}
                    </Text>

                    {/* CAMADA DE ESCURECIMENTO (OVERLAY) */}
                    <Animated.View
                        pointerEvents="none" // <-- MUITO IMPORTANTE: para não roubar o clique
                        style={[
                            StyleSheet.absoluteFill, // Faz grudar no topo, baixo, esquerda, direita
                            { backgroundColor: "#000" },
                            overlayStyle, // Aplica a opacidade animada
                        ]}
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};