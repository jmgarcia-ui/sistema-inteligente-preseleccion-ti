

const api_url = import.meta.env.VITE_API_URL

if(!api_url)
  throw new Error('falta configurar VITE_API_URL')

export const configuracion = {api_url}