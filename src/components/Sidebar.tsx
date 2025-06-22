"use client";

import styled from "@emotion/styled";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { authAtom, logoutAtom } from "@/atoms/authAtom";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [auth] = useAtom(authAtom);
  const [, logout] = useAtom(logoutAtom);
  const router = useRouter();

  const handleLoginClick = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleLogoutClick = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  const handlePackListClick = useCallback(() => {
    router.push("/list");
  }, [router]);

  const handleUserListClick = useCallback(() => {
    router.push("/users");
  }, [router]);

  return (
    <SidebarContainer className={className}>
      <LogoSection>
        <Logo>PostFly Admin</Logo>
      </LogoSection>

      <MenuSection>
        <MenuTitle>메뉴</MenuTitle>

        {auth.isLoggedIn ? (
          <MenuButton onClick={handleLogoutClick}>
            <MenuIcon>🚪</MenuIcon>
            로그아웃
          </MenuButton>
        ) : (
          <MenuButton onClick={handleLoginClick}>
            <MenuIcon>🔑</MenuIcon>
            로그인
          </MenuButton>
        )}

        {auth.isLoggedIn && (
          <>
            <MenuButton onClick={handlePackListClick}>
              <MenuIcon>📦</MenuIcon>
              물품 리스트
            </MenuButton>

            <MenuButton onClick={handleUserListClick}>
              <MenuIcon>👥</MenuIcon>
              유저 리스트
            </MenuButton>
          </>
        )}
      </MenuSection>

      {auth.isLoggedIn && auth.user && (
        <UserSection>
          <UserInfo>
            <UserName>{auth.user.name || auth.user.email || "사용자"}</UserName>
            <UserEmail>{auth.user.email}</UserEmail>
          </UserInfo>
        </UserSection>
      )}
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside`
  width: 250px;
  height: 100vh;
  background: #1a1a1a;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
`;

const LogoSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const MenuSection = styled.div`
  flex: 1;
  padding: 20px 0;
`;

const MenuTitle = styled.h2`
  margin: 0 0 16px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MenuButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;

  &:hover {
    background: #333;
  }

  &:active {
    background: #444;
  }
`;

const MenuIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const UserSection = styled.div`
  padding: 20px;
  border-top: 1px solid #333;
  background: #222;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`;

const UserEmail = styled.span`
  font-size: 12px;
  color: #888;
`;

export default Sidebar;
