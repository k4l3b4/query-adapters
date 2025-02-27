'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
    type InfiniteQueryObserverResult,
    type QueryFunctionContext,
    type QueryKey,
    type RefetchOptions,
    useInfiniteQuery,
} from '@tanstack/react-query';
import type { InfiniteDataFetcherProps, InfiniteDataResponse } from '../types';
import { fetchWithSettings } from '../lib/fetcher';
import { useFetcherSettings } from '../provider';


export function InfiniteDataFetcher<TItem, TError>({
    queryKey,
    queryFn,
    url,
    queryParams = () => ({}),
    options = {
        getNextPageParam: (): unknown => {
            throw new Error('getNextPageParam Function not implemented.');
        },
        initialPageParam: 1
    },
    children,
    enableManualFetch = false,
    triggerComponent,
    loadingComponent,
    noMoreDataComponent,
}: InfiniteDataFetcherProps<TItem, TError>) {
    const { baseUrl, ...globalOptions } = useFetcherSettings();
    if (!queryKey) {
        throw new Error('queryKey is required');
    }

    if (queryFn && url) {
        throw new Error('Only one of queryFn or url should be provided, which one did you expect the package to use smart ass...');
    }

    const fetcher = queryFn
        ? (context: QueryFunctionContext<QueryKey, number | unknown>) =>
            queryFn({ ...context, pageParam: context.pageParam ?? 1 })
        : url
            ? (context: QueryFunctionContext<QueryKey, unknown>) => {
                const queryParamsObj =
                    typeof queryParams === 'function'
                        ? queryParams(context.pageParam ?? 1)
                        : queryParams;
                return fetchWithSettings<InfiniteDataResponse<TItem>>(
                    url,
                    undefined,
                    queryParamsObj,
                    baseUrl,
                    globalOptions
                );
            }
            : undefined;

    if (!fetcher) {
        throw new Error('Either queryFn or url must be provided.');
    }

    const {
        data,
        error,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery<
        InfiniteDataResponse<TItem>,
        TError,
        InfiniteDataResponse<TItem>
    >({
        queryKey,
        queryFn: fetcher,
        ...options,
    });

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!observerRef.current || enableManualFetch) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, [enableManualFetch, fetchNextPage, hasNextPage, isFetchingNextPage]);

    const renderFetchTrigger = useMemo(() => {
        if (isFetchingNextPage && loadingComponent) {
            return loadingComponent;
        }
        if (!hasNextPage && noMoreDataComponent) {
            return noMoreDataComponent;
        }
        return triggerComponent || (
            <button
                type="button"
                onClick={() => fetchNextPage()}
                aria-label="Load more"
                disabled={isFetchingNextPage}
            >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
        );
    }, [isFetchingNextPage, hasNextPage, loadingComponent, noMoreDataComponent, triggerComponent]);

    return (
        <>
            {children({
                data: data?.pages,
                error,
                isLoading,
                isFetchingNextPage,
                hasNextPage,
                fetchNextPage,
                refetch: refetch as (options?: RefetchOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteDataResponse<TItem>, TError>>,
            })}
            {enableManualFetch ? renderFetchTrigger : <div ref={observerRef} />}
        </>
    );
}

export default InfiniteDataFetcher;