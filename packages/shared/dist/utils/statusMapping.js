export const STATUS_LABELS = {
    wishlist: "🌟 Exploring",
    in_progress: "🚀 Taking Action",
    archived: "📂 Archived",
};
export const getStatusLabel = (status) => {
    return STATUS_LABELS[status] || status;
};
export const STATUS_TITLES = {
    wishlist: "Exploring",
    in_progress: "Taking Action",
    archived: "Archived",
};
export const STATUS_OPTIONS = [
    { label: STATUS_LABELS.wishlist, value: "wishlist" },
    { label: STATUS_LABELS.in_progress, value: "in_progress" },
    { label: STATUS_LABELS.archived, value: "archived" },
];
