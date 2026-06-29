#!/bin/bash
echo "بکاپ گرفتن از دیتابیس لایف استایل..."

BACKUP_DIR="$(dirname "$0")/backups"
DATE=$(date +%Y-%m-%d_%H-%M)

mkdir -p "$BACKUP_DIR"

pg_dump -U postgres lifestyle_db > "$BACKUP_DIR/backup_$DATE.sql"

echo "بکاپ ذخیره شد: $BACKUP_DIR/backup_$DATE.sql"

# حذف بکاپ‌های قدیمی‌تر از ۳۰ روز
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete 2>/dev/null

echo "تمام!"
