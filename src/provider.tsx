import type React from 'react'
import { createContext, useContext, type ReactNode } from 'react'


// this provider will be used to set the default settings for the fetcher
// if ya'll don't want to pass a queryfn each time and your mostly
// using it to pull data from an api or a url in general

interface FetcherSettings extends RequestInit {
    baseUrl?: string; // Optional base URL for requests
}

// Default settings for the fetcher
const defaultSettings: FetcherSettings = {
    baseUrl: '',
    headers: { 'Content-Type': 'application/json' },
};

const FetcherContext = createContext<FetcherSettings>(defaultSettings);

interface DataFetcherProviderProps {
    settings: FetcherSettings;
    children: ReactNode;
}

export const DataFetcherProvider: React.FC<DataFetcherProviderProps> = ({
    settings,
    children,
}) => {
    return (
        <FetcherContext.Provider value={{ ...defaultSettings, ...settings }}>
            {children}
        </FetcherContext.Provider>
    );
};

export const useFetcherSettings = () => {
    return useContext(FetcherContext);
};
