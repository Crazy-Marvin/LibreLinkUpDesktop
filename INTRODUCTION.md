# LibreLinkUpDekstop
Application to launcher the products the company offers.

## Building the application.
Install NodeJS 20 on your machine. And goto the project root and run following commands.
```
npm run install
```
In order to generate the executables. Run following. 
```
npm run package
```
To generate executables for all platforms run following.
```
npm run package-all
```

Note: Executables can be found on `release/build` folder

## Customizing the application
- Localization is located on `src/renderer/i18n` folder.
- App configuration can be found on `src/renderer/config` folder


# Release History.
Version 1.0.2
- Fix the Ubuntu app label.
- Fix app name typos.
- Fix trend arrow.
- Added norwegian language support.

Version 1.0.1
- Full localization on settings page.
- Fix the color codes for dashboard.
- Fix the arrow direction for the reading.
- Fix the app label.
- Fix the Typo on App Name.
- Added persistance storage.

Version 1.0.0
- Initial Release
