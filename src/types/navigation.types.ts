import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from './root-param-list';

export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;