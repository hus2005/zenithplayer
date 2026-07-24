import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { AddPlaylistDialogComponent } from './add-playlist-dialog.component';

describe('AddPlaylistDialogComponent', () => {
    let component: AddPlaylistDialogComponent;
    let dialogRef: { close: jest.Mock };

    beforeEach(() => {
        dialogRef = { close: jest.fn() };
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialogRef, useValue: dialogRef }],
        });
        component = TestBed.runInInjectionContext(
            () => new AddPlaylistDialogComponent()
        );
    });

    it('clears the only available server-code login form', () => {
        const clearForm = jest.fn();
        (component as { xtreamImport: jest.Mock }).xtreamImport = jest.fn(
            () => ({ clearForm })
        );

        component.clearForm();

        expect(clearForm).toHaveBeenCalled();
    });

    it('closes the login dialog after a successful login', () => {
        component.closeDialog();

        expect(dialogRef.close).toHaveBeenCalled();
    });
});
