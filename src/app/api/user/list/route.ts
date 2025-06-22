import { api } from "@/app/api/api";
import { NextResponse } from "next/server";
import { DtoListUsersResponse } from "@/postfly-api-types";

interface DtoListUsersRequest {
  /** @example "customerNumber" */
  customerNumber?: string;
  /**
   * Filter by
   * @example "John Doe"
   */
  name?: string;
  /**
   * @default 1
   * @example 1
   */
  page?: number;
  /**
   * @default 20
   * @example 20
   */
  size?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestBody = {
      customerNumber: searchParams.get("customerNumber"),
      name: searchParams.get("name"),
      page: Number(searchParams.get("page")),
      size: Number(searchParams.get("size")),
    } as DtoListUsersRequest;

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

    const res = await api.get<{ data: DtoListUsersResponse }>(
      "/admin/v1/users",
      {
        headers: {
          "X-Swagger-Key": accessToken,
        },
        params: {
          ...requestBody,
        },
      }
    );

    if (res.status === 200) {
      return NextResponse.json({ ok: true, data: res.data?.data });
    } else {
      return NextResponse.json(
        { ok: false, message: "팩 목록 조회 중 오류가 발생했습니다." },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "팩 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
        { ok: false, message: "팩 정보 목록이 필요합니다." },
        { status: 400 }
      );
    }

    // 각 항목의 유효성 검사
    for (const item of requestBody) {
      if (!item.packingID || !item.status) {
        return NextResponse.json(
          { ok: false, message: "팩 ID와 상태가 필요합니다." },
          { status: 400 }
        );
      }
    }

    const res = await api.patch("/admin/v1/packing/bulk", requestBody, {
      headers: {
        "X-Swagger-Key": accessToken,
      },
    });

    if (res.status === 200 || res.status === 204) {
      return NextResponse.json({ ok: true, data: res.data });
    } else {
      return NextResponse.json(
        { ok: false, message: "팩 상태 업데이트 중 오류가 발생했습니다." },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "팩 상태 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
