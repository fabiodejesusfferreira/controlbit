import { ScrollView, Text, View, Image } from "react-native";
import { Colors } from "../../constants/theme";
import { ChevronRight, Cpu, GamepadDirectional, PencilRuler } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NeoCard } from "../../components/NeoCard";

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
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: "900",
                        color: Colors.dark,
                        letterSpacing: 0.5,
                    }}
                >
                    CONTROLBIT
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        color: Colors.dark,
                        fontFamily: "Courier",
                    }}
                    numberOfLines={1}
                >
                    Controle seu Micro:bit via Bluetooth
                </Text>
            </View>

            {/* Seletor de idioma */}
            <View style={{ position: "relative" }}>
                <View
                    style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        width: 70,
                        height: 44,
                        backgroundColor: Colors.dark,
                    }}
                />
                <View
                    style={{
                        width: 70,
                        height: 44,
                        backgroundColor: Colors.white,
                        borderWidth: 3,
                        borderColor: Colors.dark,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-around",
                        paddingHorizontal: 6,
                    }}
                >
                    <Text style={{ fontSize: 20 }}>🇧🇷</Text>
                    <ChevronRight size={16} color={Colors.dark} />
                </View>
            </View>
        </View>
    );
};

export default function Home() {
    return (
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
                <SectionDivider label="MODOS DE CONTROLE" />

                <View style={{ gap: 20, marginTop: 8 }}>
                    <NeoCard
                        variant="primary"
                        title="CONTROLE BÁSICO"
                        description="D-pad + 2 servos. Pronto para usar com qualquer carro micro:bit."
                        icon={
                            <GamepadDirectional
                                size={32}
                                color={Colors.dark}
                            />
                        }
                        onPress={() => console.log("Controle Básico")}
                    />

                    <NeoCard
                        variant="yellow"
                        title="CONTROLE COSTUMIZÁVEL"
                        description="Crie, arraste e configure botões com seus próprios comandos."
                        icon={
                            <PencilRuler
                                size={32}
                                color={Colors.dark}
                            />
                        }
                        onPress={() => console.log("Costumizável")}
                    />
                </View>

                {/* Ajuda */}
                <View style={{ marginTop: 24 }}>
                    <SectionDivider label="AJUDA" />
                </View>

                <View style={{ marginTop: 8 }}>
                    <NeoCard
                        variant="danger"
                        title="COMO CONFIGURAR O MICRO:BIT"
                        description="Aprenda a configurar seu micro:bit para enviar e receber os comandos"
                        icon={
                            <Cpu
                                size={32}
                                color={Colors.dark}
                            />
                        }
                        onPress={() => console.log("Ajuda")}
                    />
                </View>

                {/* Footer */}
                <View className="flex h-full items-end">
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <View
                            style={{ width: 20, height: 3, backgroundColor: Colors.dark }}
                        />
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "900",
                                color: Colors.dark,
                                letterSpacing: 0.5,
                            }}
                        >
                            EDITORA DOGO MAKER - 2026
                        </Text>
                        <View
                            style={{ flex: 1, height: 3, backgroundColor: Colors.dark }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}