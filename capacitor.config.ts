import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'xyz.zenithpanel.zenithplayer',
    appName: 'Zenith Player',
    webDir: 'dist/apps/web',
    android: {
        backgroundColor: '#101116',
    },
    plugins: {
        CapacitorHttp: {
            enabled: true,
        },
        StatusBar: {
            style: 'LIGHT',
        },
    },
};

export default config;
