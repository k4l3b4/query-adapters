"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/data-fetcher/index.tsx


var _reactquery = require('@tanstack/react-query');

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
      ..._optionalChain([globalOptions, 'optionalAccess', _2 => _2.headers]) || {},
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
var _react = require('react');
var _jsxruntime = require('react/jsx-runtime');
var defaultSettings = {
  baseUrl: "",
  headers: { "Content-Type": "application/json" }
};
var FetcherContext = _react.createContext.call(void 0, defaultSettings);
var DataFetcherProvider = ({
  settings,
  children
}) => {
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, FetcherContext.Provider, { value: { ...defaultSettings, ...settings }, children });
};
var useFetcherSettings = () => {
  return _react.useContext.call(void 0, FetcherContext);
};

// src/data-fetcher/index.tsx

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
  const queryResult = _reactquery.useQuery.call(void 0, {
    queryKey,
    queryFn: fetcher,
    ...options
  });
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsxruntime.Fragment, { children: children({ ...queryResult }) });
}

// src/infinite-data-fetcher/index.tsx





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
  const fetcher = queryFn ? (context) => queryFn({ ...context, pageParam: _nullishCoalesce(context.pageParam, () => ( 1)) }) : url ? (context) => {
    const queryParamsObj = typeof queryParams === "function" ? queryParams(_nullishCoalesce(context.pageParam, () => ( 1))) : queryParams;
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
  } = _reactquery.useInfiniteQuery.call(void 0, {
    queryKey,
    queryFn: fetcher,
    ...options,
    getNextPageParam: _optionalChain([options, 'optionalAccess', _3 => _3.getNextPageParam])
  });
  const observerRef = _react.useRef.call(void 0, null);
  _react.useEffect.call(void 0, () => {
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
  const renderFetchTrigger = _react.useMemo.call(void 0, () => {
    if (isFetchingNextPage && loadingComponent) {
      return loadingComponent;
    }
    if (!hasNextPage && noMoreDataComponent) {
      return noMoreDataComponent;
    }
    return triggerComponent || /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
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
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, _jsxruntime.Fragment, { children: [
    children({
      data: _optionalChain([data, 'optionalAccess', _4 => _4.pages]),
      error,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch
    }),
    enableManualFetch ? renderFetchTrigger : /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { ref: observerRef })
  ] });
}







exports.DataFetcher = DataFetcher; exports.DataFetcherProvider = DataFetcherProvider; exports.InfiniteDataFetcher = InfiniteDataFetcher; exports.buildQueryString = buildQueryString; exports.fetchWithSettings = fetchWithSettings; exports.useFetcherSettings = useFetcherSettings;
//# sourceMappingURL=index.js.map