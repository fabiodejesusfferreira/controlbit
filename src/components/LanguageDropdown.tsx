import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
} from 'react-native';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { Colors } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

const LANGUAGES: Array<{ code: Language; label: string; flag: any }> = [
    {
        code: 'pt',
        label: 'Português',
        flag: require('../../assets/brasil.png'),
    },
    {
        code: 'es',
        label: 'Espanhol',
        flag: require('../../assets/espanha.png'),
    },
    {
        code: 'en',
        label: 'Inglês',
        flag: require('../../assets/estados-unidos.png'),
    },
];

export const LanguageDropdown: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<View>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

    const openDropdown = () => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setDropdownPos({
                top: y + height + 8,
                right: 0,  // will be overridden by right alignment style
            });
            setOpen(true);
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 120,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const closeDropdown = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => setOpen(false));
    };

    const handleSelect = async (lang: Language) => {
        await setLanguage(lang);
        closeDropdown();
    };

    return (
        <View>
            {/* Trigger button */}
            <View ref={buttonRef} style={{ position: 'relative' }}>
                {/* Neo-brutalist shadow */}
                <View
                    style={[
                        styles.shadow,
                        { width: 74, height: 48 },
                    ]}
                />
                <TouchableOpacity
                    onPress={open ? closeDropdown : openDropdown}
                    activeOpacity={0.85}
                    style={styles.trigger}
                >
                    <Image
                        source={current.flag}
                        style={styles.flagSmall}
                        resizeMode="contain"
                    />
                    {open ? (
                        <ChevronUp size={16} color={Colors.dark} />
                    ) : (
                        <ChevronDown size={16} color={Colors.dark} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Dropdown modal */}
            <Modal
                visible={open}
                transparent
                animationType="none"
                onRequestClose={closeDropdown}
            >
                <TouchableWithoutFeedback onPress={closeDropdown}>
                    <View style={StyleSheet.absoluteFill}>
                        <Animated.View
                            style={[
                                styles.dropdownWrapper,
                                {
                                    top: dropdownPos.top,
                                    opacity: opacityAnim,
                                    transform: [
                                        {
                                            // Animate scale from top: translate up by half the scaled distance
                                            scaleY: scaleAnim,
                                        },
                                        {
                                            translateY: scaleAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-50, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            {/* Neo-brutalist shadow for dropdown */}
                            <View style={styles.dropdownShadow} />

                            {/* Dropdown items */}
                            <View style={styles.dropdown}>
                                {LANGUAGES.map((lang, index) => {
                                    const isSelected = lang.code === language;
                                    return (
                                        <TouchableOpacity
                                            key={lang.code}
                                            onPress={() => handleSelect(lang.code)}
                                            activeOpacity={0.8}
                                            style={[
                                                styles.item,
                                                isSelected && styles.itemSelected,
                                                index < LANGUAGES.length - 1 && styles.itemBorder,
                                            ]}
                                        >
                                            <Image
                                                source={lang.flag}
                                                style={styles.flagLarge}
                                                resizeMode="contain"
                                            />
                                            <Text
                                                style={[
                                                    styles.itemText,
                                                    isSelected && styles.itemTextSelected,
                                                ]}
                                            >
                                                {lang.label}
                                            </Text>
                                            {isSelected && (
                                                <Check
                                                    size={18}
                                                    color={Colors.dark}
                                                    strokeWidth={3}
                                                    style={{ marginLeft: 'auto' }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    shadow: {
        position: 'absolute',
        top: 4,
        left: 4,
        backgroundColor: Colors.dark,
    },
    trigger: {
        width: 74,
        height: 48,
        backgroundColor: Colors.white,
        borderWidth: 3,
        borderColor: Colors.dark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
    },
    flagSmall: {
        width: 34,
        height: 34,
    },
    // Dropdown
    dropdownWrapper: {
        position: 'absolute',
        right: 16,
        width: 240,
    },
    dropdownShadow: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: -4,
        bottom: -4,
        backgroundColor: Colors.dark,
    },
    dropdown: {
        backgroundColor: Colors.bg,
        borderWidth: 3,
        borderColor: Colors.dark,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 14,
        backgroundColor: Colors.bg,
    },
    itemSelected: {
        backgroundColor: Colors.yellow,
    },
    itemBorder: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.dark,
    },
    flagLarge: {
        width: 44,
        height: 44,
        borderRadius: 8,
        overflow: 'hidden',
    },
    itemText: {
        fontFamily: 'SpaceGrotesk-Bold',
        fontSize: 18,
        color: Colors.dark,
        letterSpacing: 0.5,
    },
    itemTextSelected: {
        color: Colors.dark,
    },
});
