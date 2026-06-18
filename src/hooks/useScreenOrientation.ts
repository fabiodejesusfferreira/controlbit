import { useEffect, useState, useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export type OrientationMode = 'portrait' | 'landscape';

export function useScreenOrientation(initial: OrientationMode = 'portrait') {
    const [orientation, setOrientation] = useState<OrientationMode>(initial);

    // Aplica orientação no mount com o valor inicial
    useEffect(() => {
        applyOrientation(initial);
        // Ao desmontar, volta para portrait
        return () => {
            ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP,
            );
        };
    }, []);

    const applyOrientation = useCallback(async (o: OrientationMode) => {
        await ScreenOrientation.lockAsync(
            o === 'landscape'
                ? ScreenOrientation.OrientationLock.LANDSCAPE
                : ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
    }, []);

    const toggle = useCallback(async () => {
        const next: OrientationMode =
            orientation === 'portrait' ? 'landscape' : 'portrait';
        setOrientation(next);
        await applyOrientation(next);
    }, [orientation, applyOrientation]);

    const set = useCallback(async (o: OrientationMode) => {
        setOrientation(o);
        await applyOrientation(o);
    }, [applyOrientation]);

    return { orientation, toggle, set, isLandscape: orientation === 'landscape' };
}