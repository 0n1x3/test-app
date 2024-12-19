#!/bin/bash

CERT_DIR="$HOME/.local/share/mkcert"
CERT_FILE="$CERT_DIR/rootCA.pem"

if [ ! -f "$CERT_FILE" ]; then
    echo "Сертификат не найден в $CERT_FILE"
    exit 1
fi

# Для Ubuntu/Debian
if command -v update-ca-certificates &> /dev/null; then
    sudo cp "$CERT_FILE" /usr/local/share/ca-certificates/mkcert-local-cert.crt
    sudo update-ca-certificates
    echo "Сертификат установлен в систему"
fi

# Для Chrome/Chromium
if [ -d "$HOME/.pki/nssdb" ]; then
    certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "mkcert local CA" -i "$CERT_FILE"
    echo "Сертификат установлен в Chrome/Chromium"
fi

echo "Установка завершена"
