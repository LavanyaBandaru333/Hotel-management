const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

export const safeFetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } else {
    const text = await res.text();
    return { 
      ok: false, 
      status: res.status, 
      data: { success: false, message: `Server error (${res.status}): ${text.substring(0, 100)}` } 
    };
  }
};
