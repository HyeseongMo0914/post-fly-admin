import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const postflyId = process.env.POSTFLY_ID;
    const postflyPassword = process.env.POSTFLY_PASSWORD;

    if (username !== postflyId && password !== postflyPassword) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    } else {
      const res = NextResponse.json({ ok: true });
      res.cookies.set("X-Swagger-Key", process.env.POSTFLY_API_KEY || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return res;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
