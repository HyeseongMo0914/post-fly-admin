// src/app/login/page.tsx
"use client";

import styled from "@emotion/styled";
import LoginForm from "../../components/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      if (data.ok) {
        alert("이미 로그인 되었습니다.");
        router.push("/");
      }
    };

    checkLogin();
  }, [router]);

  return (
    <Container>
      <LoginForm />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
