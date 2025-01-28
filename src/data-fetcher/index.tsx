'use client';

import React, { type ReactNode } from 'react';
import {
    useQuery,
    type UseQueryResult,
    type UseQueryOptions,
    type QueryKey,
} from '@tanstack/react-query';
import { fetchWithSettings } from 'src/lib/fetcher';
import { useFetcherSettings } from 'src/provider';

// Props for the DataFetcher component
interface DataFetcherProps<TData, TError> {
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
        status: UseQueryResult['status'];
        refetch: UseQueryResult<TData, TError>['refetch'];
    }) => ReactNode; // Render prop for custom UI
}

export function DataFetcher<TData, TError>({
    queryKey,
    queryFn,
    url,
    queryParams,
    options = {},
    children,
}: DataFetcherProps<TData, TError>) {
    const { baseUrl, ...globalOptions } = useFetcherSettings();
    const fetcher = queryFn
        ? queryFn
        : async () => {
            if (!url) {
                throw new Error('URL must be provided if no queryFn is specified');
            }
            return fetchWithSettings<TData>(url, undefined, queryParams, baseUrl, globalOptions);
        };

    const queryResult = useQuery<TData, TError>({
        queryKey,
        queryFn: fetcher,
        ...options,
    });

    return (
        <>
            {children({ ...queryResult })}
        </>
    );
}

export default DataFetcher;
