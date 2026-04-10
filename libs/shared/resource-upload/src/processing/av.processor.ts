import { exec } from 'child_process';
import { randomUUID } from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { AVMetadata } from '../types.js';

function runCommand(cmd: string, timeout = 30_000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout || stderr);
    });
  });
}

export async function getAVMetadata(buffer: Buffer, ext: string): Promise<AVMetadata> {
  const tmpPath = join(tmpdir(), `whizard-av-${randomUUID()}.${ext}`);
  try {
    await writeFile(tmpPath, buffer);

    const output = await runCommand(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${tmpPath}"`,
    );

    const data = JSON.parse(output);
    const format = data.format ?? {};
    const videoStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === 'video');
    const audioStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === 'audio');

    return {
      duration: parseFloat(format.duration) || 0,
      bitRate: parseInt(format.bit_rate) || 0,
      width: videoStream ? parseInt(videoStream.width) : undefined,
      height: videoStream ? parseInt(videoStream.height) : undefined,
      frameRate: videoStream ? parseFrameRate(videoStream.avg_frame_rate) : undefined,
      videoCodec: videoStream?.codec_name,
      audioCodec: audioStream?.codec_name,
    };
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

export async function extractVideoThumbnail(buffer: Buffer, ext: string, duration: number): Promise<Buffer> {
  const tmpInput = join(tmpdir(), `whizard-vthumb-in-${randomUUID()}.${ext}`);
  const tmpOutput = join(tmpdir(), `whizard-vthumb-out-${randomUUID()}.jpg`);
  try {
    await writeFile(tmpInput, buffer);

    const seekTo = Math.max(0, Math.floor(duration / 2));
    await runCommand(`ffmpeg -y -i "${tmpInput}" -ss ${seekTo} -frames:v 1 "${tmpOutput}"`);

    const { readFile } = await import('fs/promises');
    return readFile(tmpOutput);
  } finally {
    await unlink(tmpInput).catch(() => {});
    await unlink(tmpOutput).catch(() => {});
  }
}

function parseFrameRate(fr: string | undefined): number | undefined {
  if (!fr) return undefined;
  const [num, den] = fr.split('/').map(Number);
  return den ? num / den : num;
}
