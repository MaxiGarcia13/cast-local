/** Copy a picker File into memory so later reads don't hit NotReadableError. */
export async function snapshotFile(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  return new File([buffer], file.name, {
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified,
  });
}

export async function snapshotFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => snapshotFile(file)));
}
