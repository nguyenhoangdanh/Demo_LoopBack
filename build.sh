#!/bin/sh
echo "Install dependencies..."
yarn install

# Building
echo "Build application..."

if [ "$1" = "admin" ]; then
  echo "Admin is building..."
  yarn workspace hrm-admin run build
elif [ "$1" = "server" ]; then
  echo "Server is building..."
  yarn workspace hrm-server run rebuild
else
  echo "Server & Admin are building..."
  yarn workspace hrm-admin build
  yarn workspace hrm-server rebuild
fi

echo "Build finished!"
