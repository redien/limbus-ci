# limbus-ci
![version](http://img.shields.io/badge/version-0.1.0-blue.svg) [![Public Domain](http://img.shields.io/badge/public%20domain%3F-yes-blue.svg)](http://creativecommons.org/publicdomain/zero/1.0/) [![SemVer](http://img.shields.io/badge/SemVer-2.0.0-blue.svg)](http://semver.org/spec/v2.0.0.html) ![development stage](http://img.shields.io/badge/development%20stage-alpha-orange.svg)

#### Introduction

limbus-ci is a simple CI solution for testing applications that need support of a lot of platforms.
By running bare-bones installations of different operating system installations limbus-ci can test applications on a wide array of different configurations that the end-user might use.

#### Table of contents
* [Installation](#installation)
* [Usage](#usage)
* [Continuous Integration](#continuous-integration)
* [Development](#development)
* [Roadmap](#roadmap)
* [Copyright](#copyright)

<a name="installation"></a>
## Installation
limbus-ci runs using Node.js.

You can install the CLI application through NPM.
```
npm install -g limbus-ci
```

#### Cloning with git
Another way to get a hold of limbus-ci is to clone it from the git repository.

To get the latest version:
```
git clone https://github.com/redien/limbus-ci.git
```

#### Download ZIP
You can also get the library by manually downloading and extracting the ZIP file at: https://github.com/redien/limbus-ci/archive/master.zip

<a name="usage"></a>
## Usage

To run a job with a specific VM image use:
```
limbus-ci run job IMAGE_PATH
```

<a name="continuous-integration"></a>
## Continuous Integration
Acceptance and unit tests are automatically run against all supported platforms.
Tests are run using limbus-ci.

#### Integration matrix
| Platform | Build Status | Operating System |
| :------- | :----------: | :--------------- |
|||

<a name="development"></a>
## Development
[![Dependencies](https://david-dm.org/redien/limbus-ci.svg)](https://david-dm.org/redien/limbus-ci) [![devDependencies](https://david-dm.org/redien/limbus-ci/dev-status.svg)](https://david-dm.org/redien/limbus-ci#info=devDependencies)

For development you need some extra dependencies. Install them using NPM with:

```
npm install
```

#### Test
limbus-ci performs acceptance testing using Cucumber.js.

Run both acceptance- and unit tests using:
```
npm test
```

To run each separately, use `npm run unit-test` for unit tests and `npm run integration-test` for integration tests.

#### Code coverage
[![Coverage Status](https://img.shields.io/coveralls/redien/limbus-ci.svg)](https://coveralls.io/r/redien/limbus-ci?branch=master)

<a name="roadmap"></a>
## Roadmap

<a name="copyright"></a>
## Copyright
limbus-ci - A simple CI solution for testing extremely portable applications.

Written in 2016 by Jesper Oskarsson jesosk@gmail.com

To the extent possible under law, the author(s) have dedicated all copyright
and related and neighboring rights to this software to the public domain worldwide.
This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along with this software.
If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
