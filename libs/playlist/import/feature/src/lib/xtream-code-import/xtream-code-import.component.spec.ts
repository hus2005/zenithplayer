import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { PlaylistActions } from '@zenithplayer/m3u-state';
import { DataService, PortalStatusService } from '@zenithplayer/services';
import { XtreamCodeImportComponent } from './xtream-code-import.component';

describe('XtreamCodeImportComponent', () => {
    let component: XtreamCodeImportComponent;
    let dataService: { sendIpcEvent: jest.Mock };
    let store: { dispatch: jest.Mock };
    let portalStatusService: { checkPortalStatus: jest.Mock };

    beforeEach(() => {
        dataService = {
            sendIpcEvent: jest.fn().mockResolvedValue({
                success: true,
                code: '001',
                dns_url: 'http://dns.example:8080',
            }),
        };
        store = { dispatch: jest.fn() };
        portalStatusService = {
            checkPortalStatus: jest.fn().mockResolvedValue('active'),
            getStatusMessage: jest.fn(),
            getStatusClass: jest.fn(),
            getStatusIcon: jest.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: DataService, useValue: dataService },
                { provide: Store, useValue: store },
                { provide: PortalStatusService, useValue: portalStatusService },
            ],
        });

        component = TestBed.runInInjectionContext(
            () => new XtreamCodeImportComponent()
        );
        component.form.patchValue({
            title: 'Ev',
            serverCode: '001',
            username: ' user ',
            password: ' pass ',
        });
    });

    it('resolves the server code before testing Xtream credentials', async () => {
        await component.testConnection();

        expect(dataService.sendIpcEvent).toHaveBeenCalledWith(
            'ZENITH_SERVER_CODE_RESOLVE',
            '001'
        );
        expect(portalStatusService.checkPortalStatus).toHaveBeenCalledWith(
            'http://dns.example:8080',
            'user',
            'pass',
            { skipCache: true }
        );
        expect(component.connectionStatus).toBe('active');
    });

    it('adds only an active account using the resolved DNS URL', async () => {
        await component.addPlaylist();

        expect(store.dispatch).toHaveBeenCalledWith(
            PlaylistActions.addPlaylist({
                playlist: expect.objectContaining({
                    password: 'pass',
                    serverUrl: 'http://dns.example:8080',
                    title: 'Ev',
                    username: 'user',
                }),
            })
        );
    });

    it('does not add an inactive IPTV account', async () => {
        portalStatusService.checkPortalStatus.mockResolvedValue('inactive');

        await component.addPlaylist();

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(component.connectionStatus).toBe('inactive');
    });

    it('rejects an unknown server code response', async () => {
        dataService.sendIpcEvent.mockResolvedValue({
            success: false,
            message: 'Kod bulunamadı',
        });

        await component.addPlaylist();

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(component.connectionStatus).toBe('unavailable');
        expect(component.resolveError).toBe('Kod bulunamadı');
    });
});
