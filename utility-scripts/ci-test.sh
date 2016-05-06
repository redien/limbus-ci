#!/bin/sh

sudo apt-get -y install git nodejs npm
sudo ln -s /usr/local/bin/nodejs /usr/local/bin/node
git clone https://github.com/redien/limbus-ci.git
cd limbus-ci
npm test
