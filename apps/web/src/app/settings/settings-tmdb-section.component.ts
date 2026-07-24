import { Component, input, ViewEncapsulation } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-settings-tmdb-section',
    imports: [
        MatIconModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
    templateUrl: './settings-tmdb-section.component.html',
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
            app-settings-tmdb-section {
                display: contents;
            }

        `,
    ],
})
export class SettingsTmdbSectionComponent {
    readonly form = input.required<FormGroup>();
    readonly activeSection = input.required<string>();
}
