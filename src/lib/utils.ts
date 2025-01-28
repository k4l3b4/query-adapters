const buildQueryString = (params: Record<string, unknown>): string => {
    const query = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join('&');
    return query ? `?${query}` : '';
}


const isDev = () => {
    // Vite
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV) {
        return true;
    }
    // Other frameworks (Next.js, Create React App)
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        return true;
    }
    return false;
};

export { buildQueryString, isDev }