const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Returns today's local date string in YYYY-MM-DD format (avoids UTC timezone shift).
 */
export const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a YYYY-MM-DD string or Date into Thai short date.
 * Example: 2026-09-24 -> 24 ก.ย. 2569
 */
export const formatThaiDate = (dateString, useBuddhistYear = true) => {
  if (!dateString) return '-';
  const parts = String(dateString).split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    const monthName = THAI_MONTHS_SHORT[month - 1] || '';
    const bYear = year + (useBuddhistYear ? 543 : 0);
    return `${day} ${monthName} ${bYear}`;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear() + (useBuddhistYear ? 543 : 0);

  return `${day} ${month} ${year}`;
};

/**
 * Formats an ISO datetime string into Thai Time (e.g. 08:05 น.)
 */
export const formatThaiTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} น.`;
};

/**
 * Formats ISO datetime string into Thai full date and time.
 * Example: 24 ก.ย. 2569 เวลา 08:05 น.
 */
export const formatThaiDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return `${formatThaiDate(isoString)} เวลา ${formatThaiTime(isoString)}`;
};
