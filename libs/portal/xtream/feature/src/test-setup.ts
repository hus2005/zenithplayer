import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { installDuplicateVideoJsQualityLevelsWarnFilter } from '@zenithplayer/shared/testing';

installDuplicateVideoJsQualityLevelsWarnFilter();

setupZoneTestEnv({
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
});
