import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { getSidebarWidth } from '../utils/platform';

interface GridConfig {
    numColumns: number;
    gridPadding: number;
    itemSpacing: number;
    itemWidth: number;
    cardHeight: number;
}

export const useResponsiveGrid = (minCardWidth: number = 250, cardHeight: number = 200): GridConfig => {
    const getGridConfig = (): GridConfig => {
        const { width: screenWidth } = Dimensions.get('window');
        const sidebarWidth = getSidebarWidth();
        const availableWidth = screenWidth - sidebarWidth;

        let numColumns = 2;
        let optimalCardWidth = minCardWidth;

        // Ekran genişliğine göre sütun sayısını belirle
        if (availableWidth >= 1400) {
            numColumns = 4;
            optimalCardWidth = 280;
        } else if (availableWidth >= 1100) {
            numColumns = 4;
            optimalCardWidth = 250;
        } else if (availableWidth >= 900) {
            numColumns = 3;
            optimalCardWidth = 250;
        } else if (availableWidth >= 600) {
            numColumns = 2;
            optimalCardWidth = 250;
        } else {
            numColumns = 1;
            optimalCardWidth = availableWidth - 32;
        }

        const gridPadding = 16;
        const itemSpacing = 16;

        // Kart genişliğini hesapla
        const totalPadding = gridPadding * 2;
        const totalSpacing = itemSpacing * (numColumns - 1);
        const itemWidth = (availableWidth - totalPadding - totalSpacing) / numColumns;

        return {
            numColumns,
            gridPadding,
            itemSpacing,
            itemWidth: Math.max(itemWidth, optimalCardWidth),
            cardHeight,
        };
    };

    const [gridConfig, setGridConfig] = useState<GridConfig>(getGridConfig());

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setGridConfig(getGridConfig());
        });

        return () => subscription?.remove();
    }, []);

    return gridConfig;
};
