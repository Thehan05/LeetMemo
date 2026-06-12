export function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

export function timeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const difference = Math.max(0, now - Number(timestamp));

    const minutes = Math.floor(difference / 60);
    const hours = Math.floor(difference / 3600);
    const days = Math.floor(difference / 86400);
    const months = Math.floor(difference / 2592000);
    const years = Math.floor(difference / 31536000);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
}
