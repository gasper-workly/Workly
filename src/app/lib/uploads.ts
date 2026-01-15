import { createClient } from '@/app/lib/supabase/client';

/**
 * Upload an image to the public `uploads` bucket and return its public URL.
 *
 * Storage path format:
 *   uploads/{folder}/{uuid}.{ext}
 */
export async function uploadImageAndGetPublicUrl(input: {
  file: File;
  folder: string;
}): Promise<string> {
  const supabase = createClient();

  const originalExt = input.file.name.split('.').pop()?.toLowerCase();
  const ext = originalExt && /^[a-z0-9]+$/.test(originalExt) ? originalExt : 'jpg';

  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

  const cleanFolder = input.folder.replace(/^\/+|\/+$/g, '');
  const objectPath = `${cleanFolder}/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('uploads').upload(objectPath, input.file, {
    cacheControl: '3600',
    upsert: false,
    contentType: input.file.type || undefined,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from('uploads').getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error('Failed to get upload public URL');
  }

  // Bust cache so UI updates immediately
  return `${data.publicUrl}?v=${Date.now()}`;
}


