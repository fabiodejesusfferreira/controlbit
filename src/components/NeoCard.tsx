// src/components/NeoCard.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/theme";
import { ChevronRight } from "lucide-react-native";

interface NeoCardProps extends TouchableOpacityProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "yellow" | "danger" | "dark" | "white";
  showChevron?: boolean;
  shadowOffset?: number;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

const variantStyles = {
  primary: { bg: Colors.primary, text: Colors.white, iconBg: "#A8B4E8" },
  yellow: { bg: Colors.yellow, text: Colors.dark, iconBg: "#FFF2B0" },
  danger: { bg: Colors.danger, text: Colors.white, iconBg: "#F5A8A8" },
  dark: { bg: Colors.dark, text: Colors.white, iconBg: "#555" },
  white: { bg: Colors.white, text: Colors.dark, iconBg: Colors.grayLight },
};

export const NeoCard: React.FC<NeoCardProps> = ({
  title,
  description,
  icon,
  variant = "primary",
  showChevron = true,
  shadowOffset = 5,
  style,
  titleStyle,
  descriptionStyle,
  onPress,
  disabled,
  ...rest
}) => {
  const pressed = useSharedValue(0);
  const vStyle = variantStyles[variant];

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(pressed.value * shadowOffset, { duration: 80 }) },
      { translateY: withTiming(pressed.value * shadowOffset, { duration: 80 }) },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pressed.value * 0.15, { duration: 80 }),
  }));

  return (
    <View style={[{ position: "relative", width: "100%" }, style]}>
      {/* Sombra sólida preta */}
      <View
        style={{
          position: "absolute",
          top: shadowOffset,
          left: shadowOffset,
          right: -shadowOffset,
          bottom: -shadowOffset,
          backgroundColor: Colors.dark,
        }}
      />

      <Animated.View style={[animatedCardStyle, { width: "100%" }]}>
        <TouchableOpacity
          onPressIn={() => (pressed.value = 1)}
          onPressOut={() => (pressed.value = 0)}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={1}
          style={{
            backgroundColor: vStyle.bg,
            borderWidth: 3,
            borderColor: Colors.dark,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            overflow: "hidden",
          }}
          {...rest}
        >
          {/* Caixa do ícone */}
          {icon && (
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: vStyle.iconBg,
                borderWidth: 3,
                borderColor: Colors.dark,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </View>
          )}

          {/* Texto */}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                {
                  fontSize: 16,
                  fontWeight: "900",
                  color: vStyle.text,
                  letterSpacing: 0.5,
                  marginBottom: 4,
                },
                titleStyle,
              ]}
            >
              {title}
            </Text>
            {description && (
              <Text
                style={[
                  {
                    fontSize: 12,
                    color: vStyle.text,
                    lineHeight: 16,
                    fontFamily: "Courier",
                  },
                  descriptionStyle,
                ]}
              >
                {description}
              </Text>
            )}
          </View>

          {/* Chevron */}
          {showChevron && (
            <ChevronRight size={24} color={vStyle.text} />
          )}

          {/* Overlay de pressionar */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#000" },
              overlayStyle,
            ]}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};