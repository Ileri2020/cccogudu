// app/api/dbhandler/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma, modelMap, modelIncludes, extractRequestData, handleUploadFile, hashPasswordIfUser, parseId } from "./db-utils";

/**
 * Helper: Get include object for model (or undefined)
 */
function getIncludeFor(modelName: string) {
  return modelIncludes[modelName] && Object.keys(modelIncludes[modelName]).length > 0
    ? modelIncludes[modelName]
    : undefined;
}

/**
 * GET handler
 * Supports:
 *  - ?model=posts&id=123  -> findUnique with include map
 *  - ?model=posts&search=term -> posts findMany with title contains (case-insensitive)
 *  - ?model=posts -> findMany (with includes)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelName = searchParams.get("model") || "";
    const idParam = searchParams.get("id");
    const search = searchParams.get("search") || "";

    if (!modelName) return NextResponse.json({ error: "Missing model" }, { status: 400 });

    const prismaModel = modelMap[modelName];
    if (!prismaModel) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

    const include = getIncludeFor(modelName);

    // Single fetch
    if (idParam) {
      const id = parseId(idParam);
      const item = await prismaModel.findUnique({
        where: { id },
        include,
      });

      if (!item) return NextResponse.json({ error: "Document not found" }, { status: 404 });
      return NextResponse.json(item);
    }

    // Posts search special case
    if (modelName === "posts" && search) {
      const items = await prisma.post.findMany({
        where: { title: { contains: search, mode: "insensitive" } as any },
        include: include || { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(items);
    }

    // List
    const items = await prismaModel.findMany({
      include,
      orderBy: { createdAt: "desc" } as any,
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

/**
 * POST handler (rewritten)
 * - Supports JSON and multipart/form-data
 * - Fully Cloudinary-enabled
 * - 100% backward compatible with previous versions
 * - Maps file fields automatically
 * - Hashes passwords for user model
 * - Parses IDs (Mongo-friendly)
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const modelName = (searchParams.get("model") || "").toLowerCase();
    if (!modelName)
      return NextResponse.json({ error: "Missing model" }, { status: 400 });

    const prismaModel = modelMap[modelName];
    if (!prismaModel)
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });

    const { data, files, isForm } = await extractRequestData(req);

    console.log("POST data:", data, "files:", files, "isForm:", isForm);

    //------------------------------------------------------------------
    // 1. HANDLE FILE UPLOADS (CLOUDINARY)
    //------------------------------------------------------------------
    if (isForm && files && Object.keys(files).length > 0) {
      const fileFieldMapping: Record<string, string> = {
        file: "url",
        files: "url",
        image: "imageUrl",
        imageUrl: "imageUrl",
        logo: "logoUrl",
        logoUrl: "logoUrl",
        avatar: "avatarUrl",
        avatarUrl: "avatarUrl",
        imgUrl: "imgUrl",
      };

      for (const key of Object.keys(files)) {
        const farr = files[key];
        if (!Array.isArray(farr) || farr.length === 0) continue;

        const uploadedUrls: string[] = [];

        // upload each file
        for (const file of farr) {
          const url = await handleUploadFile(file);
          if (url) uploadedUrls.push(url);
        }

        const mappedField = fileFieldMapping[key] || key;

        // single file → single URL
        data[mappedField] = uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls;
      }
    }

    //------------------------------------------------------------------
    // 2. HASH PASSWORD IF USER MODEL
    //------------------------------------------------------------------
    await hashPasswordIfUser(modelName, data);

    //------------------------------------------------------------------
    // 3. PARSE ANY FIELD ENDING WITH "Id"
    //------------------------------------------------------------------
    for (const key of Object.keys(data)) {
      if (key.endsWith("Id")) {
        data[key] = parseId(data[key]);
      }
    }

    console.log("Creating new", modelName, "with data:", data);

    //------------------------------------------------------------------
    // 4. CREATE THE RECORD
    //------------------------------------------------------------------
    const createdItem = await prismaModel.create({ data });

    return NextResponse.json(createdItem);
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to create item",
        details: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}


/**
 * PUT handler
 * - Supports JSON and multipart FormData updates
 * - Accepts id either via query param ?id= or in body (body.id)
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelName = (searchParams.get("model") || "").toLowerCase();
    const idQuery = searchParams.get("id") || null;
    if (!modelName) return NextResponse.json({ error: "Missing model" }, { status: 400 });

    const prismaModel = modelMap[modelName];
    if (!prismaModel) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

    const { data, files, isForm } = await extractRequestData(req);

    // Determine id: prefer query param, then body.id
    const id = parseId(idQuery ?? data?.id ?? null);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Remove id from update payload if present
    if (data && data.id) delete data.id;

    // File uploads
    if (isForm) {
      const fileFieldMapping: Record<string, string> = {
        file: modelName === "posts" ? "url" : "url",
        files: modelName === "posts" ? "url" : "url",
        avatar: "avatarUrl",
        avatarUrl: "avatarUrl",
        logo: "logoUrl",
        logoUrl: "logoUrl",
        image: modelName === "department" ? "imgUrl" : "imageUrl",
        imageUrl: "imageUrl",
        imgUrl: "imgUrl",
      };

      for (const key of Object.keys(files)) {
        const farr = files[key];
        if (!farr || farr.length === 0) continue;
        const uploadedUrls: string[] = [];
        for (const f of farr) {
          const url = await handleUploadFile(f);
          if (url) uploadedUrls.push(url);
        }
        const mapped = fileFieldMapping[key] || key;
        data[mapped] = uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls;
      }
    }

    // Hash password on update if provided
    await hashPasswordIfUser(modelName, data);

    // Normalize Id-like fields
    Object.keys(data).forEach((k) => {
      if (k.endsWith("Id")) data[k] = parseId(data[k]);
    });

    const updated = await prismaModel.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Failed to update item", details: String(error?.message || error) }, { status: 500 });
  }
}

/**
 * DELETE handler
 * - Supports ?model=posts&id=... style
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelName = (searchParams.get("model") || "").toLowerCase();
    const idParam = searchParams.get("id");

    if (!modelName) return NextResponse.json({ error: "Missing model" }, { status: 400 });
    if (!idParam) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const prismaModel = modelMap[modelName];
    if (!prismaModel) return NextResponse.json({ error: "Invalid model" }, { status: 400 });

    const id = parseId(idParam);

    const deleted = await prismaModel.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete item", details: String(error?.message || error) }, { status: 500 });
  }
}
