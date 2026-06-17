export const Colors = {
    primary: "#1C37B5",
    yellow: "#FFD82D",
    danger: "#E81C1C",
    bg: "#F5F0E8",
    dark: "#1A1A1A",
    white: "#FFFFFF",
    grayLight: "#F0EBE0",
    grayMid: "#D9D4CA",
    grayDark: "#B0A898",
    green: "#22C55E",
    orange: "#F97316",
    purple: "#A855F7",
    cyan: "#06B6D4",
    pink: "#EC4899",
} as const;


export const BorderWidth = {
    neo: 3,
    neoThick: 4,
};

export const Shadow = {
    neo: {
        shadowColor: Colors.dark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    neoSmall: {
        shadowColor: Colors.dark,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
};

export const FontFamily = {
    title: "SpaceGrotesk-Bold",
    medium: "SpaceGrotesk-Medium",
    mono: "SpaceMono-Regular",
    monoBold: "SpaceMono-Bold",
};