export interface Check {
    compare: Record<string, unknown>;
    data: string;
    fails?: string[];
    types?: Record<string, unknown>;
}
