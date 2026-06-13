# Slip Expense - รวมค่าใช้จ่ายจาก Slip โอนเงิน

## ภาพรวม
Mobile-friendly web app สำหรับบันทึกและสรุปค่าใช้จ่ายจาก slip โอนเงิน (PromptPay, ธนาคาร)

## Tech Stack
- HTML/CSS/JS (no build step, no framework)
- Tesseract.js v5 (CDN) — OCR อ่าน slip ภาษาไทย+อังกฤษ
- localStorage — เก็บข้อมูลรายการในเบราว์เซอร์

## Deployment
- GitHub Pages: https://tae33156.github.io/IncomeExpend/
- GitHub repo: https://github.com/tae33156/IncomeExpend
- Deploy: push to `main` → GitHub Pages auto rebuild (legacy mode)

## File Structure
```
index.html        — SPA shell (3 views: dashboard, add, summary + edit modal)
css/style.css     — Mobile-first responsive, max-width 480px
js/app.js         — Main logic, navigation, event handlers
js/storage.js     — localStorage CRUD (add/update/remove/getByDateRange)
js/ocr.js         — Tesseract.js wrapper, extract amount/date/name จาก slip
js/chart.js       — CSS bar chart สรุปตามหมวดหมู่
```

## ฟีเจอร์หลัก
- กรอกรายจ่าย/รายรับเอง พร้อมหมวดหมู่ 8 ประเภท (อาหาร, เดินทาง, ช้อปปิ้ง, บิล, บันเทิง, สุขภาพ, การศึกษา, อื่นๆ)
- ถ่ายรูป/เลือกรูป slip → OCR อ่านอัตโนมัติ (จำนวนเงิน, วันที่, ชื่อ)
- Dashboard สรุปยอดวันนี้/สัปดาห์/เดือน
- สรุปยอดตามหมวดหมู่ กรองตามช่วงเวลา
- แก้ไข/ลบรายการ (tap ที่รายการ)

## ข้อควรรู้
- ข้อมูลเก็บใน localStorage → ผูกกับ URL/origin, deploy ใหม่ข้อมูลไม่หาย
- ไม่มี backend/database → ข้อมูลอยู่เฉพาะในเบราว์เซอร์เครื่องนั้น
- รูป slip ที่ base64 เก็บใน localStorage (จำกัดขนาด < 500KB)
