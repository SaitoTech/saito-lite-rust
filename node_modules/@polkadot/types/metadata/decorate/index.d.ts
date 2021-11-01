import type { Registry } from '../../types';
import type { DecoratedMeta } from './types';
import { Metadata } from '../Metadata';
import { decorateConstants } from './constants';
import { decorateErrors } from './errors';
import { decorateEvents } from './events';
import { decorateExtrinsics } from './extrinsics';
import { decorateStorage } from './storage';
/**
 * Expands the metadata by decoration into consts, query and tx sections
 */
export declare function expandMetadata(registry: Registry, metadata: Metadata): DecoratedMeta;
export { decorateConstants, decorateErrors, decorateEvents, decorateExtrinsics, decorateStorage };
