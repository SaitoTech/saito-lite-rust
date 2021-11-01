import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { BlockNumber } from '@polkadot/types/interfaces';
export declare function sessionProgress(instanceId: string, api: ApiInterfaceRx): () => Observable<BlockNumber>;
