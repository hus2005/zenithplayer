import { buildAndroidXtreamApiUrl } from './android.service';

describe('AndroidService URL construction', () => {
    it('targets player_api.php and trims credentials', () => {
        const url = new URL(
            buildAndroidXtreamApiUrl('https://iptv.example:8443/', {
                username: ' demo ',
                password: ' secret ',
                action: 'get_live_streams',
            })
        );

        expect(url.origin).toBe('https://iptv.example:8443');
        expect(url.pathname).toBe('/player_api.php');
        expect(url.searchParams.get('username')).toBe('demo');
        expect(url.searchParams.get('password')).toBe('secret');
        expect(url.searchParams.get('action')).toBe('get_live_streams');
    });

    it('rejects non-http Xtream server schemes', () => {
        expect(() =>
            buildAndroidXtreamApiUrl('file:///tmp/provider', {
                username: 'demo',
            })
        ).toThrow();
    });
});
