// src/utils/pixPayload.js
/**
 * Pix Copia e Cola EMV Payload Generator (Brazilian Central Bank Standard)
 * Generates valid BR Code payloads that banking applications parse with exact amounts and keys.
 */

// CRC16 CCITT Calculation (polynomial 0x1021, initial value 0xFFFF)
function calculateCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatTLV(id, value) {
  const length = String(value.length).padStart(2, "0");
  return `${id}${length}${value}`;
}

function normalizeText(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
}

/**
 * Generates an official Pix Copia e Cola string with exact amount and merchant info.
 * @param {Object} params
 * @param {string} params.pixKey Driver's Pix key (CPF, phone, email or random key)
 * @param {string} params.name Driver name
 * @param {number|string} params.amount Ride price in BRL (e.g. 5.00)
 * @param {string} [params.city='JOAO MONLEVADE'] City name
 * @param {string} [params.txId='CARONA'] Reference transaction identifier
 */
export function generatePixCopiaECola({ pixKey, name, amount, city = "JOAO MONLEVADE", txId = "CARONA" }) {
  if (!pixKey) return "";

  const cleanKey = pixKey.trim();
  const cleanName = (normalizeText(name) || "MOTORISTA UFOP").slice(0, 25);
  const cleanCity = (normalizeText(city) || "JOAO MONLEVADE").slice(0, 15);
  const cleanTxId = (normalizeText(txId) || "CARONA").replace(/ /g, "").slice(0, 25);
  const formattedAmount = Number(amount || 0).toFixed(2);

  // 00: Format Indicator
  let payload = formatTLV("00", "01");

  // 26: Merchant Account Information (Pix)
  const gui = formatTLV("00", "br.gov.bcb.pix");
  const key = formatTLV("01", cleanKey);
  payload += formatTLV("26", `${gui}${key}`);

  // 52: Merchant Category Code (0000 = general)
  payload += formatTLV("52", "0000");

  // 53: Transaction Currency (986 = BRL)
  payload += formatTLV("53", "986");

  // 54: Transaction Amount
  if (Number(formattedAmount) > 0) {
    payload += formatTLV("54", formattedAmount);
  }

  // 58: Country Code (BR)
  payload += formatTLV("58", "BR");

  // 59: Merchant Name
  payload += formatTLV("59", cleanName);

  // 60: Merchant City
  payload += formatTLV("60", cleanCity);

  // 62: Additional Data Field (TxID)
  const txIdField = formatTLV("05", cleanTxId || "***");
  payload += formatTLV("62", txIdField);

  // 63: CRC16 prefix
  payload += "6304";
  const crc = calculateCRC16(payload);

  return `${payload}${crc}`;
}
