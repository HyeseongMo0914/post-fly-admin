// src/app/login/page.tsx
"use client";

import styled from "@emotion/styled";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import LoginForm from "../../components/LoginForm";
import { authAtom, checkAuthAtom } from "@/atoms/authAtom";

const LoginPage = () => {
  const [auth] = useAtom(authAtom);
  const [, checkAuth] = useAtom(checkAuthAtom);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isChecked) {
      checkAuth();
    }
  }, [checkAuth, auth.isChecked]);

  useEffect(() => {
    if (auth.isLoggedIn) {
      router.push("/");
    }
  }, [auth.isLoggedIn, router]);

  return (
    <Layout showSidebar={false}>
      <Container>
        <LoginForm />
      </Container>
    </Layout>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

export default LoginPage;
