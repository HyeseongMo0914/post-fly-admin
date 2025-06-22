"use client";

import styled from "@emotion/styled";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout = ({ children, showSidebar = true }: LayoutProps) => {
  return (
    <LayoutContainer>
      {showSidebar && <Sidebar />}
      <MainContent showSidebar={showSidebar}>{children}</MainContent>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main<{ showSidebar: boolean }>`
  flex: 1;
  margin-left: ${({ showSidebar }) => (showSidebar ? "250px" : "0")};
  background: #f5f5f5;
  min-height: 100vh;
`;

export default Layout;
