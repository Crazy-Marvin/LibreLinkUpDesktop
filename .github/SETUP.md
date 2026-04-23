# LibreLinkUpDesktop Setup

## Building the application.

Install Node.js 20 on your machine and go to the project root and run following command:

```bash
npm install --legacy-peer-deps
```

In order to generate the executables run following command:

```bash
npm run package
```

To generate executables for all platforms run this:

```bash
npm run package-all
```

Note: Executables can be found in `release/build` folder.

A [release](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/releases)
should include those executables:
- AppImage
- snap
- deb
- MSI
- EXE
- AppX (Windows Store)
- portable
- pkg

The ```version``` in the ```/release/app/package.json```, ```snap/gui/librelinkupdesktop.desktop``` and ```flathub/rocks.poopjournal.librelinkupdesktop.metainfo.xml``` need to be
increased following the rules of [Semantic Versioning](https://semver.org/).

## Customizing the application

- Localization is located on `src/renderer/i18n` folder.
- App configuration can be found on `src/renderer/config` folder

## Store releases

We officially support three stores:

- **[Flathub](https://flathub.org/apps/rocks.poopjournal.librelinkupdesktop)**

  [Releasing Guide](./UPDATING-FLATHUB-RELEASE.md)

- **[Snapcraft](https://snapcraft.io/librelinkupdesktop)**

  To release a new update, modify the version string in the `snapcraft.yaml` file (both in the version key and the electron-packager command).
  
- **[Microsoft Store](https://www.microsoft.com/store/apps/9N5RKKLQM5C9)**

  TBD

Note: Other (unofficial) releases might be done by the community. Please let us know by commenting in issue [#253](https://github.com/Crazy-Marvin/LibreLinkUpDesktop/issues/253) just so we know about it.  
