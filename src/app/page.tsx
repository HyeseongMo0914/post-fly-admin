"use client";

import styled from "@emotion/styled";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { authAtom, checkAuthAtom } from "@/atoms/authAtom";

const HomePage = () => {
  const [auth] = useAtom(authAtom);
  const [, checkAuth] = useAtom(checkAuthAtom);
  const router = useRouter();

  useEffect(() => {
    // 인증 체크가 완료되지 않은 경우에만 체크 실행
    if (!auth.isChecked) {
      checkAuth();
    }
  }, [checkAuth, auth.isChecked]);

  const handleGoToList = () => {
    if (auth.isLoggedIn) {
      router.push("/list");
    } else {
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  };

  // 로딩 중일 때는 로딩 화면 표시
  if (auth.isLoading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingContent>
            <LoadingSpinner />
            <LoadingText>인증 확인 중...</LoadingText>
          </LoadingContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <MainContent>
          <Title>PostFly Admin</Title>
          <Subtitle>관리자 대시보드에 오신 것을 환영합니다</Subtitle>

          <ActionSection>
            {auth.isLoggedIn ? (
              <ActionButton onClick={handleGoToList}>
                📦 물품 리스트로 이동
              </ActionButton>
            ) : (
              <ActionButton onClick={() => router.push("/login")}>
                🔑 로그인하기
              </ActionButton>
            )}
          </ActionSection>

          {/* {auth.isLoggedIn && (
            <UserInfoSection>
              <UserInfoTitle>현재 로그인된 사용자</UserInfoTitle>
              <UserInfoText>
                이름: {auth.user?.name || "알 수 없음"}
              </UserInfoText>
              <UserInfoText>
                이메일: {auth.user?.email || "알 수 없음"}
              </UserInfoText>
            </UserInfoSection>
          )} */}
        </MainContent>
      </PageContainer>
    </Layout>
  );
};

const PageContainer = styled.div`
  padding: 40px;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainContent = styled.div`
  text-align: center;
  max-width: 600px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0 0 40px 0;
`;

const ActionSection = styled.div`
  margin-bottom: 40px;
`;

const ActionButton = styled.button`
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

export default HomePage;
