import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = {
    time: new Date().toISOString(),
    vercel: {
      env: process.env.VERCEL_ENV ?? null,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      url: process.env.VERCEL_URL ?? null,
      git: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
      },
    },
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

