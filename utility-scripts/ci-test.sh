#!/bin/sh

sudo apt-get -y install git nodejs npm
sudo ln -s /usr/bin/nodejs /usr/bin/node
git clone https://github.com/redien/limbus-ci.git
cd limbus-ci
npm test
