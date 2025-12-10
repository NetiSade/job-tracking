import { JobStatus } from "../types";
export declare const STATUS_LABELS: Record<JobStatus, string>;
export declare const getStatusLabel: (status: JobStatus) => string;
export declare const STATUS_TITLES: Record<JobStatus, string>;
export declare const STATUS_OPTIONS: {
    label: string;
    value: JobStatus;
}[];
