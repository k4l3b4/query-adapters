# Query Adapters

## Overview

Query Adapters is a flexible TypeScript library that provides advanced data fetching components for React applications, built on top of React Query.

## Why?

I have been working with React Query for a while now and I wanted to create a library that would make my life easier and provide a more efficient way to fetch data from the server, i was using it in my projects for a while now and thought i would just make it into a package and share it with the community.

## Installation

```bash
npm install @k4l3b4/query-adapters@latest
```
using other package managers
```bash
pnpm add @k4l3b4/query-adapters@latest
```
```bash
yarn add @k4l3b4/query-adapters // yishhhh 🙄
```

## Dependencies

- React >= v16
- React Query >= v5
- TypeScript >= v4

## Mental dependency
- Reading tanstack's [react-query documentation](https://tanstack.com/query/v5/docs/framework/react/overview).

## Components

### 1. DataFetcher

A generic data fetching component with simplified query management.

#### Usage Example with query function

```typescript
import { DataFetcher } from '@k4l3b4/query-adapters';
import { fetchUserDetails } from './api';
import UserProfile from './UserProfile';

<DataFetcher
  queryKey={['user', userId]}
  queryFn={() => fetchUserDetails(userId)}
>
  {({ data, error, isLoading, status }) => (
    {isLoading ? <Spinner /> : <UserProfile user={data?.user} />}
  )}
</DataFetcher>
```
#### Usage Example with url string

```typescript
<DataFetcher<TUser, TError> // returned data and error will be of type TUser and TError respectively
  queryKey={['user', userId]}
  url={`/api/user/${userId}`} // don't pass query params here, use queryParams prop instead
>
  {({ data, error, isLoading, status }) => (
    {isLoading ? <Spinner /> : <UserProfile user={data?.user} />}
  )}
</DataFetcher>
```
The reason you can't pass query params directly in the url string is because if you later on decide to add query params to the queryParams prop, the produced URL will be incorrect: `api/users/filter?{the_query_param_passed_in=the_url_prop}?{the_query_params_passed_in=the_queryParams_prop}`

Notice the second query param in the URL having a `?` before it, this is because the `queryParams` prop is an object, and we need to concatenate it with the url string and since the queryParams prop has no knowledge of the url string, we are just assuming that the url string is correct and appending the queryParams to it.

#### Usage Example with url string and queryParams⭐

```typescript
<DataFetcher<TUser[], TError> // returned data and error will be of type TUser and TError respectively
  queryKey={['user']} // pass the query params that need to be tracked as queryKeys
  url={`/api/users/filter`}
  queryParams={{active: true, sort_by: "id", sort: "desc", page: 2}} 
  // this will produce a url like /api/users/filter?active=true&sort_by=id&sort=desc&page=2
  // cool right?😁
>
  {({ data, error, isLoading, status }) => (
    {isLoading ? <Spinner /> : data?.map(user => <UserProfile user={user} />)}
  )}
</DataFetcher>
```


### 2. InfiniteDataFetcher

A powerful, customizable component for implementing infinite scrolling and pagination.

#### Features
- Automatic or manual page loading
- Flexible data fetching strategy
- Intersection Observer for scroll-based loading
- Customizable and swappable states. (loading, error & no more data components)

#### Basic Usage Example

NOTE: please read tanstack's [react-query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries) for more information on how to use this component.

```typescript
<InfiniteDataFetcher<TUser[], TError> // returned data ie page?.users will be of type TUser[] and error will be of type TError.
  queryKey={['users']}
  queryFn={({ pageParam }) => fetchUsers(pageParam)}
  options={{
    getNextPageParam: (lastPage, allPages) => lastPage.nextPage
  }}
>
  {({
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  }) => (
    <>
      {data?.map((page, pageIndex) => (
        // returns an array of pages, each page contains an array of items
          <React.Fragment key={pageIndex}>
              {page?.users.map((post) => (
                  <UserCard key={item.id} user={item} />
              ))}
          </React.Fragment>
      ))}
      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
          Load More
        </button>
      )}
    </>
  )}
</InfiniteDataFetcher>
```

#### Advanced Examples

##### 1. Custom Loading and No More Data Components

```typescript
<InfiniteDataFetcher
  queryKey={['products']}
  queryFn={({ pageParam }) => fetchProducts(pageParam)}
  loadingComponent={<CustomSpinner />}
  noMoreDataComponent={<p>No more products to show</p>}
  triggerComponent={
    <button className="custom-load-more">
      Fetch More Products
    </button>
  }
  enableManualFetch
>
  {({ data, fetchNextPage, hasNextPage }) => (
    <div>
      {data?.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
              {page?.product.map((post) => (
                  <ProductCard key={product.id} product={product} />
              ))}
          </React.Fragment>
      ))}
      {hasNextPage && <button onClick={fetchNextPage}>Load More</button>}
    </div>
  )}
</InfiniteDataFetcher>
```

##### 2. Custom Intersection Observer Logic

```typescript
import React, { useEffect, useRef } from 'react';
import { InfiniteDataFetcher } from '@k4l3b4/query-adapters';
import { fetchBlogPosts } from './api';
import BlogPostCard from './BlogPostCard';

interface IntersectionObserverProps {
  onIntersect: () => void;
  hasNextPage: boolean;
}



const ProductList = () => {
  return (
    <InfiniteDataFetcher
      queryKey={['blog-posts']}
      queryFn={({ pageParam }) => fetchBlogPosts(pageParam)}
      options={{
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }}
      enableManualFetch // Disable auto-fetching since we're implementing custom logic
    >
      {({ data, fetchNextPage, hasNextPage }) => (
        <div>
          {data?.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page?.posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </React.Fragment>
          ))}

          {hasNextPage && (
            <IntersectionObserverComponent
              onIntersect={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          )}
        </div>
      )}
    </InfiniteDataFetcher>
  );
};

export default ProductList;



// handles intersection observer logic
const IntersectionObserverComponent: React.FC<IntersectionObserverProps> = ({ onIntersect, hasNextPage }) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [onIntersect, hasNextPage]);

  return (
    <div
      ref={observerRef}
      style={{
        height: '20px',
        background: 'transparent',
      }}
    />
  );
};

export default IntersectionObserverComponent;
```

##### 3. Error Handling and Retry

```typescript
<InfiniteDataFetcher
  queryKey={['comments']}
  queryFn={({ pageParam }) => fetchComments(pageParam)}
  options={{
    retry: 3,  // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  }}
>
  {({ 
    data, 
    error, 
    fetchNextPage, 
    hasNextPage,
    isError 
  }) => (
    <>
      {isError && (
        <ErrorBanner 
          message={error?.message || 'Failed to load comments'}
          onRetry={fetchNextPage}
        />
      )}
      {data?.map(comment => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </>
  )}
</InfiniteDataFetcher>
```

#### DataFetcher Props

| Prop | Type | Description | Default | Required |
|------|------|-------------|---------|---------|
| `queryKey` | `QueryKey` | Unique key for the query | `undefined` | `true` |
| `queryFn` | `(context: { pageParam }) => Promise<TItem>` | Function to fetch paginated data | `undefined` | `false` |
| `url` | `string` | Api url for fetching data | `undefined` | `false` |
| `queryParams` | `Record<string, any>` | query parameters to concatenate with the url | `undefined` | `false` |
| `options` | `UseInfiniteQueryOptions` | React Query infinite query options | `undefined` | `false` |
| `children` | `ReactNode` | Render function with query results | `undefined` | `true` |


#### InfiniteDataFetcher Props

| Prop | Type | Description | Default | Required |
|------|------|-------------|---------|---------|
| `queryKey` | `QueryKey` | Unique key for the query | `undefined` | `true` |
| `queryFn` | `(context: { pageParam }) => Promise<TItem>` | Function to fetch paginated data | `undefined` | `false` |
| `url` | `string` | Api url for fetching data | `undefined` | `false` |
| `queryParams` | `(pageParam) => Record<string, any>` | query parameters to concatenate with the url | `undefined` | `false` |
| `options` | `UseInfiniteQueryOptions` | React Query infinite query options | `undefined` | `false` |
| `children` | `ReactNode` | Render function with query results | `undefined` | `true` |
| `enableManualFetch` | `boolean` | Toggle between auto and manual fetching | `false` | `false` |
| `triggerComponent` | `ReactNode` | Custom component for manual loading | `undefined` | `false` |
| `loadingComponent` | `ReactNode` | Component shown during loading | `undefined` | `false` |
| `noMoreDataComponent` | `ReactNode` | Component shown when there is no more data | `undefined` | `false` |


I'll come up with a demo real soon just extra busy with work and the one i tested it on looks like shit.


## Contributing

1. Fork the repository
2. Create your feature branch
3. If you can use Biomejs
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License