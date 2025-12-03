import { JobStatus } from "../types";

export const STATUS_LABELS: Record<JobStatus, string> = {
    wishlist: "🌟 Exploring",
    in_progress: "🚀 Taking Action",
    archived: "📂 Archived",
};

export const getStatusLabel = (status: JobStatus): string => {
    return STATUS_LABELS[status] || status;
};

export const STATUS_TITLES: Record<JobStatus, string> = {
    wishlist: "Exploring",
    in_progress: "Taking Action",
    archived: "Archived",
};

export const STATUS_OPTIONS = [
    { label: STATUS_LABELS.wishlist, value: "wishlist" as JobStatus },
    { label: STATUS_LABELS.in_progress, value: "in_progress" as JobStatus },
    { label: STATUS_LABELS.archived, value: "archived" as JobStatus },
];
