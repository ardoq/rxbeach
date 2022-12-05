interface ConfigMap {
  enableHotModuleReload: boolean;
}
type ConfigKeys = keyof ConfigMap;

function createGlobalConfig() {
  const config: ConfigMap = {
    enableHotModuleReload: true,
  };

  return {
    setProperty: <Key extends ConfigKeys>(key: Key, value: ConfigMap[Key]) => {
      config[key] = value;
    },
    getProperty: <Key extends ConfigKeys>(key: Key) => {
      return config[key];
    },
  };
}

export const rxBeachConfig = createGlobalConfig();
