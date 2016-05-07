#!/bin/sh

# Installation
sudo apt-get update
sudo apt-get -y install git vagrant virtualbox
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
source /home/vagrant/.bashrc

# Testing
git clone https://github.com/redien/limbus-ci.git
cd limbus-ci
npm test
