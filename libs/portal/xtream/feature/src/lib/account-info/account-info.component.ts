import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import {
    XtreamAccountInfo,
    XtreamApiService,
    XtreamStore,
} from '@zenithplayer/portal/xtream/data-access';
import { createLogger } from '@zenithplayer/portal/shared/util';
import {
    resolveXtreamPortalStatus,
    type XtreamAccountInfoDialogData,
} from '@zenithplayer/shared/interfaces';

type AccountLoadState = 'loading' | 'ready' | 'error';

interface AccountStat {
    icon: string;
    labelKey: string;
    value: string;
    meter: number | null;
}

interface AccountDetailRow {
    labelKey: string;
    value: string;
    mono?: boolean;
    tone?: 'accent' | 'positive' | 'warning';
    translateValue?: boolean;
}

@Component({
    selector: 'app-account-info',
    imports: [MatButtonModule, MatDialogModule, MatIconModule, TranslatePipe],
    templateUrl: './account-info.component.html',
    styleUrl: './account-info.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent {
    readonly data =
        inject<XtreamAccountInfoDialogData | null>(MAT_DIALOG_DATA, {
            optional: true,
        }) ?? {};
    private readonly xtreamApiService = inject(XtreamApiService);
    private readonly xtreamStore = inject(XtreamStore);
    private readonly logger = createLogger('XtreamAccountInfo');

    readonly currentPlaylist = computed(
        () => this.data.playlist ?? this.xtreamStore.currentPlaylist()
    );
    readonly loadState = signal<AccountLoadState>('loading');
    readonly accountInfo = signal<XtreamAccountInfo | null>(null);
    readonly skeletonStats = [1, 2, 3, 4];
    readonly skeletonPanels = [1, 2];

    readonly isActive = computed(
        () => resolveXtreamPortalStatus(this.accountInfo()) === 'active'
    );
    readonly isTrial = computed(
        () => this.accountInfo()?.user_info?.is_trial === '1'
    );
    readonly playlistLabel = computed(() => {
        const playlist = this.currentPlaylist();
        const info = this.accountInfo();

        return (
            playlist?.title ||
            playlist?.name ||
            info?.user_info?.username ||
            '-'
        );
    });
    readonly activeConnections = computed(() =>
        this.parseNumber(this.accountInfo()?.user_info?.active_cons)
    );
    readonly maxConnections = computed(() =>
        this.parseNumber(this.accountInfo()?.user_info?.max_connections)
    );
    readonly connectionUsagePercent = computed(() => {
        const maxConnections = this.maxConnections();

        if (maxConnections <= 0) {
            return 0;
        }

        return Math.min(
            100,
            Math.round((this.activeConnections() / maxConnections) * 100)
        );
    });
    readonly activeConnectionsLabel = computed(
        () =>
            `${this.activeConnections()}/${Math.max(this.maxConnections(), 0)}`
    );
    readonly formattedExpDate = computed(() =>
        this.formatUnixDate(this.accountInfo()?.user_info?.exp_date)
    );
    readonly formattedCreatedDate = computed(() =>
        this.formatUnixDate(this.accountInfo()?.user_info?.created_at)
    );
    readonly allowedFormats = computed(
        () => this.accountInfo()?.user_info?.allowed_output_formats ?? []
    );
    readonly heroStats = computed<AccountStat[]>(() => [
        {
            icon: 'bolt',
            labelKey: 'XTREAM.ACCOUNT_INFO.ACTIVE_CONNECTIONS',
            value: this.activeConnectionsLabel(),
            meter: this.connectionUsagePercent(),
        },
        {
            icon: 'live_tv',
            labelKey: 'XTREAM.ACCOUNT_INFO.LIVE_TV',
            value: this.formatOptionalCount(this.data.liveStreamsCount),
            meter: null,
        },
        {
            icon: 'movie',
            labelKey: 'XTREAM.ACCOUNT_INFO.MOVIES',
            value: this.formatOptionalCount(this.data.vodStreamsCount),
            meter: null,
        },
        {
            icon: 'tv',
            labelKey: 'XTREAM.ACCOUNT_INFO.TV_SERIES',
            value: this.formatOptionalCount(this.data.seriesCount),
            meter: null,
        },
    ]);
    readonly userDetails = computed<AccountDetailRow[]>(() => [
        {
            labelKey: 'XTREAM.ACCOUNT_INFO.STATUS',
            value: this.accountInfo()?.user_info?.status || '-',
            tone: this.isActive() ? 'positive' : undefined,
        },
        {
            labelKey: 'XTREAM.ACCOUNT_INFO.USERNAME',
            value: this.accountInfo()?.user_info?.username || '-',
            mono: true,
        },
        {
            labelKey: 'XTREAM.ACCOUNT_INFO.ACTIVE_CONNECTIONS',
            value: this.activeConnectionsLabel(),
            tone: 'accent',
        },
        {
            labelKey: 'XTREAM.ACCOUNT_INFO.CREATED',
            value: this.formattedCreatedDate(),
        },
        {
            labelKey: 'XTREAM.ACCOUNT_INFO.EXPIRES',
            value: this.formattedExpDate(),
        },
        {
            labelKey: 'XTREAM.ACCOUNT_INFO.TRIAL_ACCOUNT',
            value: this.isTrial()
                ? 'XTREAM.ACCOUNT_INFO.YES'
                : 'XTREAM.ACCOUNT_INFO.NO',
            translateValue: true,
            tone: this.isTrial() ? 'warning' : undefined,
        },
    ]);
    constructor() {
        void this.reload();
    }

    async reload(): Promise<void> {
        const playlist = this.currentPlaylist();

        if (!playlist?.serverUrl || !playlist.username || !playlist.password) {
            this.loadState.set('error');
            this.accountInfo.set(null);
            return;
        }

        this.loadState.set('loading');

        try {
            const accountInfo = await this.xtreamApiService.getAccountInfo({
                serverUrl: playlist.serverUrl,
                username: playlist.username,
                password: playlist.password,
            });

            this.accountInfo.set(accountInfo);
            this.loadState.set('ready');
        } catch (error) {
            this.logger.error('Failed to fetch account info', error);
            this.accountInfo.set(null);
            this.loadState.set('error');
        }
    }

    private formatUnixDate(timestamp?: string): string {
        const value = Number.parseInt(timestamp ?? '', 10);

        if (!Number.isFinite(value) || value <= 0) {
            return '-';
        }

        return new Date(value * 1000).toLocaleDateString();
    }

    private parseNumber(value?: string): number {
        const parsed = Number.parseInt(value ?? '', 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private formatOptionalCount(value?: number): string {
        return Number.isFinite(value) ? String(value) : '-';
    }
}
