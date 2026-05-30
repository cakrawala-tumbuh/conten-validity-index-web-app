/**
 * Tipe-tipe TypeScript untuk hasil kalkulasi CVI.
 *
 * Merupakan mirror dari Pydantic schema `cvi.py` di backend.
 * CVI (Content Validity Index) dihitung berdasarkan konvensi Lynn (1986).
 */

/**
 * Hasil CVI untuk satu item instrumen.
 */
export interface ItemCVIResult {
  item_id: string;
  sequence_number: number;
  content: string;
  domain: string | null;
  /** Jumlah expert yang menilai item ini. */
  n_experts: number;
  /** Jumlah expert yang menilai item relevan (skor 3 atau 4). */
  n_relevant: number;
  /** I-CVI: rasio expert yang menilai relevan, antara 0.0 dan 1.0. */
  i_cvi: number;
  /** True jika I-CVI memenuhi threshold validitas Lynn (1986). */
  is_valid: boolean;
}

/**
 * Hasil kalkulasi CVI lengkap untuk satu instrumen.
 */
export interface CVIResult {
  instrument_id: string;
  instrument_name: string;
  /** Total jumlah expert yang dinilai. */
  n_experts: number;
  /** Total jumlah item dalam instrumen. */
  n_items: number;
  /** Hasil CVI per item. */
  items: ItemCVIResult[];
  /** S-CVI/Ave: rata-rata dari semua I-CVI, antara 0.0 dan 1.0. */
  s_cvi_ave: number;
  /** S-CVI/UA: proporsi item dengan I-CVI = 1.0 (universal agreement). */
  s_cvi_ua: number;
}
