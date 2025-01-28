import React, { ReactNode } from 'react';
import { QueryKey, UseQueryOptions, UseQueryResult, UseInfiniteQueryOptions, FetchNextPageOptions, InfiniteQueryObserverResult, RefetchOptions, QueryFunctionContext } from '@tanstack/react-query';

interface DataFetcherProps$1<TData, TError> {
    queryKey: QueryKey;
    url?: string;
    queryFn?: () => Promise<TData>;
    queryParams?: Record<string, unknown>;
    options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>;
    children: (props: {
        data: TData | undefined;
        error: TError | null;
        isLoading: boolean;
        isError: boolean;
        status: UseQueryResult['status'];
        refetch: UseQueryResult<TData, TError>['refetch'];
    }) => ReactNode;
}
declare function DataFetcher<TData, TError>({ queryKey, queryFn, url, queryParams, options, children, }: DataFetcherProps$1<TData, TError>): React.JSX.Element;

interface DataFetcherProps<TData, TError> {
    queryKey: QueryKey;
    url?: string;
    queryFn?: () => Promise<TData>;
    queryParams?: Record<string, unknown>;
    options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>;
    children: (props: {
        data: TData | undefined;
        error: TError | null;
        isLoading: boolean;
        isError: boolean;
        refetch: UseQueryResult<TData, TError>['refetch'];
    }) => ReactNode;
}
type ImprovedQueryFn<TItem> = (context: QueryFunctionContext<QueryKey, unknown>) => Promise<InfiniteDataResponse<TItem>>;
interface InfiniteDataResponse<TItem> {
    pages: TItem[][];
    pageParams: unknown[];
}
interface InfiniteDataFetcherProps<TItem, TError> {
    queryKey: QueryKey;
    queryFn?: ImprovedQueryFn<TItem>;
    url?: string;
    queryParams?: (pageParam: unknown) => Record<string, unknown>;
    options?: Omit<UseInfiniteQueryOptions<InfiniteDataResponse<TItem>, TError, InfiniteDataResponse<TItem>, InfiniteDataResponse<TItem>, QueryKey>, 'queryKey' | 'queryFn'>;
    children: (props: {
        data: TItem[][] | undefined;
        error: TError | null;
        isLoading: boolean;
        isFetchingNextPage: boolean;
        hasNextPage: boolean | undefined;
        fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult<InfiniteDataResponse<TItem>, TError>>;
        refetch: (options?: RefetchOptions) => Promise<InfiniteQueryObserverResult<InfiniteDataResponse<TItem>, TError>>;
    }) => ReactNode;
    enableManualFetch?: boolean;
    triggerComponent?: ReactNode;
    loadingComponent?: ReactNode;
    noMoreDataComponent?: ReactNode;
}

declare function InfiniteDataFetcher<TItem, TError>({ queryKey, queryFn, url, queryParams, options, children, enableManualFetch, triggerComponent, loadingComponent, noMoreDataComponent, }: InfiniteDataFetcherProps<TItem, TError>): React.JSX.Element;

declare const fetchWithSettings: <T>(endpoint: string, requestOptions?: RequestInit, queryParams?: Record<string, unknown>, baseUrl?: string, globalOptions?: RequestInit) => Promise<T>;

declare const buildQueryString: (params: Record<string, unknown>) => string;

interface FetcherSettings extends RequestInit {
    baseUrl?: string;
}
interface DataFetcherProviderProps {
    settings: FetcherSettings;
    children: ReactNode;
}
declare const DataFetcherProvider: React.FC<DataFetcherProviderProps>;
declare const useFetcherSettings: () => FetcherSettings;

export { DataFetcher, type DataFetcherProps, DataFetcherProvider, InfiniteDataFetcher, type InfiniteDataFetcherProps, buildQueryString, fetchWithSettings, useFetcherSettings };
