# 🏠 راه‌اندازی محلی لایف استایل — بدون هاست

## این روش نیاز به چی داره؟
- یک کامپیوتر (ویندوز / مک / لینوکس)
- فقط همین! بدون هاست، بدون دامنه، بدون هزینه

---

## مرحله ۱: نصب نرم‌افزارهای لازم

### الف) نصب Node.js
1. برو به: https://nodejs.org
2. نسخه LTS رو دانلود و نصب کن
3. بعد از نصب، ترمینال/CMD رو باز کن و تست کن:
   ```
   node --version
   ```

### ب) نصب PostgreSQL
1. برو به: https://www.postgresql.org/download
2. سیستم‌عامل خودت رو انتخاب کن و نصب کن
3. حین نصب:
   - رمز عبور: `postgres` (یا هرچی خودت بخوای)
   - پورت: `5432` (پیش‌فرض)
4. بعد از نصب، ترمینال باز کن:
   ```
   psql -U postgres -c "CREATE DATABASE lifestyle_db;"
   ```

### ج) نصب Git (اختیاری)
- https://git-scm.com/downloads

---

## مرحله ۲: دانلود پروژه

### روش ۱ — با Git:
```bash
git clone <آدرس ریپازیتوری>
cd lifestyle-app
```

### روش ۲ — بدون Git:
- فایل ZIP پروژه رو دانلود کن
- از حالت فشرده خارج کن
- ترمینال رو در پوشه پروژه باز کن

---

## مرحله ۳: تنظیم و اجرا

ترمینال/CMD رو باز کن و این دستورات رو به ترتیب بزن:

```bash
# 1. نصب وابستگی‌ها
npm install

# 2. ساخت فایل تنظیمات
# ویندوز:
echo DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/lifestyle_db > .env

# مک/لینوکس:
echo 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/lifestyle_db' > .env

# 3. ساخت جداول دیتابیس
npx drizzle-kit push

# 4. بیلد پروژه
npm run build

# 5. اجرا
npm start
```

### تمام! 🎉
مرورگر رو باز کن: **http://localhost:3000**

---

## مرحله ۴: دسترسی از گوشی (WiFi)

اگه کامپیوتر و گوشیت به **یک WiFi** وصل هستن:

### پیدا کردن IP کامپیوتر:
- **ویندوز**: CMD → `ipconfig` → IPv4 Address (مثلاً 192.168.1.5)
- **مک**: Terminal → `ifconfig en0` → inet (مثلاً 192.168.1.5)
- **لینوکس**: Terminal → `hostname -I` (مثلاً 192.168.1.5)

### در گوشی:
مرورگر رو باز کن و بزن: **http://192.168.1.5:3000**
(بجای 192.168.1.5 آیپی کامپیوتر خودت رو بزن)

### نصب به عنوان اپ:
- اندروید: منوی ⋮ → Add to Home screen
- آیفون: Share ⬆️ → Add to Home Screen

---

## اجرای خودکار هنگام روشن شدن کامپیوتر

### ویندوز:
1. فایل `start-lifestyle.bat` رو در پوشه پروژه بساز (از قبل ساخته شده)
2. کلید Win+R → بزن `shell:startup` → Enter
3. فایل bat رو کپی کن توی پوشه Startup

### مک:
1. فایل `start-lifestyle.command` رو در پوشه پروژه بساز (از قبل ساخته شده)
2. System Settings → General → Login Items → اضافه کن

### لینوکس:
```bash
# با systemd
sudo cp lifestyle.service /etc/systemd/system/
sudo systemctl enable lifestyle
sudo systemctl start lifestyle
```

---

## بکاپ گرفتن از داده‌ها

### بکاپ دستی:
```bash
pg_dump -U postgres lifestyle_db > backup.sql
```

### بازیابی بکاپ:
```bash
psql -U postgres lifestyle_db < backup.sql
```

### بکاپ خودکار روزانه (فایل backup.bat/.sh از قبل ساخته شده):
- ویندوز: Task Scheduler
- مک/لینوکس: crontab

---

## خلاصه

| چی | کجا | هزینه |
|-----|------|-------|
| برنامه | کامپیوتر خودت | ۰ |
| دیتابیس | کامپیوتر خودت | ۰ |
| دسترسی گوشی | WiFi خانگی | ۰ |
| بکاپ | هارد خودت | ۰ |
| **کل هزینه** | | **رایگان** |
