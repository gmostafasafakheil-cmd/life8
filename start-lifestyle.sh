#!/bin/bash
echo ""
echo "========================================"
echo "   لایف استایل در حال اجرا..."
echo "========================================"
echo ""

cd "$(dirname "$0")"

# Get local IP
if command -v hostname &> /dev/null; then
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}')
fi

echo "  کامپیوتر:  http://localhost:3000"
echo "  گوشی:     http://${LOCAL_IP:-آیپی-کامپیوتر}:3000"
echo ""
echo "========================================"
echo ""

npm start
