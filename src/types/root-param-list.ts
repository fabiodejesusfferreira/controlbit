/**
 * Tab navigator param list (telas com bottom tabs)
 */
export type TabParamList = {
  home: undefined;
  basiccontrol: undefined;
  customcontrol: undefined;
};

/**
 * Stack navigator raiz (inclui as tabs + telas sem tab bar)
 */
export type RootStackParamList = {
  tabs: undefined;
  basiccontrol: undefined;
  customcontrol: undefined;
  customplay: undefined;
};