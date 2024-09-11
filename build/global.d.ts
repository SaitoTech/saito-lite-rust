import {Saito} from '../apps/core/index'; // Adjust the import to your Saito class if needed

declare global {
  interface Window {
    saito: Saito;
  }
}