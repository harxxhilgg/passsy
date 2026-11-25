"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encryptText, decryptText } from "@/lib/crypto";
import { createClient } from "@/utils/supabase/server";

export type SavedRecordData = {
  id: string;
  site: string;
  email: string;
  username?: string;
  password: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
};

interface SensitivePayload {
  email: string;
  username?: string;
  password: string;
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }
  return user;
}

export async function getUserPasswordsAction(): Promise<{
  success: boolean;
  records: SavedRecordData[];
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: true, records: [] };
    }

    const records = await prisma.passwordRecord.findMany({
      where: { userId: user.id },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    const decryptedRecords: SavedRecordData[] = [];

    for (const record of records) {
      try {
        const rawJson = decryptText({
          ciphertext: record.ciphertext,
          iv: record.iv,
          tag: record.tag,
        });
        const payload: SensitivePayload = JSON.parse(rawJson);

        decryptedRecords.push({
          id: record.id,
          site: record.site,
          email: payload.email,
          username: payload.username || undefined,
          password: payload.password,
          isPinned: record.isPinned ?? false,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        });
      } catch (err) {
        console.error(`Failed to decrypt record ${record.id}:`, err);
      }
    }

    return { success: true, records: decryptedRecords };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      typeof (err as { digest: string }).digest === "string" &&
      (err as { digest: string }).digest.includes("DYNAMIC_SERVER_USAGE")
    ) {
      throw err;
    }
    console.error("getUserPasswordsAction error:", err);
    return {
      success: false,
      records: [],
      error: "Failed to fetch passwords.",
    };
  }
}

export async function savePasswordAction(data: {
  site: string;
  email: string;
  username?: string;
  password: string;
}): Promise<{ success: boolean; record?: SavedRecordData; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to save passwords.",
      };
    }

    if (!data.site?.trim() || !data.email?.trim() || !data.password?.trim()) {
      return {
        success: false,
        error: "Site, email, and password are required.",
      };
    }

    const payload: SensitivePayload = {
      email: data.email.trim(),
      username: data.username?.trim() || "",
      password: data.password,
    };

    const { ciphertext, iv, tag } = encryptText(JSON.stringify(payload));

    const record = await prisma.passwordRecord.create({
      data: {
        userId: user.id,
        site: data.site.trim(),
        ciphertext,
        iv,
        tag,
        isPinned: false,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      record: {
        id: record.id,
        site: record.site,
        email: payload.email,
        username: payload.username || undefined,
        password: payload.password,
        isPinned: false,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("savePasswordAction error:", err);
    return {
      success: false,
      error: "Failed to save password.",
    };
  }
}

export async function updatePasswordAction(
  id: string,
  data: {
    site: string;
    email: string;
    username?: string;
    password: string;
  }
): Promise<{ success: boolean; record?: SavedRecordData; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to update passwords.",
      };
    }

    const existing = await prisma.passwordRecord.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        error: "Record not found or unauthorized.",
      };
    }

    const payload: SensitivePayload = {
      email: data.email.trim(),
      username: data.username?.trim() || "",
      password: data.password,
    };

    const { ciphertext, iv, tag } = encryptText(JSON.stringify(payload));

    const updated = await prisma.passwordRecord.update({
      where: { id },
      data: {
        site: data.site.trim(),
        ciphertext,
        iv,
        tag,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      record: {
        id: updated.id,
        site: updated.site,
        email: payload.email,
        username: payload.username || undefined,
        password: payload.password,
        isPinned: updated.isPinned ?? false,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("updatePasswordAction error:", err);
    return {
      success: false,
      error: "Failed to update password.",
    };
  }
}

export async function togglePinPasswordAction(
  id: string
): Promise<{ success: boolean; isPinned?: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to pin passwords.",
      };
    }

    const existing = await prisma.passwordRecord.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        error: "Record not found or unauthorized.",
      };
    }

    const updated = await prisma.passwordRecord.update({
      where: { id },
      data: {
        isPinned: !existing.isPinned,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      isPinned: updated.isPinned,
    };
  } catch (err) {
    console.error("togglePinPasswordAction error:", err);
    return {
      success: false,
      error: "Failed to toggle pin.",
    };
  }
}

export async function deletePasswordAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to delete passwords.",
      };
    }

    const existing = await prisma.passwordRecord.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        error: "Record not found or unauthorized.",
      };
    }

    await prisma.passwordRecord.delete({
      where: { id },
    });

    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("deletePasswordAction error:", err);
    return {
      success: false,
      error: "Failed to delete password.",
    };
  }
}

export async function importPasswordsAction(
  items: {
    site: string;
    email: string;
    username?: string;
    password: string;
    isPinned?: boolean;
  }[]
): Promise<{
  success: boolean;
  importedRecords?: SavedRecordData[];
  duplicateCount?: number;
  invalidCount?: number;
  error?: string;
}> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "You must be signed in to import passwords.",
      };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        error: "No password records provided to import.",
      };
    }

    const existingRecords = await prisma.passwordRecord.findMany({
      where: { userId: user.id },
    });

    const existingKeys = new Set<string>();
    for (const record of existingRecords) {
      try {
        const rawJson = decryptText({
          ciphertext: record.ciphertext,
          iv: record.iv,
          tag: record.tag,
        });
        const payload: SensitivePayload = JSON.parse(rawJson);
        existingKeys.add(
          `${record.site.trim().toLowerCase()}::${payload.email.trim().toLowerCase()}::${(payload.username ?? "").trim().toLowerCase()}::${payload.password}`
        );
      } catch {
        // Ignore records that fail to decrypt
      }
    }

    let duplicateCount = 0;
    let invalidCount = 0;
    const toCreate: {
      site: string;
      payload: SensitivePayload;
      isPinned: boolean;
    }[] = [];

    for (const item of items) {
      const site = item.site?.trim() ?? "";
      const email = item.email?.trim() ?? "";
      const username = item.username?.trim() || "";
      const password = item.password ?? "";

      if (!site || !email || !password.trim()) {
        invalidCount++;
        continue;
      }

      const key = `${site.toLowerCase()}::${email.toLowerCase()}::${username.toLowerCase()}::${password}`;
      if (existingKeys.has(key)) {
        duplicateCount++;
        continue;
      }

      existingKeys.add(key);
      toCreate.push({
        site,
        payload: { email, username, password },
        isPinned: Boolean(item.isPinned),
      });
    }

    const created =
      toCreate.length > 0
        ? await prisma.$transaction(
            toCreate.map(({ site, payload, isPinned }) => {
              const { ciphertext, iv, tag } = encryptText(
                JSON.stringify(payload)
              );
              return prisma.passwordRecord.create({
                data: {
                  userId: user.id,
                  site,
                  ciphertext,
                  iv,
                  tag,
                  isPinned,
                },
              });
            })
          )
        : [];

    const importedRecords: SavedRecordData[] = created.map((record, index) => {
      const { payload } = toCreate[index];
      return {
        id: record.id,
        site: record.site,
        email: payload.email,
        username: payload.username || undefined,
        password: payload.password,
        isPinned: record.isPinned ?? false,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    });

    if (importedRecords.length > 0) {
      revalidatePath("/");
    }

    return {
      success: true,
      importedRecords,
      duplicateCount,
      invalidCount,
    };
  } catch (err) {
    console.error("importPasswordsAction error:", err);
    return {
      success: false,
      error: "Failed to import passwords.",
    };
  }
}
