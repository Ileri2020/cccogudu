// app/lib/db-utils.ts
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";

export const prisma = new PrismaClient();

// Cloudinary config (ensure env vars are set)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

/**
 * parseId
 * For a Mongo-backed schema (all ids are strings/ObjectId), we keep ids as strings.
 * This is intentionally simple so existing calls that pass id strings continue to work.
 */
export function parseId(id: any) {
  if (id === undefined || id === null) return undefined;
  return String(id);
}

/**
 * extractRequestData
 * - Detects multipart/form-data and JSON
 * - Returns { data, files: Record<string, File[]> , isForm }
 */
export async function extractRequestData(req: Request) {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("multipart/form-data")) {
    const formData = await (req as any).formData();
    const data: Record<string, any> = {};
    const files: Record<string, File[]> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = files[key] || [];
        files[key].push(value);
      } else {
        // attempt to JSON.parse strings that are JSON
        const str = String(value);
        try {
          data[key] = JSON.parse(str);
        } catch {
          data[key] = str;
        }
      }
    }

    return { data, files, isForm: true };
  }

  // JSON fallback
  let data: any = {};
  try {
    data = await (req as any).json();
  } catch {
    data = {};
  }
  return { data, files: {}, isForm: false };
}

/**
 * handleUploadFile
 * Uploads a File object to Cloudinary and returns the secure_url.
 * If upload fails, throws an error.
 */
export async function handleUploadFile(file: File) {
  if (!file) return null;

  // convert File -> dataURI
  const buffer = await file.arrayBuffer();
  const b64 = Buffer.from(buffer).toString("base64");
  const dataURI = `data:${file.type};base64,${b64}`;

  const res = await cloudinary.v2.uploader.upload(dataURI, { resource_type: "auto" });
  return res.secure_url || res.url;
}

/**
 * hashPasswordIfUser
 * Hash password when creating/updating a user.
 */
export async function hashPasswordIfUser(modelName: string, data: Record<string, any>) {
  if ((modelName === "users" || modelName === "user") && data?.password) {
    const rounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
    data.password = await bcrypt.hash(String(data.password), rounds);
  }
}

/**
 * modelMap: maps plural model strings (used by your clients) -> prisma model
 * Keep keys as the same model query names your frontend uses: 'users','posts','ministries', etc.
 */
export const modelMap: Record<string, any> = {
  ministries: prisma.ministry,
  departments: prisma.department,
  users: prisma.user,
  comments: prisma.comment,
  likes: prisma.like,
  billboards: prisma.billboard,
  posts: prisma.post,
  bible: prisma.bible,
  meetings: prisma.meeting,
  playlists: prisma.playlist,
};

/**
 * modelIncludes: include map derived from your schema.
 * When present for a model, GET (single & list) and others will include these relations.
 *
 * NOTE: Adjust selects/includes if you want to limit fields.
 */
export const modelIncludes: Record<string, any> = {
  ministries: {
    // no relations declared in schema with explicit Prisma relation fields
    // add relations here if you add them to schema later
  },

  departments: {
    // department has ministryId, but no relation field in schema -> no include
  },

  users: {
    posts: {
      include: {
        comments: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        likes: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    },
    likes: true,
    comments: {
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        content: { select: { id: true, title: true, url: true } },
      },
    },
    playlists: {
      include: {
        posts: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    },
    meeting: true,
    bibleEntries: {
      include: { user: { select: { id: true, name: true } } },
    },
  },

  comments: {
    user: { select: { id: true, name: true, avatarUrl: true } },
    content: {
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        comments: true,
      },
    },
  },

  likes: {
    user: { select: { id: true, name: true, avatarUrl: true } },
    content: {
      select: { id: true, title: true, url: true, type: true },
    },
  },

  posts: {
    user: { select: { id: true, name: true, username: true, avatarUrl: true, email: true } },
    comments: {
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    },
    likes: {
      include: { user: { select: { id: true, name: true } } },
    },
    playlists: true,
  },

  billboards: {
    // no explicit relation fields except departmentId, userId -> include user
    // user relation not defined in schema as explicit relation, so we keep simple
  },

  playlists: {
    user: { select: { id: true, name: true, avatarUrl: true } },
    posts: {
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    },
  },

  meetings: {
    admin: { select: { id: true, name: true, email: true, avatarUrl: true } },
  },

  bible: {
    user: { select: { id: true, name: true } },
  },
};
