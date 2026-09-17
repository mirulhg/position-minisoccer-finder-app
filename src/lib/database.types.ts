/**
 * Ditulis tangan agar cocok dengan supabase/migrations/0001_init.sql — belum
 * ada project Supabase hidup untuk menjalankan `supabase gen types
 * typescript`. Generate ulang dan ganti file ini begitu project tersedia.
 * Bentuk generic (Row/Insert/Update/Relationships, Views, Functions)
 * mengikuti apa yang disyaratkan @supabase/postgrest-js.
 */
export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          nama: string;
          tinggi_cm: number;
          berat_kg: number;
          usia: number;
          kaki_dominan: 'kiri' | 'kanan' | 'keduanya';
          bersedia_kiper: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nama: string;
          tinggi_cm: number;
          berat_kg: number;
          usia: number;
          kaki_dominan: 'kiri' | 'kanan' | 'keduanya';
          bersedia_kiper: boolean;
        };
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
        Relationships: [];
      };
      attribute_profiles: {
        Row: {
          id: string;
          player_id: string;
          dibuat_pada: string;
          atribut: Record<string, number>;
          confidence: number;
          versi_konfigurasi: string;
          posisi_biasa: string | null;
        };
        Insert: {
          id?: string;
          player_id: string;
          dibuat_pada?: string;
          atribut: Record<string, number>;
          confidence: number;
          versi_konfigurasi: string;
          posisi_biasa: string | null;
        };
        Update: Partial<Database['public']['Tables']['attribute_profiles']['Insert']>;
        Relationships: [];
      };
      role_scores: {
        Row: {
          profile_id: string;
          role_code: string;
          base: number;
          gate: number;
          fit: number;
        };
        Insert: {
          profile_id: string;
          role_code: string;
          base: number;
          gate: number;
          fit: number;
        };
        Update: Partial<Database['public']['Tables']['role_scores']['Insert']>;
        Relationships: [];
      };
      scoring_configs: {
        Row: {
          versi: string;
          mean_stdev_per_atribut: Record<string, { mean: number; stdev: number }>;
          k_blending: number;
          gamma_gate: number;
          k_saturasi_frekuensi: number;
          aktif_sejak: string;
        };
        Insert: {
          versi: string;
          mean_stdev_per_atribut: Record<string, { mean: number; stdev: number }>;
          k_blending: number;
          gamma_gate: number;
          k_saturasi_frekuensi: number;
        };
        Update: Partial<Database['public']['Tables']['scoring_configs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
