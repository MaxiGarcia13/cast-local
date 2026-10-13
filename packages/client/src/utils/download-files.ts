import { downloadZip } from 'client-zip';
import { downloadBlob } from '@/utils/download-blob';

const ZIP_FILENAME = 'roomcast-files.zip';

export interface DownloadableFile {
  name: string;
  blob: Blob;
}

function uniqueEntryNames(names: string[]): string[] {
  const used = new Map<string, number>();
  return names.map((name) => {
    const count = used.get(name) ?? 0;
    used.set(name, count + 1);
    if (count === 0) {
      return name;
    }
    const extensionIndex = name.lastIndexOf('.');
    if (extensionIndex <= 0) {
      return `${name} (${count})`;
    }
    const base = name.slice(0, extensionIndex);
    const extension = name.slice(extensionIndex);
    return `${base} (${count})${extension}`;
  });
}

export async function downloadFiles(files: DownloadableFile[]) {
  if (files.length === 0) {
    return;
  }

  if (files.length === 1) {
    const file = files[0]!;
    downloadBlob(file.blob, file.name);
    return;
  }

  const entryNames = uniqueEntryNames(files.map((file) => file.name));
  const zipResponse = downloadZip(
    files.map((file, index) => ({
      name: entryNames[index]!,
      input: file.blob,
      lastModified: new Date(),
    })),
  );
  const zipBlob = await zipResponse.blob();
  downloadBlob(zipBlob, ZIP_FILENAME);
}
