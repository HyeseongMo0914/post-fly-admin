import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookies = request.headers.get("cookie");
    const accessToken = cookies
      ?.split("; ")
      .find((row) => row.startsWith("X-Swagger-Key="))
      ?.split("=")[1];

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, message: "로그인 후 이용해주세요." },
        { status: 401 }
      );
    } else {
      if (accessToken === process.env.POSTFLY_API_KEY) {
        return NextResponse.json(
          { ok: true, message: "로그인 되었습니다." },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { ok: false, message: "로그인 후 이용해주세요." },
          { status: 401 }
        );
      }
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
