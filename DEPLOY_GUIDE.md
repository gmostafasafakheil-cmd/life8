# 🚀 راهنمای دیپلوی لایف استایل — لینک دائمی

## روش ۱: Vercel + Neon (رایگان — پیشنهادی)

### مرحله ۱: ساخت دیتابیس رایگان در Neon

1. به سایت **[neon.tech](https://neon.tech)** بروید
2. ثبت‌نام کنید (با Google یا GitHub)
3. دکمه **Create Project** را بزنید
4. نام پروژه: `lifestyle`
5. Region: نزدیک‌ترین به خودتان
6. بعد از ساخت، **Connection String** را کپی کنید:
   ```
   postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```

---

### مرحله ۲: آپلود کد روی GitHub

1. به **[github.com](https://github.com)** بروید و ثبت‌نام/ورود کنید
2. یک **Repository جدید** بسازید:
   - نام: `lifestyle-app`
   - نوع: Private (خصوصی)
3. در ترمینال کامپیوتر خود:
   ```bash
   # اول Git را نصب کنید (اگر ندارید)
   
   cd پوشه-پروژه
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/lifestyle-app.git
   git push -u origin main
   ```

---

### مرحله ۳: دیپلوی روی Vercel

1. به **[vercel.com](https://vercel.com)** بروید
2. با **GitHub** وارد شوید
3. دکمه **Add New → Project** را بزنید
4. ریپازیتوری `lifestyle-app` را انتخاب کنید
5. در بخش **Environment Variables** این متغیر را اضافه کنید:
   ```
   نام: DATABASE_URL
   مقدار: postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```
   (همان Connection String از Neon)
6. دکمه **Deploy** را بزنید
7. صبر کنید تا بیلد تمام شود (۲-۳ دقیقه)

---

### مرحله ۴: ساخت جداول دیتابیس

بعد از دیپلوی موفق، در ترمینال:
```bash
# در پوشه پروژه
DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require" npx drizzle-kit push
```

یا از طریق **Neon Console** → **SQL Editor**:
جداول خودکار با اولین درخواست ساخته می‌شوند.

---

### نتیجه:
آدرس دائمی شما: **https://lifestyle-app.vercel.app**

---

## روش ۲: Railway (ساده‌تر، رایگان محدود)

1. به **[railway.app](https://railway.app)** بروید
2. با GitHub وارد شوید
3. **New Project → Deploy from GitHub** را بزنید
4. ریپازیتوری را انتخاب کنید
5. **Add PostgreSQL** را بزنید (دیتابیس خودکار ساخته می‌شود)
6. متغیر `DATABASE_URL` خودکار تنظیم می‌شود
7. Deploy!

---

## روش ۳: VPS شخصی (کنترل کامل)

### نیازمندی‌ها:
- سرور لینوکس (Ubuntu 22+)
- دامنه (اختیاری)
- Node.js 18+
- PostgreSQL 15+

### مراحل:
```bash
# 1. نصب Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. نصب PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createdb lifestyle_db
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'yourpassword';"

# 3. کلون پروژه
git clone https://github.com/USERNAME/lifestyle-app.git
cd lifestyle-app

# 4. نصب وابستگی‌ها
npm install

# 5. تنظیم محیط
echo 'DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/lifestyle_db' > .env

# 6. ساخت جداول
npx drizzle-kit push

# 7. بیلد
npm run build

# 8. اجرا با PM2
npm install -g pm2
pm2 start npm --name "lifestyle" -- start
pm2 save
pm2 startup
```

### تنظیم Nginx (برای دامنه):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL رایگان:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## مقایسه روش‌ها

| ویژگی | Vercel + Neon | Railway | VPS |
|--------|-------------|---------|-----|
| هزینه | رایگان | رایگان محدود | ماهانه ۵-۱۰$ |
| سختی | آسان | خیلی آسان | متوسط |
| دامنه رایگان | ✅ | ✅ | ❌ (نیاز به خرید) |
| SSL | ✅ خودکار | ✅ خودکار | دستی |
| مقیاس‌پذیری | عالی | خوب | بسته به سرور |
| دیتابیس | جداگانه (Neon) | یکجا | یکجا |
| پشتیبانی PWA | ✅ | ✅ | ✅ |

---

## 📲 بعد از دیپلوی — نصب اپ روی گوشی

1. آدرس دائمی را در مرورگر گوشی باز کنید
2. **اندروید**: بنر نصب ظاهر می‌شود یا منوی ⋮ → Add to Home screen
3. **آیفون**: دکمه Share ⬆️ → Add to Home Screen → Add
4. اپ مثل اپ واقعی روی صفحه اصلی ظاهر می‌شود!
