import { createClient } from '@/app/lib/supabase/client';

export async function uploadAvatarAndGetPublicUrl(input: {
  userId: string;
  file: File;
}): Promise<string> {
  const supabase = createClient();

  const originalExt = input.file.name.split('.').pop()?.toLowerCase();
  const ext = originalExt && /^[a-z0-9]+$/.test(originalExt) ? originalExt : 'jpg';
  const objectPath = `${input.userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(objectPath, input.file, {
      upsert: true,
      cacheControl: '3600',
      contentType: input.file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error('Failed to get avatar public URL');
  }

  // Bust cache so UI updates immediately after uploading the new file
  const cacheBust = Date.now();
  return `${data.publicUrl}?v=${cacheBust}`;
}


