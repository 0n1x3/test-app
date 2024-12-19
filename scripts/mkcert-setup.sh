#!/bin/bash

# Проверяем установлен ли mkcert
if ! command -v mkcert &> /dev/null; then
    echo "mkcert не установлен. Устанавливаем..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install mkcert
        brew install nss # для Firefox
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y libnss3-tools
        # Скачиваем и устанавливаем mkcert
        curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
        chmod +x mkcert-v*-linux-amd64
        sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    fi
fi

# Устанавливаем локальный CA
mkcert -install

# Создаем сертификаты
mkdir -p ./certificates
mkcert -key-file ./certificates/key.pem -cert-file ./certificates/cert.pem localhost 127.0.0.1 