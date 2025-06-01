import { api } from "@/app/api/api";
import { NextResponse } from "next/server";
import { DtoGetReadPresignedURLResponse } from "@/postfly-api-types";

export async function POST(request: Request) {
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
    }

    const { paths } = await request.json();

    const res = await api.post<{ objects: DtoGetReadPresignedURLResponse[] }>(
      "/admin/v1/presigned/read/bulk",
      {
        paths,
      },
      {
        headers: {
          "X-Swagger-Key": accessToken,
        },
      }
    );

    if (res.status === 200) {
      return NextResponse.json({ ok: true, data: res.data?.objects });
    } else {
      return NextResponse.json(
        { ok: false, message: "이미지 조회 중 오류가 발생했습니다." },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "이미지 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
