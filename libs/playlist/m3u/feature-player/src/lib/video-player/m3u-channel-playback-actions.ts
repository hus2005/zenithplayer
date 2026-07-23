import { ChannelActions } from '@zenithplayer/m3u-state';
import { Channel } from '@zenithplayer/shared/interfaces';

export function createM3uChannelPlaybackRequest(channel: Channel) {
    return ChannelActions.setActiveChannel({
        channel,
        startPlayback: true,
    });
}
