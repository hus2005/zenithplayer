import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export const zenithplayer_E2E_DATA_DIR_ENV = 'zenithplayer_E2E_DATA_DIR';

function ensureDirectory(dirPath: string): string {
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }

    return dirPath;
}

export function getzenithplayerDataRoot(): string {
    const e2eDataDir = process.env[zenithplayer_E2E_DATA_DIR_ENV]?.trim();

    if (e2eDataDir) {
        return ensureDirectory(e2eDataDir);
    }

    return ensureDirectory(join(homedir(), '.zenithplayer'));
}

export function getzenithplayerDatabaseDirectory(): string {
    return ensureDirectory(join(getzenithplayerDataRoot(), 'databases'));
}

export function getzenithplayerDatabasePath(): string {
    return join(getzenithplayerDatabaseDirectory(), 'zenithplayer.db');
}

export function getElectronUserDataPath(): string | null {
    const e2eDataDir = process.env[zenithplayer_E2E_DATA_DIR_ENV]?.trim();

    if (!e2eDataDir) {
        return null;
    }

    return ensureDirectory(join(e2eDataDir, 'user-data'));
}

export function getElectronConfigDirectory(): string | null {
    const e2eDataDir = process.env[zenithplayer_E2E_DATA_DIR_ENV]?.trim();

    if (!e2eDataDir) {
        return null;
    }

    return ensureDirectory(join(e2eDataDir, 'config'));
}
