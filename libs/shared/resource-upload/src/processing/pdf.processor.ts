import { exec } from 'child_process';
import { randomUUID } from 'crypto';
import { writeFile, unlink, readFile, readdir, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

function runCommand(cmd: string, timeout = 60_000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout || stderr);
    });
  });
}

export interface PDFInfo {
  pages: number;
  width: number;
  height: number;
}

export async function getPDFInfo(buffer: Buffer): Promise<PDFInfo> {
  const tmpPath = join(tmpdir(), `whizard-pdf-${randomUUID()}.pdf`);
  try {
    await writeFile(tmpPath, buffer);
    const output = await runCommand(`pdfinfo "${tmpPath}"`);

    const pagesMatch = output.match(/Pages:\s+(\d+)/);
    const sizeMatch = output.match(/Page size:\s+([\d.]+)\s+x\s+([\d.]+)/);

    return {
      pages: pagesMatch ? parseInt(pagesMatch[1]) : 0,
      width: sizeMatch ? Math.round(parseFloat(sizeMatch[1])) : 0,
      height: sizeMatch ? Math.round(parseFloat(sizeMatch[2])) : 0,
    };
  } catch {
    return { pages: 0, width: 0, height: 0 };
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

export async function generatePDFThumbnail(buffer: Buffer): Promise<Buffer | null> {
  const tmpInput = join(tmpdir(), `whizard-pdfthumb-${randomUUID()}.pdf`);
  const tmpOutputDir = join(tmpdir(), `whizard-pdfimg-${randomUUID()}`);
  try {
    await writeFile(tmpInput, buffer);
    await mkdir(tmpOutputDir, { recursive: true });

    // Try mutool first, fall back to ImageMagick convert
    try {
      await runCommand(`mutool convert -o "${tmpOutputDir}/page.png" "${tmpInput}" 1`);
    } catch {
      await runCommand(`convert "${tmpInput}[0]" "${tmpOutputDir}/page.png"`);
    }

    const files = await readdir(tmpOutputDir);
    const pngFile = files.find(f => f.endsWith('.png') || f.endsWith('.jpg'));
    if (!pngFile) return null;

    return readFile(join(tmpOutputDir, pngFile));
  } catch {
    return null;
  } finally {
    await unlink(tmpInput).catch(() => {});
    await rm(tmpOutputDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function convertPDFToImages(buffer: Buffer): Promise<Buffer[]> {
  const tmpInput = join(tmpdir(), `whizard-pdf2img-${randomUUID()}.pdf`);
  const tmpOutputDir = join(tmpdir(), `whizard-pdfimgs-${randomUUID()}`);
  try {
    await writeFile(tmpInput, buffer);
    await mkdir(tmpOutputDir, { recursive: true });

    try {
      await runCommand(
        `cd "${tmpOutputDir}" && mutool convert -o page-.png "${tmpInput}"`,
        120_000,
      );
      // Convert PNGs to smaller JPGs
      await runCommand(
        `cd "${tmpOutputDir}" && mogrify -thumbnail 800 -format jpg *.png && rm -f *.png`,
        120_000,
      );
    } catch {
      await runCommand(`convert "${tmpInput}" "${tmpOutputDir}/page.jpg"`, 120_000);
    }

    const files = await readdir(tmpOutputDir);
    const sorted = files
      .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/(\d+)/)?.[1] ?? '0');
        const numB = parseInt(b.match(/(\d+)/)?.[1] ?? '0');
        return numA - numB;
      });

    return Promise.all(sorted.map(f => readFile(join(tmpOutputDir, f))));
  } finally {
    await unlink(tmpInput).catch(() => {});
    await rm(tmpOutputDir, { recursive: true, force: true }).catch(() => {});
  }
}
