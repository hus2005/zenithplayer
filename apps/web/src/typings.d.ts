/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
    id: string;
}

import type { ElectronBridgeApi } from '@zenithplayer/shared/interfaces';

declare global {
    interface Window {
        electron: ElectronBridgeApi;
        process: NodeJS.Process;
        require: NodeRequire;
    }
}
