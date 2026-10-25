'use client'

import axios from 'axios'

export const api = axios.create()

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('inventory.token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function rememberToken(token: string) {
  window.localStorage.setItem('inventory.token', token)
}

export function forgetToken() {
  window.localStorage.removeItem('inventory.token')
}
