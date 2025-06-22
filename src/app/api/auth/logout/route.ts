import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 쿠키에서 세션 정보를 제거
    const response = NextResponse.json(
      { ok: true, message: "로그아웃되었습니다." },
      { status: 200 }
    );

    // 세션 쿠키 제거
    response.cookies.delete("X-Swagger-Key");

    return response;
  } catch (error) {
    console.error("로그아웃 오류:", error);
    return NextResponse.json(
      { ok: false, message: "로그아웃 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
