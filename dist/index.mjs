// src/data-fetcher/index.tsx
import {
  useQuery
} from "@tanstack/react-query";

// src/lib/utils.ts
var buildQueryString = (params) => {
  const query = Object.entries(params).filter(([_, value]) => value !== void 0 && value !== null).map(
    ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
  ).join("&");
  return query ? `?${query}` : "";
};

// src/lib/fetcher.ts
var fetchWithSettings = async (endpoint, requestOptions = {}, queryParams, baseUrl, globalOptions) => {
  const queryString = queryParams ? buildQueryString(queryParams) : "";
  const url = `${baseUrl}${endpoint}${queryString}`;
  const mergedOptions = {
    ...globalOptions,
    ...requestOptions,
    headers: {
      ...globalOptions?.headers || {},
      ...requestOptions.headers || {}
    }
  };
  const response = await fetch(url, mergedOptions);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

// src/provider.tsx
import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
var defaultSettings = {
  baseUrl: "",
  headers: { "Content-Type": "application/json" }
};
var FetcherContext = createContext(defaultSettings);
var DataFetcherProvider = ({
  settings,
  children
}) => {
  return /* @__PURE__ */ jsx(FetcherContext.Provider, { value: { ...defaultSettings, ...settings }, children });
};
var useFetcherSettings = () => {
  return useContext(FetcherContext);
};

// src/data-fetcher/index.tsx
import { Fragment, jsx as jsx2 } from "react/jsx-runtime";
function DataFetcher({
  queryKey,
  queryFn,
  url,
  queryParams,
  options = {},
  children
}) {
  const { baseUrl, ...globalOptions } = useFetcherSettings();
  const fetcher = queryFn ? queryFn : async () => {
    if (!url) {
      throw new Error("URL must be provided if no queryFn is specified");
    }
    return fetchWithSettings(url, void 0, queryParams, baseUrl, globalOptions);
  };
  const queryResult = useQuery({
    queryKey,
    queryFn: fetcher,
    ...options
  });
  return /* @__PURE__ */ jsx2(Fragment, { children: children({ ...queryResult }) });
}

// src/infinite-data-fetcher/index.tsx
import { useEffect, useMemo, useRef } from "react";
import {
  useInfiniteQuery
} from "@tanstack/react-query";
import { Fragment as Fragment2, jsx as jsx3, jsxs } from "react/jsx-runtime";
function InfiniteDataFetcher({
  queryKey,
  queryFn,
  url,
  queryParams = () => ({}),
  options = {
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      throw new Error("This function is not implemented");
    }
  },
  children,
  enableManualFetch = false,
  triggerComponent,
  loadingComponent,
  noMoreDataComponent,
  threshold = [0.75],
  rootMargin = "0px"
}) {
  const { baseUrl, ...globalOptions } = useFetcherSettings();
  if (!queryKey) {
    throw new Error("queryKey is required.");
  }
  if (queryFn && url) {
    throw new Error("Only one of queryFn or url should be provided.");
  }
  const fetcher = queryFn ? (context) => queryFn({ ...context, pageParam: context.pageParam ?? 1 }) : url ? (context) => {
    const queryParamsObj = typeof queryParams === "function" ? queryParams(context.pageParam ?? 1) : queryParams;
    return fetchWithSettings(
      url,
      void 0,
      queryParamsObj,
      baseUrl,
      globalOptions
    );
  } : void 0;
  if (!fetcher) {
    throw new Error("Either queryFn or url must be provided.");
  }
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetcher,
    ...options,
    getNextPageParam: options?.getNextPageParam
  });
  const observerRef = useRef(null);
  useEffect(() => {
    if (!observerRef.current || enableManualFetch) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold, rootMargin }
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
    return triggerComponent || /* @__PURE__ */ jsx3(
      "button",
      {
        type: "button",
        onClick: () => fetchNextPage(),
        "aria-label": "Load more",
        disabled: isFetchingNextPage,
        children: isFetchingNextPage ? "Loading..." : "Load More"
      }
    );
  }, [isFetchingNextPage, hasNextPage, loadingComponent, noMoreDataComponent, triggerComponent, fetchNextPage]);
  return /* @__PURE__ */ jsxs(Fragment2, { children: [
    children({
      data: data?.pages,
      error,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch
    }),
    enableManualFetch ? renderFetchTrigger : /* @__PURE__ */ jsx3("div", { ref: observerRef })
  ] });
}
export {
  DataFetcher,
  DataFetcherProvider,
  InfiniteDataFetcher,
  buildQueryString,
  fetchWithSettings,
  useFetcherSettings
};
//# sourceMappingURL=index.mjs.map