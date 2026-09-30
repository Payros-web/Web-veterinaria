// ==============================================================================
// CONEXIÓN CENTRALIZADA A SUPABASE (js/supabaseClient.js)
// ==============================================================================

// 1. Importamos la librería oficial desde CDN usando módulos ES6
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 2. Credenciales del proyecto
const SUPABASE_URL = 'https://ypxcaumukizkvupxdaoa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_KKUZbnBBuBt5gAQ3sAjy1A_Zd6oT0TE' // Tu Publishable key

// 3. Inicialización del cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)