import { Component, inject, ViewEncapsulation, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { XtreamCodeImportComponent } from '../xtream-code-import/xtream-code-import.component';

@Component({
    imports: [
        MatButtonModule,
        MatDialogModule,
        TranslateModule,
        XtreamCodeImportComponent,
    ],
    selector: 'app-add-playlist',
    templateUrl: './add-playlist-dialog.component.html',
    styleUrl: './add-playlist-dialog.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AddPlaylistDialogComponent {
    private readonly dialogRef = inject(
        MatDialogRef<AddPlaylistDialogComponent>
    );

    readonly xtreamImport = viewChild(XtreamCodeImportComponent);

    clearForm(): void {
        this.xtreamImport()?.clearForm();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
