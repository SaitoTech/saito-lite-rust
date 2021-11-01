import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { AccountId } from '@polkadot/types/interfaces';
export declare function prime(instanceId: string, api: ApiInterfaceRx, _section: string): () => Observable<AccountId | null>;
