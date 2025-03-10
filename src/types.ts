import type { DefinedInitialDataInfiniteOptions, FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult, QueryFunction, QueryFunctionContext, QueryKey, QueryObserverResult, RefetchOptions, UseInfiniteQueryOptions, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

export interface DataFetcherProps<TData, TError> {
    queryKey: QueryKey;
    url?: string;
    queryFn?: QueryFunction;
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

// export type ImprovedQueryFn<TPage> = (context: QueryFunctionContext<QueryKey, number | unknown>) => Promise<InfiniteData<TPage>>;

export type ImprovedQueryFn<TPage> = (context: QueryFunctionContext<QueryKey, number>) => Promise<TPage>;


export interface InfiniteDataFetcherProps<TPage, TError> {
    queryKey: QueryKey;
    queryFn?: ImprovedQueryFn<TPage>;
    url?: string;
    queryParams?: (pageParam: number | undefined) => Record<string, unknown>;
    options?: {
        getNextPageParam: (
            lastPage: TPage,
            allPages: Array<TPage>,
            lastPageParam: number | undefined,
            allPageParams: number[]
        ) => number | undefined,
    } & Omit<
        UseInfiniteQueryOptions<
            TPage,
            TError,
            InfiniteData<TPage>,
            TPage,
            QueryKey,
            number
        >,
        'queryKey' | 'queryFn' | 'getNextPageParam' | '_getNextPageParam'>
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