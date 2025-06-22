"use client";

import styled from "@emotion/styled";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { authAtom, checkAuthAtom } from "@/atoms/authAtom";
import { DtoGetUserInfoResponse } from "@/postfly-api-types";

interface UserListResponse {
  ok: boolean;
  data: {
    users: DtoGetUserInfoResponse[];
    page: number;
    size: number;
    total: number;
  };
}

const UsersPage = () => {
  const [auth] = useAtom(authAtom);
  const [, checkAuth] = useAtom(checkAuthAtom);
  const router = useRouter();

  const [searchParams, setSearchParams] = useState({
    customerNumber: "",
    name: "",
    page: 1,
    size: 20,
  });

  // 실제 API 호출에 사용될 파라미터 (검색 버튼 클릭 시에만 업데이트)
  const [queryParams, setQueryParams] = useState({
    customerNumber: "",
    name: "",
    page: 1,
    size: 20,
  });

  const [selectedUser, setSelectedUser] =
    useState<DtoGetUserInfoResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async (): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    if (queryParams.customerNumber)
      params.append("customerNumber", queryParams.customerNumber);
    if (queryParams.name) params.append("name", queryParams.name);
    params.append("page", queryParams.page.toString());
    params.append("size", queryParams.size.toString());

    const response = await fetch(`/api/user/list?${params.toString()}`);
    if (!response.ok) {
      throw new Error("유저 목록을 불러오는데 실패했습니다.");
    }
    return response.json();
  };

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: fetchUsers,
    enabled: auth.isLoggedIn,
  });

  useEffect(() => {
    if (!auth.isChecked) {
      checkAuth();
    }
  }, [checkAuth, auth.isChecked]);

  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  }, [auth.isLoading, auth.isLoggedIn, router]);

  const handleSearch = () => {
    setQueryParams({ ...searchParams, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleUserRowClick = (user: DtoGetUserInfoResponse) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCloseModal();
    }
  };

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

  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>유저 리스트</PageTitle>
          <PageSubtitle>등록된 사용자들을 관리합니다</PageSubtitle>
        </PageHeader>

        <SearchSection>
          <SearchForm>
            <SearchInputGroup>
              <SearchLabel>고객번호</SearchLabel>
              <SearchInput
                type="text"
                placeholder="고객번호를 입력하세요"
                value={searchParams.customerNumber}
                onChange={(e) =>
                  handleInputChange("customerNumber", e.target.value)
                }
                onKeyDown={handleKeyDown}
              />
            </SearchInputGroup>
            <SearchInputGroup>
              <SearchLabel>이름</SearchLabel>
              <SearchInput
                type="text"
                placeholder="이름을 입력하세요"
                value={searchParams.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </SearchInputGroup>
            <SearchButton onClick={handleSearch}>검색</SearchButton>
          </SearchForm>
        </SearchSection>

        <ContentSection>
          {isLoading ? (
            <LoadingContent>
              <LoadingSpinner />
              <LoadingText>유저 목록을 불러오는 중...</LoadingText>
            </LoadingContent>
          ) : error ? (
            <ErrorMessage>
              유저 목록을 불러오는데 실패했습니다. 다시 시도해주세요.
            </ErrorMessage>
          ) : userData?.data ? (
            <>
              <TableContainer>
                <UserTable>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>고객번호</TableHeaderCell>
                      <TableHeaderCell>이름</TableHeaderCell>
                      <TableHeaderCell>이메일</TableHeaderCell>
                      <TableHeaderCell>전화번호</TableHeaderCell>
                      <TableHeaderCell>사용자 ID</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userData.data.users.map((user) => (
                      <TableRow
                        key={user.userID}
                        onClick={() => handleUserRowClick(user)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleUserRowClick(user);
                          }
                        }}
                        aria-label={`${user.name} 유저 정보 보기`}
                      >
                        <TableCell>{user.customerNumber}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber || "-"}</TableCell>
                        <TableCell>{user.userID}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UserTable>
              </TableContainer>

              {userData.data.users.length === 0 && (
                <EmptyState>
                  <EmptyIcon>👥</EmptyIcon>
                  <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
                  <EmptyText>다른 검색 조건을 시도해보세요.</EmptyText>
                </EmptyState>
              )}

              {userData.data.total > 0 && (
                <PaginationContainer>
                  <PaginationInfo>
                    총 {userData.data.total}명의 유저 중{" "}
                    {(userData.data.page - 1) * userData.data.size + 1}-
                    {Math.min(
                      userData.data.page * userData.data.size,
                      userData.data.total
                    )}
                    명
                  </PaginationInfo>
                  <PaginationButtons>
                    <PaginationButton
                      onClick={() => handlePageChange(userData.data.page - 1)}
                      disabled={userData.data.page <= 1}
                    >
                      이전
                    </PaginationButton>
                    <PageNumber>
                      {userData.data.page} /{" "}
                      {Math.ceil(userData.data.total / userData.data.size)}
                    </PageNumber>
                    <PaginationButton
                      onClick={() => handlePageChange(userData.data.page + 1)}
                      disabled={
                        userData.data.page >=
                        Math.ceil(userData.data.total / userData.data.size)
                      }
                    >
                      다음
                    </PaginationButton>
                  </PaginationButtons>
                </PaginationContainer>
              )}
            </>
          ) : null}
        </ContentSection>

        {/* 유저 상세 정보 모달 */}
        {isModalOpen && selectedUser && (
          <ModalOverlay
            onClick={handleModalBackdropClick}
            onKeyDown={handleModalKeyDown}
          >
            <ModalContent>
              <ModalHeader>
                <ModalTitle>유저 상세 정보</ModalTitle>
                <CloseButton onClick={handleCloseModal} aria-label="모달 닫기">
                  ×
                </CloseButton>
              </ModalHeader>
              <ModalBody>
                <UserInfoGrid>
                  <InfoItem>
                    <InfoLabel>고객번호</InfoLabel>
                    <InfoValue>{selectedUser.customerNumber}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>이름</InfoLabel>
                    <InfoValue>{selectedUser.name}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>이메일</InfoLabel>
                    <InfoValue>{selectedUser.email}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>전화번호</InfoLabel>
                    <InfoValue>{selectedUser.phoneNumber || "-"}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>사용자 ID</InfoLabel>
                    <InfoValue>{selectedUser.userID}</InfoValue>
                  </InfoItem>
                  {selectedUser.defaultReceiverInfo && (
                    <>
                      <InfoItem>
                        <InfoLabel>기본 수신자 이름</InfoLabel>
                        <InfoValue>
                          {selectedUser.defaultReceiverInfo.name || "-"}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>기본 수신자 이메일</InfoLabel>
                        <InfoValue>
                          {selectedUser.defaultReceiverInfo.email || "-"}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>기본 수신자 전화번호</InfoLabel>
                        <InfoValue>
                          {selectedUser.defaultReceiverInfo.phone || "-"}
                        </InfoValue>
                      </InfoItem>
                      {selectedUser.defaultReceiverInfo.address && (
                        <>
                          <InfoItem>
                            <InfoLabel>기본 수신자 주소</InfoLabel>
                            <InfoValue>
                              {[
                                selectedUser.defaultReceiverInfo.address
                                  .address1,
                                selectedUser.defaultReceiverInfo.address
                                  .address2,
                                selectedUser.defaultReceiverInfo.address.city,
                                selectedUser.defaultReceiverInfo.address.state,
                                selectedUser.defaultReceiverInfo.address
                                  .postcode,
                                selectedUser.defaultReceiverInfo.address
                                  .country,
                              ]
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </InfoValue>
                          </InfoItem>
                        </>
                      )}
                    </>
                  )}
                  {selectedUser.defaultSenderInfo && (
                    <>
                      <InfoItem>
                        <InfoLabel>기본 발신자 이름</InfoLabel>
                        <InfoValue>
                          {selectedUser.defaultSenderInfo.name || "-"}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>기본 발신자 이메일</InfoLabel>
                        <InfoValue>
                          {selectedUser.defaultSenderInfo.email || "-"}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>기본 발신자 전화번호</InfoLabel>
                        <InfoValue>
                          {selectedUser.defaultSenderInfo.phone || "-"}
                        </InfoValue>
                      </InfoItem>
                    </>
                  )}
                </UserInfoGrid>
              </ModalBody>
              <ModalFooter>
                <CloseModalButton onClick={handleCloseModal}>
                  닫기
                </CloseModalButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </PageContainer>
    </Layout>
  );
};

const PageContainer = styled.div`
  padding: 40px;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const SearchSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SearchForm = styled.div`
  display: flex;
  gap: 16px;
  align-items: end;
`;

const SearchInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SearchLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007bff;
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: -2px;
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 16px;
  color: #333;
  font-size: 14px;
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #dc3545;
  font-size: 16px;
`;

const EmptyState = styled.div`
  padding: 60px 40px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-top: 1px solid #eee;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #666;
`;

const PaginationButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #007bff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumber = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

// 모달 관련 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: 60vh;
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #666;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #333;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 20px;
`;

const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const CloseModalButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

export default UsersPage;
