import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import type { MultipartFile } from "@fastify/multipart";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

const TIPOS_PERMITIDOS_IMAGEM = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const TIPOS_PERMITIDOS_DOCUMENTO = [
  ...TIPOS_PERMITIDOS_IMAGEM,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
];

export async function salvarAvatar(file: MultipartFile): Promise<string> {
  if (!TIPOS_PERMITIDOS_IMAGEM.includes(file.mimetype)) {
    const error = new Error("Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP.");
    (error as NodeJS.ErrnoException).code = "BAD_REQUEST";
    throw error;
  }

  const MAX = 5 * 1024 * 1024; // 5 MB
  const dir = path.join(UPLOADS_DIR, "avatars");
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.filename) || extensaoPorMime(file.mimetype);
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(dir, fileName);

  const buffer = await file.toBuffer();
  if (buffer.byteLength > MAX) {
    const error = new Error("Arquivo muito grande. Máximo: 5 MB.");
    (error as NodeJS.ErrnoException).code = "BAD_REQUEST";
    throw error;
  }

  await fs.writeFile(filePath, buffer);
  return `/uploads/avatars/${fileName}`;
}

export async function salvarAnexoProjeto(file: MultipartFile): Promise<{
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
}> {
  if (!TIPOS_PERMITIDOS_DOCUMENTO.includes(file.mimetype)) {
    const error = new Error("Tipo de arquivo não permitido.");
    (error as NodeJS.ErrnoException).code = "BAD_REQUEST";
    throw error;
  }

  const MAX = 20 * 1024 * 1024; // 20 MB
  const dir = path.join(UPLOADS_DIR, "projetos");
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.filename) || extensaoPorMime(file.mimetype);
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(dir, fileName);

  const buffer = await file.toBuffer();
  if (buffer.byteLength > MAX) {
    const error = new Error("Arquivo muito grande. Máximo: 20 MB.");
    (error as NodeJS.ErrnoException).code = "BAD_REQUEST";
    throw error;
  }

  await fs.writeFile(filePath, buffer);
  return {
    url: `/uploads/projetos/${fileName}`,
    nome: file.filename,
    tipo: file.mimetype,
    tamanho: buffer.byteLength,
  };
}

export async function deletarArquivo(urlRelativa: string): Promise<void> {
  try {
    const relPath = urlRelativa.replace(/^\//, "");
    const filePath = path.resolve(process.cwd(), relPath);
    await fs.unlink(filePath);
  } catch {
  }
}

function extensaoPorMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/csv": ".csv",
  };
  return map[mime] ?? "";
}
