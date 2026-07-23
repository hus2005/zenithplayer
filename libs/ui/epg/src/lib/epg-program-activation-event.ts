import type { EpgProgram } from '@zenithplayer/shared/interfaces';

export interface EpgProgramActivationEvent {
    program: EpgProgram;
    type: 'live' | 'timeshift';
}
