
import { createClient } from '@supabase/supabase-js';

// On utilise les clés fournies pour s'assurer que le prototype fonctionne immédiatement
// tout en permettant le surclassement par les variables d'environnement si présentes.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://qfvccstjrssjsgwysgkk.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdmNjc3RqcnNzanNnd3lzZ2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTg1MzUsImV4cCI6MjA4MzY5NDUzNX0.1rxrdWSWVg0eHqktL4GNVYK_XO3l0d8y3RCTGi6C464';

if (!supabaseUrl) {
  console.error("Erreur de configuration : supabaseUrl est manquant.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
