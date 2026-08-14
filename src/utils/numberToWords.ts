/**
 * Converts a number to Indian currency words format (Lakhs, Crores, Rupees and Paise)
 */
export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num <= 0) return 'Rupees Zero Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return singleDigits[n];
    const tensDigit = Math.floor(n / 10);
    const unitDigit = n % 10;
    return tens[tensDigit] + (unitDigit !== 0 ? ' ' + singleDigits[unitDigit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred > 0) {
      result += singleDigits[hundred] + ' Hundred';
      if (rest > 0) result += ' and ';
    }
    if (rest > 0) {
      result += convertTwoDigits(rest);
    }
    return result;
  }

  const [rupeesStr, paiseStr] = num.toFixed(2).split('.');
  let rupees = parseInt(rupeesStr, 10);
  const paise = parseInt(paiseStr, 10);

  if (rupees === 0 && paise === 0) return 'Rupees Zero Only';

  let words = '';

  // Crores (1,00,00,000)
  const crores = Math.floor(rupees / 10000000);
  rupees %= 10000000;

  // Lakhs (1,00,000)
  const lakhs = Math.floor(rupees / 100000);
  rupees %= 100000;

  // Thousands (1,000)
  const thousands = Math.floor(rupees / 1000);
  rupees %= 1000;

  // Hundreds and units
  const remaining = rupees;

  if (crores > 0) {
    words += convertThreeDigits(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertTwoDigits(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertTwoDigits(thousands) + ' Thousand ';
  }
  if (remaining > 0) {
    words += convertThreeDigits(remaining) + ' ';
  }

  let finalWords = 'Rupees ' + words.trim();

  if (paise > 0) {
    finalWords += ' and ' + convertTwoDigits(paise) + ' Paise';
  }

  finalWords += ' Only';
  return finalWords.replace(/\s+/g, ' ');
}
