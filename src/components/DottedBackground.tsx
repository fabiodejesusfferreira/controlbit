import React from 'react';
import { View, ViewProps } from 'react-native';
import Svg, { Pattern, Rect, Circle } from 'react-native-svg';

// Tipagem para aceitar os filhos (children) e outras props padrão de View
interface DottedBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

export default function DottedBackground({ children, className, ...rest }: DottedBackgroundProps) {
  return (
    // Fundo creme aplicado como base. Recebe className extra se você quiser sobrescrever algo.
    <View className={`flex-1 bg-[#F5F4EC] ${className || ''}`} {...rest}>
      
      {/* Camada do SVG posicionada no fundo absoluto. pointer-events-none garante que o fundo não bloqueie cliques */}
      <View className="absolute inset-0 pointer-events-none">
        <Svg height="100%" width="100%">
          <Pattern 
            id="dots" 
            x="0" 
            y="0" 
            width="32" 
            height="32" 
            patternUnits="userSpaceOnUse"
          >
            <Circle cx="24" cy="8" r="1.5" fill="#D9DBD7" /> 
            <Circle cx="8" cy="24" r="1.5" fill="#D9DBD7" /> 
          </Pattern>
          
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
        </Svg>
      </View>

      {/* Renderiza o conteúdo que você passar para dentro do componente */}
      <View className="flex-1">
        {children}
      </View>

    </View>
  );
}