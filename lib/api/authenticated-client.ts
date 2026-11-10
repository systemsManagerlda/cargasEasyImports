import { getSession } from 'next-auth/react';
import { apiClient } from './client';

export async function authenticatedPost<T>(
  url: string,
  data?: unknown
) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Sessão não autenticada');
  }

  return apiClient.post<T>(
    url,
    data,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );
}

export async function authenticatedGet<T>(
  url: string
) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Sessão não autenticada');
  }

  return apiClient.get<T>(
    url,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );
}

export async function authenticatedPut<T>(
  url: string,
  data?: unknown
) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Sessão não autenticada');
  }

  return apiClient.put<T>(
    url,
    data,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );
}

export async function authenticatedPatch<T>(
  url: string,
  data?: unknown
) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Sessão não autenticada');
  }

  return apiClient.patch<T>(
    url,
    data,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );
}

export async function authenticatedDelete<T>(
  url: string
) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('Sessão não autenticada');
  }

  return apiClient.delete<T>(
    url,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );
}
