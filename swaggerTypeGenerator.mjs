#!/usr/bin/env node
import fs from "fs";
import path from "path";
import axios from "axios";
import { generateApi } from "swagger-typescript-api";

async function main() {
  // 1) 스펙 JSON 엔드포인트 (Swagger UI 가 기본으로 쓰는 곳)
  const specUrl = "https://api.postfly.kr/swagger/doc.json";

  // 2) 헤더에 X-Swagger-Key 를 추가해서 스펙을 내려받음
  const { data: spec } = await axios.get(specUrl, {
    headers: { "X-Swagger-Key": "1-postfly-api" },
  });

  // 3) Write the fetched spec into a local swagger.json file
  const outPath = path.resolve(process.cwd(), "swagger.json");
  fs.writeFileSync(outPath, JSON.stringify(spec, null, 2), "utf8");
  console.log(`✅ swagger.json has been generated at ${outPath}`);

  await generateApi({
    fileName: "postfly-api-types.ts",
    input: path.resolve(process.cwd(), "./swagger.json"),
    output: path.resolve(process.cwd(), "./src"),
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
