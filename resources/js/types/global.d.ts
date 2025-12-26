import { AxiosInstance } from 'axios';
import { route as routeFn } from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
        route: any;
        Ziggy: any;
    }
}
