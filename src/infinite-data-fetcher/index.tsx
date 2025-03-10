'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
    type InfiniteData,
    type QueryFunctionContext,
    type QueryKey,
    useInfiniteQuery,
} from '@tanstack/react-query';
import type { InfiniteDataFetcherProps } from '../types';
import { fetchWithSettings } from '../lib/fetcher';
import { useFetcherSettings } from '../provider';

export function InfiniteDataFetcher<TPage, TError>({
    queryKey,
    queryFn,
    url,
    queryParams = () => ({}),
    options = {
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
            throw new Error("This function is not implemented")
        },
    },
    children,
    enableManualFetch = false,
    triggerComponent,
    loadingComponent,
    noMoreDataComponent,
    threshold = [0.75],
    rootMargin = '0px',
}: InfiniteDataFetcherProps<TPage, TError> & {
    threshold?: number | number[];
    rootMargin?: string;
}) {
    const { baseUrl, ...globalOptions } = useFetcherSettings();


    if (!queryKey) {
        throw new Error('queryKey is required.');
    }

    if (queryFn && url) {
        throw new Error('Only one of queryFn or url should be provided.');
    }

    // Define the fetcher function
    const fetcher = queryFn
        ? (context: QueryFunctionContext<QueryKey, number>) =>
            queryFn({ ...context, pageParam: context.pageParam ?? 1 })
        : url
            ? (context: QueryFunctionContext<QueryKey, number>) => {
                const queryParamsObj =
                    typeof queryParams === 'function'
                        ? queryParams(context.pageParam ?? 1)
                        : queryParams;
                return fetchWithSettings<TPage>(
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
    } = useInfiniteQuery<TPage, TError, InfiniteData<TPage>, QueryKey, number>({
        queryKey,
        queryFn: fetcher,
        ...options,
        getNextPageParam: options?.getNextPageParam,
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
            { threshold: threshold, rootMargin: rootMargin }
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
    }, [isFetchingNextPage, hasNextPage, loadingComponent, noMoreDataComponent, triggerComponent, fetchNextPage]);

    return (
        <>
            {children({
                data: data?.pages,
                error,
                isLoading,
                isFetchingNextPage,
                hasNextPage,
                fetchNextPage,
                refetch: refetch,
            })}
            {enableManualFetch ? renderFetchTrigger : <div ref={observerRef} />}
        </>
    );
}

export default InfiniteDataFetcher;
