#!/bin/bash

# Очищаем старые сертификаты
rm -rf packages/frontend/certificates
mkdir -p packages/frontend/certificates
cd packages/frontend/certificates

# Генерируем новые сертификаты
openssl req -x509 -newkey rsa:4096 -nodes -keyout localhost-key.pem -out localhost.pem -days 365 -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Certificates generated successfully!" 