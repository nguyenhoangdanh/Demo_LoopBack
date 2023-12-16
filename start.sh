#!/bin/sh
# echo "Python install..."
# apt update
# apt install -y python3 python3-pip python3-venv
#
# echo "Python setup..."
# python3 -m venv venv && . venv/bin/activate
# python3 -m pip install --no-cache-dir --upgrade pip
# pip install --no-cache-dir -r requirements.txt
# mkdir ./apps/hrm-server/src/face-imgs
#
# echo "Python done!"

# sh ./build.sh server

echo "Install dependencies..."
yarn install

echo "Starting server...!"
NODE_ENV=production RUN_MODE=startup DEBUG=false node --trace-warnings -r source-map-support/register -r dotenv-flow/config ./apps/hrm-server/dist
