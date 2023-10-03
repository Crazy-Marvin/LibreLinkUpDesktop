![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Crazy-Marvin/LibreLinkUpDesktop/ci)
![License](https://img.shields.io/github/license/Crazy-Marvin/LibreLinkUpDesktop.svg)
[![Last commit](https://img.shields.io/github/last-commit/Crazy-Marvin/LibreLinkUpDesktop.svg?style=flat)](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/commits)
[![Releases](https://img.shields.io/github/downloads/Crazy-Marvin/LibreLinkUpDesktop/total.svg?style=flat)](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/releases)
[![Latest tag](https://img.shields.io/github/tag/Crazy-Marvin/LibreLinkUpDesktop.svg?style=flat)](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/tags)
[![Issues](https://img.shields.io/github/issues/Crazy-Marvin/LibreLinkUpDesktop.svg?style=flat)](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Crazy-Marvin/LibreLinkUpDesktop.svg?style=flat)](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/pulls)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ee372082360f422d933079be116bb554)](https://app.codacy.com/gh/Crazy-Marvin/LibreLinkUpDesktop/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
Translation status
[![Known Vulnerabilities](https://snyk.io/test/github/Crazy-Marvin/LibreLinkUpDesktop/badge.svg?targetFile=app%2Fbuild.gradle)](https://snyk.io/test/github/Crazy-Marvin/LibreLinkUpDesktop?targetFile=package.json)
[![Electron](https://img.shields.io/badge/-Electron-blue?logo=electron&?labelColor=white&link=https%3A%2F%2Fwww.electronjs.org%2F)](https://www.electronjs.org/)


# LibreLinkUpDesktop
This is a desktop application that fetches your blood sugar from [LibreLinkUp](https://librelinkup.com/).

It works like the official [LibreLinkUp smartphone app](https://play.google.com/store/apps/details?id=org.nativescript.LibreLinkUp) but on desktop clients like [Ubuntu](https://www.ubuntu.com/desktop/) or [Windows](https://www.windows.com/).

Under the hood, [Electron](https://www.electronjs.org/) is used with [TypeScript](https://www.typescriptlang.org/) and [Vue.js](https://vuejs.org/).   
As there is no offical API from [Abbott](https://www.freestyle.abbott/) yet, we use [this awesome client](https://github.com/DiaKEM/libre-link-up-api-client) from DiaKEM.

#### Features of LibreLinkUpDesktop:
- Show blood glucose level on your desktop in a little window
- No tracking
- Libre software
- That's it. 🩸

### Instructions:
  - As sharing person, open your [Libre smartphone app](https://play.google.com/store/apps/details?id=com.freestylelibre3.app.de), go to _Connected Apps_, click on _Manage_ next to LibreLinkUp, click on _Add connection_ and input the details for the account you wish to use with LibreLinkUpDesktop.
  - Save those credentials inside your password manager. You may use them for yourself or you may share them with someone.
  - Start LibreLinkUpDesktop and enter those credentials.
  - That's it. ☺️
 
  Let me know about any issues by opening a new [issue on GitHub](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/issues) or commenting on an existing issue if there is one already.

# Screenshots

Login | Main Screen | Settings
------------ | ------------- | -------------
![LibreLinkUpDesktop Login Screen](https://user-images.githubusercontent.com/15004217/112770031-dfa09e80-9024-11eb-983a-202d5166e958.jpg) | ![LibreLinkUpDesktop Main Screen](https://user-images.githubusercontent.com/15004217/112770033-e0393500-9024-11eb-97f6-20c13323dea0.jpg) | ![LibreLinkUpDesktop Settings Screen](https://user-images.githubusercontent.com/15004217/112770035-e0d1cb80-9024-11eb-9d24-62cea5d88b31.jpg)

# Contributing

The ```development``` or a feature branch is used while developing the code, and pushed into the master branch ```trunk``` afterwards for releases.
PRs to the ```trunk``` need at least one approving review before getting merged.

Help translate the app at [Hosted Weblate](https://hosted.weblate.org/engage/librelinkupdesktop/).

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

Check out the [contribution guidelines](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/blob/trunk/.github/CONTRIBUTING.md) for details please.

# License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
