import type { FetchNextPageOptions, InfiniteQueryObserverResult, QueryFunctionContext, QueryKey, RefetchOptions, UseInfiniteQueryOptions, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

export interface DataFetcherProps<TData, TError> {
    queryKey: QueryKey;
    url?: string;
    queryFn?: () => Promise<TData>;
    queryParams?: Record<string, unknown>;
    options?: Omit<
        UseQueryOptions<TData, TError, TData, QueryKey>,
        'queryKey' | 'queryFn'
    >;
    children: (props: {
        data: TData | undefined;
        error: TError | null;
        isLoading: boolean;
        isError: boolean;
        refetch: UseQueryResult<TData, TError>['refetch'];
    }) => ReactNode;
}

export type ImprovedQueryFn<TItem> = (context: QueryFunctionContext<QueryKey, unknown>) => Promise<InfiniteDataResponse<TItem>>;

export interface InfiniteDataResponse<TItem> {
    pages: TItem[][];
    pageParams: unknown[];
}

export interface InfiniteDataFetcherProps<TItem, TError> {
    queryKey: QueryKey;
    queryFn?: ImprovedQueryFn<TItem>;
    url?: string;
    queryParams?: (pageParam: unknown) => Record<string, unknown>;
    options?: Omit<
        UseInfiniteQueryOptions<
            InfiniteDataResponse<TItem>,
            TError,
            InfiniteDataResponse<TItem>,
            InfiniteDataResponse<TItem>,
            QueryKey
        >,
        'queryKey' | 'queryFn'
    >;
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