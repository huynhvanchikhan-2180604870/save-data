import archiver from "archiver";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function listFiles(dir: string, base = dir, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(full, base, out);
    else out.push(path.relative(base, full));
  }
  return out;
}

export async function GET(req: NextRequest) {
  const username = (
    new URL(req.url).searchParams.get("username") || "unknown"
  ).trim();
  const srcDir = path.join(process.cwd(), "public", "extension_v2");
  if (!fs.existsSync(srcDir)) {
    return new Response(
      JSON.stringify({ error: "Missing /public/extension_v2" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const pass = new PassThrough();
  const zip = archiver("zip", { zlib: { level: 9 } });
  zip.on("error", (e) => pass.destroy(e));
  zip.pipe(pass);

  for (const rel of listFiles(srcDir)) {
    const abs = path.join(srcDir, rel);
    if (rel.replace(/\\/g, "/").endsWith("active.txt")) {
      zip.append(`${username}\n`, { name: rel }); // ghi đè nội dung
    } else {
      zip.file(abs, { name: rel }); // giữ nguyên file khác
    }
  }
  zip.finalize();

  const filename = `${username}_v2.zip`;
  return new Response(pass as any, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

