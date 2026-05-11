/**
 * Calculations for Printing Press ERP
 */

/**
 * Calculate paper required in Reams
 * Formula: (Qty * NoOfForms / 500) + Wastage%
 */
export function calculatePaperReam(qty: number, forms: number, wastagePercent: number): number {
  const base = (qty * forms) / 500;
  const wastage = base * (wastagePercent / 100);
  return Number((base + wastage).toFixed(2));
}

/**
 * Calculate paper required in Kg
 * Formula: PaperInReam * ReamWeight
 */
export function calculatePaperKg(reamQty: number, reamWeight: number): number {
  return Number((reamQty * reamWeight).toFixed(2));
}

/**
 * Calculate number of plates required
 * Rules: Always even number, round up.
 * Basic Formula: NoOfForms * NoOfColors * 2
 */
export function calculatePlates(forms: number, colors: number): number {
  let plates = forms * colors * 2;
  if (plates % 2 !== 0) {
    plates += 1;
  }
  return plates;
}

/**
 * Alternative Plate Calculation
 * Formula: (Pages / Ups) * Colors
 * Note: Must be rounded to next even number if odd.
 */
export function calculatePlatesAlt(pages: number, ups: number, colors: number): number {
  let plates = (pages / ups) * colors;
  plates = Math.ceil(plates);
  if (plates % 2 !== 0) {
    plates += 1;
  }
  return plates;
}
