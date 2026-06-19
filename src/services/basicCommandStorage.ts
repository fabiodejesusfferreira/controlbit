import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BasicCommands {
  up: string;
  down: string;
  left: string;
  right: string;
  horn: string;
  stop: string;
}

export const DEFAULT_BASIC_COMMANDS: BasicCommands = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  horn: 'horn',
  stop: 'stop',
};

const STORAGE_KEY = '@dogo_maker_basic_commands';

export const BasicCommandStorage = {
  getCommands: async (): Promise<BasicCommands> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const stored = JSON.parse(jsonValue) as BasicCommands;
        return { ...DEFAULT_BASIC_COMMANDS, ...stored };
      }
    } catch (e) {
      console.error('Failed to load basic commands', e);
    }
    return DEFAULT_BASIC_COMMANDS;
  },

  saveCommands: async (commands: BasicCommands): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(commands);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save basic commands', e);
    }
  },
};
