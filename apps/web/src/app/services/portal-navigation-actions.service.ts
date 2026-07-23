import { inject, Injectable, Provider } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlaylistInfoComponent } from '@zenithplayer/playlist/shared/ui';
import {
    PORTAL_NAVIGATION_ACTIONS,
    PortalNavigationActions,
} from '@zenithplayer/portal/shared/util';
import { XtreamStore } from '@zenithplayer/portal/xtream/data-access';
import { Playlist } from '@zenithplayer/shared/interfaces';
import { SettingsComponent } from '../settings/settings.component';

@Injectable({ providedIn: 'root' })
export class AppPortalNavigationActionsService
    implements PortalNavigationActions
{
    private readonly dialog = inject(MatDialog);
    private readonly xtreamStore = inject(XtreamStore);

    openAccountInfo(): void {
        const data = {
            vodStreamsCount: this.xtreamStore.vodStreams().length,
            liveStreamsCount: this.xtreamStore.liveStreams().length,
            seriesCount: this.xtreamStore.serialStreams().length,
        };

        void import('@zenithplayer/portal/xtream/feature').then(
            ({ AccountInfoComponent }) => {
                this.dialog.open(AccountInfoComponent, {
                    width: '80%',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    data,
                });
            }
        );
    }

    openPlaylistInfo(playlist: Playlist | null | undefined): void {
        this.dialog.open(PlaylistInfoComponent, {
            data: playlist ?? null,
        });
    }

    openSettings(): void {
        this.dialog.open(SettingsComponent, {
            width: '1200px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            data: {
                isDialog: true,
            },
        });
    }
}

export function providePortalNavigationActions(): Provider[] {
    return [
        AppPortalNavigationActionsService,
        {
            provide: PORTAL_NAVIGATION_ACTIONS,
            useExisting: AppPortalNavigationActionsService,
        },
    ];
}
