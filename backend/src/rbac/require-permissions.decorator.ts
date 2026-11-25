import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSIONS_ANY_KEY = 'permissions_any';

/** Requires ALL listed permission codes. */
export const RequirePermissions = (...codes: string[]) => SetMetadata(PERMISSIONS_KEY, codes);

/** Requires AT LEAST ONE of the listed permission codes. */
export const RequireAnyPermission = (...codes: string[]) => SetMetadata(PERMISSIONS_ANY_KEY, codes);
