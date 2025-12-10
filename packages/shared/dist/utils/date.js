export const formatDate = (isoString, options) => {
    if (!isoString)
        return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(options || {}),
    });
};
export const formatDateTime = (isoString, options) => {
    if (!isoString)
        return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        ...(options || {}),
    });
};
export const isDifferentTimestamp = (a, b) => {
    if (!a || !b)
        return false;
    return new Date(a).getTime() !== new Date(b).getTime();
};
