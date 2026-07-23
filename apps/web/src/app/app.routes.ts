import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { RuntimeCapabilitiesService, SettingsStore } from '@zenithplayer/services';
import { WorkspaceStartupPreferencesService } from '@zenithplayer/workspace/shell/util';

const settingsReadyResolver = () => inject(SettingsStore).loadSettings();

const workspaceEntryRedirect = async () =>
    inject(WorkspaceStartupPreferencesService).resolveInitialWorkspacePath();

const dashboardAccessGuard = async () => {
    const startupPreferences = inject(WorkspaceStartupPreferencesService);
    const router = inject(Router);
    const redirectPath = await startupPreferences.resolveDashboardPath();

    return redirectPath === '/workspace/dashboard'
        ? true
        : router.parseUrl(redirectPath);
};

export function resolveElectronOnlyGlobalSearchRoute(
    runtime: Pick<RuntimeCapabilitiesService, 'isElectron'>,
    router: Pick<Router, 'parseUrl'>
) {
    return runtime.isElectron ? true : router.parseUrl('/workspace/sources');
}

const electronOnlyGlobalSearchGuard = () => {
    return resolveElectronOnlyGlobalSearchRoute(
        inject(RuntimeCapabilitiesService),
        inject(Router)
    );
};

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'workspace',
    },
    {
        path: 'workspace',
        data: {
            layout: 'workspace',
        },
        resolve: {
            settingsReady: settingsReadyResolver,
        },
        loadComponent: () =>
            import('@zenithplayer/workspace/shell/feature').then(
                (c) => c.WorkspaceShellComponent
            ),
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: workspaceEntryRedirect,
            },
            {
                path: 'dashboard',
                canActivate: [dashboardAccessGuard],
                loadComponent: () =>
                    import('@zenithplayer/workspace/dashboard/feature').then(
                        (c) => c.WorkspaceDashboardRailsComponent
                    ),
            },
            {
                path: 'sources',
                loadComponent: () =>
                    import('@zenithplayer/workspace/shell/feature').then(
                        (c) => c.WorkspaceSourcesComponent
                    ),
            },
            {
                path: 'playlists/:id',
                loadChildren: () =>
                    import('@zenithplayer/playlist/m3u/feature-player').then((m) =>
                        m.createM3uWorkspaceRoutes()
                    ),
            },
            {
                path: 'global-favorites',
                data: {
                    mode: 'favorites',
                    defaultScope: 'all',
                },
                loadComponent: () =>
                    import('./global-collection-route.component').then(
                        (c) => c.GlobalCollectionRouteComponent
                    ),
            },
            {
                path: 'global-recent',
                data: {
                    mode: 'recent',
                    defaultScope: 'all',
                },
                loadComponent: () =>
                    import('./global-collection-route.component').then(
                        (c) => c.GlobalCollectionRouteComponent
                    ),
            },
            {
                path: 'search',
                canActivate: [electronOnlyGlobalSearchGuard],
                data: {
                    isGlobalSearch: true,
                },
                loadComponent: () =>
                    import('@zenithplayer/portal/xtream/feature').then(
                        (c) => c.GlobalSearchResultsComponent
                    ),
            },
            {
                path: 'downloads',
                loadComponent: () =>
                    import('@zenithplayer/portal/downloads/feature').then(
                        (c) => c.DownloadsComponent
                    ),
            },
            {
                path: '',
                loadChildren: () =>
                    import('@zenithplayer/portal/xtream/feature').then((m) =>
                        m.createXtreamRoutes()
                    ),
            },
            {
                path: '',
                loadChildren: () =>
                    import('@zenithplayer/portal/stalker/feature').then((m) =>
                        m.createStalkerRoutes()
                    ),
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./settings/settings.component').then(
                        (c) => c.SettingsComponent
                    ),
            },
        ],
    },
    {
        path: 'settings',
        redirectTo: '/workspace/settings',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: '',
    },
];
