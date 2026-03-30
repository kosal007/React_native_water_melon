const API_URL = 'http://192.168.10.68:3000/api';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status} - ${body}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  } catch (error) {
    console.error(`API error for ${path}:`, error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const fetchProducts = async () => {
  try {
    return await request('/products', { method: 'GET' });
  } catch (error) {
    console.error('fetchProducts failed:', error);
    return [];
  }
};

export const createProduct = async (product) => {
  try {
    return await request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  } catch (error) {
    console.error('createProduct failed:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    return await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  } catch (error) {
    console.error('updateProduct failed:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    return await request(`/products/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteProduct failed:', error);
    throw error;
  }
};

export const syncPull = async (lastPulledAt) => {
  try {
    const value = Number(lastPulledAt || 0);
    return await request(`/sync/pull?lastPulledAt=${value}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('syncPull failed:', error);
    throw error;
  }
};

export const syncPush = async (changes) => {
  try {
    return await request('/sync/push', {
      method: 'POST',
      body: JSON.stringify(changes),
    });
  } catch (error) {
    console.error('syncPush failed:', error);
    throw error;
  }
};
