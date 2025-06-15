import { NextResponse } from "next/server";
import { api } from "@/app/api/api";

export async function PUT(request: Request) {
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

    const requestBody = await request.json();

    if (!Array.isArray(requestBody) || requestBody.length === 0) {
      return NextResponse.json(
        { ok: false, message: "팩 배송 정보 목록이 필요합니다." },
        { status: 400 }
      );
    }

    const res = await api.put(
      "/admin/v1/packing/shipping-inform/bulk",
      requestBody,
      {
        headers: {
          "X-Swagger-Key": accessToken,
        },
      }
    );

    if (res.status === 200 || res.status === 204) {
      return NextResponse.json({ ok: true, data: res.data });
    } else {
      return NextResponse.json(
        { ok: false, message: "팩 배송 정보 업데이트 중 오류가 발생했습니다." },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "팩 배송 정보 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
