import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
import { QueryKey, UseQueryOptions, UseQueryResult, QueryFunction, UseInfiniteQueryOptions, InfiniteData, FetchNextPageOptions, InfiniteQueryObserverResult, RefetchOptions, QueryObserverResult, QueryFunctionContext } from '@tanstack/react-query';

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
declare function DataFetcher<TData, TError>({ queryKey, queryFn, url, queryParams, options, children, }: DataFetcherProps$1<TData, TError>): react_jsx_runtime.JSX.Element;

interface DataFetcherProps<TData, TError> {
    queryKey: QueryKey;
    url?: string;
    queryFn?: QueryFunction;
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
type ImprovedQueryFn<TPage> = (context: QueryFunctionContext<QueryKey, number>) => Promise<TPage>;
interface InfiniteDataFetcherProps<TPage, TError> {
    queryKey: QueryKey;
    queryFn?: ImprovedQueryFn<TPage>;
    url?: string;
    queryParams?: (pageParam: number | undefined) => Record<string, unknown>;
    options?: {
        getNextPageParam: (lastPage: TPage, allPages: Array<TPage>, lastPageParam: number | undefined, allPageParams: number[]) => number | undefined;
    } & Omit<UseInfiniteQueryOptions<TPage, TError, InfiniteData<TPage>, TPage, QueryKey, number>, 'queryKey' | 'queryFn' | 'getNextPageParam' | '_getNextPageParam'>;
    children: (props: {
        data: InfiniteData<TPage>['pages'] | undefined;
        error: TError | null;
        isLoading: boolean;
        isFetchingNextPage: boolean;
        hasNextPage: boolean | undefined;
        fetchNextPage: (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult<InfiniteData<TPage>, TError>>;
        refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<InfiniteData<TPage, unknown>, TError>>;
    }) => ReactNode;
    enableManualFetch?: boolean;
    triggerComponent?: ReactNode;
    loadingComponent?: ReactNode;
    noMoreDataComponent?: ReactNode;
}

declare function InfiniteDataFetcher<TPage, TError>({ queryKey, queryFn, url, queryParams, options, children, enableManualFetch, triggerComponent, loadingComponent, noMoreDataComponent, threshold, rootMargin, }: InfiniteDataFetcherProps<TPage, TError> & {
    threshold?: number | number[];
    rootMargin?: string;
}): react_jsx_runtime.JSX.Element;

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
