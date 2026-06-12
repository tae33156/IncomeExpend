const OCR = (() => {
  let worker = null;

  async function getWorker() {
    if (!worker) {
      worker = await Tesseract.createWorker('tha+eng', 1, {
        logger: () => {}
      });
    }
    return worker;
  }

  async function recognize(imageSource) {
    const w = await getWorker();
    const { data: { text } } = await w.recognize(imageSource);
    return text;
  }

  function extractAmount(text) {
    // Thai baht patterns
    const patterns = [
      /(\d{1,3}(?:,\d{3})*\.\d{2})\s*บาท/,
      /บาท\s*(\d{1,3}(?:,\d{3})*\.\d{2})/,
      /฿\s*(\d{1,3}(?:,\d{3})*\.\d{2})/,
      /(\d{1,3}(?:,\d{3})*\.\d{2})\s*฿/,
      /จำนวนเงิน\s*(\d{1,3}(?:,\d{3})*\.\d{2})/,
      /(\d{1,3}(?:,\d{3})*\.\d{2})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    return null;
  }

  function extractDate(text) {
    // dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
    const patterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
      /(\d{1,2})\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*(\d{4})/,
    ];

    const match = text.match(patterns[0]);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  function extractName(text) {
    // Look for "ถึง", "รับ", "จ่าย", "ชื่อ" patterns
    const patterns = [
      /(?:ถึง|รับ|จ่ายให้|โอนให้|ชื่อ)\s*[:\-]?\s*(.+)/,
      /(?:From|To)\s*[:\-]?\s*(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const name = match[1].trim().substring(0, 50);
        if (name.length > 1) return name;
      }
    }
    return '';
  }

  async function processSlip(imageSource) {
    const text = await recognize(imageSource);
    return {
      rawText: text,
      amount: extractAmount(text),
      date: extractDate(text),
      name: extractName(text)
    };
  }

  return {
    processSlip
  };
})();
