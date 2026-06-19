import React, { useState } from "react";
import { ScrollView, Text, View, Image } from "react-native";
import { Colors, FontFamily } from "../../constants/theme";
import { ScreenTransition } from "../../components/ScreenTransition";
import { ChevronRight, Cpu, GamepadDirectional, PencilRuler } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NeoCard } from "../../components/NeoCard";
import { RootStackNavigationProp } from "../../types/navigation.types";
import { useNavigation } from "@react-navigation/native";
import { LanguageDropdown } from "../../components/LanguageDropdown";
import { useLanguage } from "../../context/LanguageContext";
import MicrobitGuideModal from "../../components/MicrobitGuideModal";

interface SectionDividerProps {
    label: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 12,
                gap: 10,
            }}
        >
            <View style={{ width: 20, height: 3, backgroundColor: Colors.dark }} />
            <Text
                style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color: Colors.dark,
                    letterSpacing: 1,
                }}
            >
                {label}
            </Text>
            <View style={{ flex: 1, height: 3, backgroundColor: Colors.dark }} />
        </View>
    );
};

const AppHeader: React.FC = () => {
    const { t } = useLanguage();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                gap: 12,
            }}
        >
            {/* Logo */}
            <View style={{ position: "relative" }}>
                <View
                    style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        width: 60,
                        height: 60,
                        backgroundColor: Colors.dark,
                    }}
                />
                <View
                    style={{
                        width: 60,
                        height: 60,
                        backgroundColor: Colors.white,
                        borderWidth: 3,
                        borderColor: Colors.dark,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Image
                        source={require("../../../assets/Controlbit-logo.png")}
                        style={{
                            width: 44,
                            height: 44,
                        }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Título */}
            <View className="flex-1">
                <Text className="font-title text-2xl text-[#1A1A1A] tracking-wide">
                    CONTROLBIT
                </Text>
                <Text
                    className="font-mono text-xs text-[#1A1A1A]"
                >
                    {t('home_subtitle')}
                </Text>
            </View>

            {/* Seletor de idioma */}
            <LanguageDropdown />
        </View>
    );
};

export default function Home() {
    const navigation = useNavigation<RootStackNavigationProp>();
    const { t } = useLanguage();
    const [showMicrobitGuide, setShowMicrobitGuide] = useState(false);

    const navigateToBasicControl = () => {
        navigation.navigate("basiccontrol");
    };
    const navigateToCustomControl = () => {
        navigation.navigate("customcontrol");
    };

    return (
        <ScreenTransition>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingBottom: 30,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <AppHeader />

                    {/* Modos de Controle */}
                    <SectionDivider label={t('home_control_modes')} />

                    <View style={{ gap: 20, marginTop: 8 }}>
                        <NeoCard
                            variant="primary"
                            title={t('home_basic_title')}
                            description={t('home_basic_desc')}
                            icon={
                                <GamepadDirectional
                                    size={32}
                                    color={Colors.dark}
                                />
                            }
                            onPress={navigateToBasicControl}
                        />

                        <NeoCard
                            variant="yellow"
                            title={t('home_custom_title')}
                            description={t('home_custom_desc')}
                            icon={
                                <PencilRuler
                                    size={32}
                                    color={Colors.dark}
                                />
                            }
                            onPress={navigateToCustomControl}
                        />
                    </View>

                    {/* Ajuda */}
                    <View style={{ marginTop: 24 }}>
                        <SectionDivider label={t('home_help')} />
                    </View>

                    <View style={{ marginTop: 8 }}>
                        <NeoCard
                            variant="danger"
                            title={t('home_microbit_title')}
                            description={t('home_microbit_desc')}
                            icon={
                                <Cpu
                                    size={32}
                                    color={Colors.dark}
                                />
                            }
                            onPress={() => setShowMicrobitGuide(true)}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>

            <MicrobitGuideModal
                visible={showMicrobitGuide}
                onClose={() => setShowMicrobitGuide(false)}
            />
        </ScreenTransition>
    );
}