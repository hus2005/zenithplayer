import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { PlaylistActions } from '@zenithplayer/m3u-state';
import {
    DataService,
    PortalStatus,
    PortalStatusService,
} from '@zenithplayer/services';
import {
    normalizeXtreamServerUrl,
    Playlist,
} from '@zenithplayer/shared/interfaces';
import { v4 as uuid } from 'uuid';

interface ServerCodeResponse {
    success: boolean;
    code?: string;
    dns_url?: string;
    message?: string;
}

function serverCodeValidator(
    control: AbstractControl
): ValidationErrors | null {
    const value = control.value;
    if (typeof value !== 'string' || value.trim().length === 0) {
        return null;
    }
    return /^[a-zA-Z0-9_-]+$/.test(value.trim()) ? null : { serverCode: true };
}

@Component({
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatIcon,
        MatInputModule,
        ReactiveFormsModule,
        TranslatePipe,
    ],
    selector: 'app-xtream-code-import',
    templateUrl: './xtream-code-import.component.html',
    styles: [
        `
            :host {
                display: flex;
                margin: 10px;
                justify-content: center;
            }

            form {
                width: 100%;
            }

            .status-active {
                color: #4caf50;
            }

            .status-inactive {
                color: #f44336;
            }

            .status-expired {
                color: #ff9800;
            }

            .status-unavailable {
                color: #9e9e9e;
            }

            .connection-status {
                margin: 10px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `,
    ],
})
export class XtreamCodeImportComponent {
    @Output() addClicked = new EventEmitter<void>();

    form = new FormGroup({
        _id: new FormControl(uuid()),
        title: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        username: new FormControl('', [Validators.required]),
        serverCode: new FormControl('', [
            Validators.required,
            serverCodeValidator,
        ]),
        importDate: new FormControl(new Date().toISOString()),
    });

    readonly dataService = inject(DataService);
    readonly store = inject(Store);
    readonly portalStatusService = inject(PortalStatusService);

    connectionStatus: PortalStatus | null = null;
    isTestingConnection = false;
    resolveError = '';

    async testConnection(): Promise<void> {
        if (!this.form.valid) return;

        this.isTestingConnection = true;
        this.resolveError = '';
        try {
            const connection = await this.resolveConnection();
            this.connectionStatus = await this.checkConnection(connection);
        } catch (error) {
            this.connectionStatus = 'unavailable';
            this.resolveError =
                error instanceof Error
                    ? error.message
                    : 'Sunucu kodu çözümlenemedi.';
        } finally {
            this.isTestingConnection = false;
        }
    }

    getStatusMessage(): string {
        return this.portalStatusService.getStatusMessage(this.connectionStatus);
    }

    getStatusClass(): string {
        return this.portalStatusService.getStatusClass(this.connectionStatus);
    }

    getStatusIcon(): string {
        return this.portalStatusService.getStatusIcon(this.connectionStatus);
    }

    clearForm(): void {
        this.form.reset({
            _id: uuid(),
            title: '',
            password: '',
            username: '',
            serverCode: '',
            importDate: new Date().toISOString(),
        });
        this.connectionStatus = null;
        this.resolveError = '';
    }

    async addPlaylist(): Promise<void> {
        if (!this.form.valid || this.isTestingConnection) return;

        this.isTestingConnection = true;
        this.resolveError = '';
        try {
            const connection = await this.resolveConnection();
            this.connectionStatus = await this.checkConnection(connection);
            if (this.connectionStatus !== 'active') {
                return;
            }

            const { serverCode: _serverCode, ...formValue } =
                this.form.getRawValue();
            this.store.dispatch(
                PlaylistActions.addPlaylist({
                    playlist: {
                        ...formValue,
                        password: connection.password,
                        serverUrl: connection.serverUrl,
                        username: connection.username,
                    } as Playlist,
                })
            );
            this.addClicked.emit();
        } catch (error) {
            this.connectionStatus = 'unavailable';
            this.resolveError =
                error instanceof Error
                    ? error.message
                    : 'Sunucu kodu çözümlenemedi.';
        } finally {
            this.isTestingConnection = false;
        }
    }

    private async resolveConnection(): Promise<{
        password: string;
        serverUrl: string;
        username: string;
    }> {
        const code = this.form.controls.serverCode.value?.trim() ?? '';
        const response =
            await this.dataService.sendIpcEvent<ServerCodeResponse>(
                'ZENITH_SERVER_CODE_RESOLVE',
                code
            );
        if (!response.success || !response.dns_url) {
            throw new Error(
                response.message || 'Sunucu kodu geçersiz veya bulunamadı.'
            );
        }
        try {
            return {
                password: this.form.controls.password.value?.trim() ?? '',
                serverUrl: normalizeXtreamServerUrl(response.dns_url),
                username: this.form.controls.username.value?.trim() ?? '',
            };
        } catch {
            throw new Error('Sunucu kodu geçersiz bir DNS adresi döndürdü.');
        }
    }

    private checkConnection(connection: {
        password: string;
        serverUrl: string;
        username: string;
    }): Promise<PortalStatus> {
        return this.portalStatusService.checkPortalStatus(
            connection.serverUrl,
            connection.username,
            connection.password,
            { skipCache: true }
        );
    }
}
