import { Injectable } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import {
    ERROR,
    normalizeXtreamServerUrl,
    XTREAM_REQUEST,
    XTREAM_RESPONSE,
} from '@zenithplayer/shared/interfaces';
import { PwaService } from './pwa.service';

const ZENITH_SERVER_CODE_API =
    'https://windows.zenithpanel.xyz/api/resolve.php';
const XTREAM_CLIENT_USER_AGENT = 'VLC/3.0.18 LibVLC/3.0.18';

export interface AndroidXtreamRequest {
    readonly params: Record<string, string>;
    readonly suppressErrorLog?: boolean;
    readonly url: string;
}

export function buildAndroidXtreamApiUrl(
    url: string,
    params: Record<string, string>
): string {
    const endpoint = new URL(
        `${normalizeXtreamServerUrl(url)}/player_api.php`
    );
    Object.entries(params).forEach(([key, value]) => {
        endpoint.searchParams.append(
            key,
            key === 'username' || key === 'password' ? value.trim() : value
        );
    });
    return endpoint.toString();
}

@Injectable({ providedIn: 'root' })
export class AndroidService extends PwaService {
    override sendIpcEvent<T = unknown>(
        type: string,
        payload?: unknown
    ): T {
        if (type === 'ZENITH_SERVER_CODE_RESOLVE') {
            return this.resolveServerCode(String(payload ?? '')) as T;
        }
        if (type === XTREAM_REQUEST) {
            return this.forwardAndroidXtreamRequest(
                payload as AndroidXtreamRequest
            ) as T;
        }
        return super.sendIpcEvent<T>(type, payload);
    }

    override getAppEnvironment(): string {
        return 'ANDROID';
    }

    private async resolveServerCode(rawCode: string): Promise<unknown> {
        const code = rawCode.trim();
        if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
            throw new Error('Geçersiz sunucu kodu.');
        }

        const response = await CapacitorHttp.get({
            url: ZENITH_SERVER_CODE_API,
            params: { code },
            connectTimeout: 15_000,
            readTimeout: 15_000,
            responseType: 'json',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Sunucu kodu API hatası: HTTP ${response.status}`);
        }

        const data = this.asRecord(response.data);
        return {
            success: data['success'] === true,
            ...(typeof data['code'] === 'string'
                ? { code: data['code'] }
                : {}),
            ...(typeof data['name'] === 'string'
                ? { name: data['name'] }
                : {}),
            ...(typeof data['dns_url'] === 'string'
                ? { dns_url: data['dns_url'] }
                : {}),
            ...(typeof data['message'] === 'string'
                ? { message: data['message'] }
                : {}),
        };
    }

    private async forwardAndroidXtreamRequest(
        payload: AndroidXtreamRequest
    ): Promise<unknown> {
        try {
            const response = await CapacitorHttp.get({
                url: buildAndroidXtreamApiUrl(payload.url, payload.params),
                headers: {
                    Accept: 'application/json',
                    'User-Agent': XTREAM_CLIENT_USER_AGENT,
                },
                connectTimeout: 30_000,
                readTimeout: 30_000,
                responseType: 'json',
            });
            if (response.status < 200 || response.status >= 400) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = {
                type: XTREAM_RESPONSE,
                payload: response.data,
                action: payload.params['action'],
            };
            window.postMessage(result);
            return result;
        } catch (error) {
            const result = {
                type: ERROR,
                status: this.errorStatus(error),
                message:
                    error instanceof Error
                        ? error.message
                        : 'Xtream sunucusuna bağlanılamadı.',
            };
            if (!payload.suppressErrorLog) {
                window.postMessage(result);
            }
            return result;
        }
    }

    private asRecord(value: unknown): Record<string, unknown> {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value) as Record<string, unknown>;
            } catch {
                return {};
            }
        }
        return value && typeof value === 'object'
            ? (value as Record<string, unknown>)
            : {};
    }

    private errorStatus(error: unknown): number {
        if (
            error &&
            typeof error === 'object' &&
            'status' in error &&
            typeof error.status === 'number'
        ) {
            return error.status;
        }
        return 500;
    }
}
