#!/bin/sh

sudo apt-get -y install git nodejs npm
sudo ln -s /usr/local/bin/node /usr/local/bin/nodejs
git clone https://github.com/redien/limbus-ci.git
cd limbus-ci
npm test
