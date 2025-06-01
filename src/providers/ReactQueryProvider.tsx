'use client';

// Next.js 13 이상에서는 'use client' 지시문을 사용하여 클라이언트 컴포넌트를 명시합니다.
// QueryClientProvider는 React context를 사용하므로 클라이언트 컴포넌트로 선언해야 합니다.

import React from 'react';
import {isServer, QueryClient, QueryClientProvider} from '@tanstack/react-query';

// QueryClient 생성 함수
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Next.js의 SSR과 함께 사용할 때, 클라이언트에서 즉시 리페치하는 것을 방지하기 위해
        // staleTime을 설정합니다.
        staleTime: 60 * 1000,
      },
    },
  });
}

// 브라우저에서 사용할 QueryClient 인스턴스
let browserQueryClient: QueryClient | undefined;

// QueryClient를 가져오는 함수
function getQueryClient() {
  if (isServer) {
    // 서버에서는 항상 새로운 QueryClient를 생성합니다.
    return makeQueryClient();
  }
  // 브라우저에서는 기존 QueryClient가 없을 때만 새로 생성합니다.
  // 이는 React가 초기 렌더링 중 일시 중단될 때 새 클라이언트를 재생성하지 않도록 하기 위함입니다.
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * React Query 프로바이더 컴포넌트
 * Next.js 13+ App Router에서 사용할 수 있도록 설계되었습니다.
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
 */
export function ReactQueryProviders({children}: {children: React.ReactNode}) {
  // QueryClient 초기화
  // useState를 사용하지 않는 이유는 Suspense 경계가 없을 때 React가 일시 중단되면
  // 클라이언트를 버릴 수 있기 때문입니다.
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
