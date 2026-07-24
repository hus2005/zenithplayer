import { FormBuilder } from '@angular/forms';
import { Settings, Theme } from '@zenithplayer/shared/interfaces';
import {
    createSettingsForm,
    createSettingsFromFormValue,
} from './settings-form.utils';

describe('settings form utils — strip country prefix', () => {
    const formBuilder = new FormBuilder();

    it('defaults the form control to false', () => {
        const form = createSettingsForm(formBuilder, true);

        expect(form.getRawValue().stripCountryPrefix).toBe(false);
    });

    it('carries an enabled toggle into the settings object', () => {
        const form = createSettingsForm(formBuilder, true);
        form.patchValue({ stripCountryPrefix: true });

        const settings = createSettingsFromFormValue(form, {} as Settings);

        expect(settings.stripCountryPrefix).toBe(true);
    });

    it('falls back to false when the form value is missing', () => {
        const form = createSettingsForm(formBuilder, true);
        form.patchValue({
            stripCountryPrefix: null as unknown as boolean,
        });

        const settings = createSettingsFromFormValue(form, {} as Settings);

        expect(settings.stripCountryPrefix).toBe(false);
    });
});

describe('settings form utils — theme', () => {
    const formBuilder = new FormBuilder();

    it('defaults the form control to the dark theme', () => {
        const form = createSettingsForm(formBuilder, true);

        expect(form.getRawValue().theme).toBe(Theme.DarkTheme);
    });

    it('falls back to the dark theme when the form value is missing', () => {
        const form = createSettingsForm(formBuilder, true);
        form.patchValue({
            theme: null as unknown as Theme,
        });

        const settings = createSettingsFromFormValue(form, {} as Settings);

        expect(settings.theme).toBe(Theme.DarkTheme);
    });
});
