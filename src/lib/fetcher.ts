import { buildQueryString } from "./utils";
import { useFetcherSettings } from "../provider";

export const fetchWithSettings = async<T>(
  endpoint: string,
  requestOptions: RequestInit = {},
  queryParams?: Record<string, unknown>, // Optional query parameters
  baseUrl?: string, // Optional base URL
  globalOptions?: RequestInit // Optional global options
): Promise<T> => {

  const queryString = queryParams ? buildQueryString(queryParams) : '';
  const url = `${baseUrl}${endpoint}${queryString}`;

  const mergedOptions: RequestInit = {
    ...globalOptions,
    ...requestOptions,
    headers: {
      ...(globalOptions?.headers || {}),
      ...(requestOptions.headers || {}),
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};
