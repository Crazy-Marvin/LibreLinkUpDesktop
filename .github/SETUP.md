## Building the application.

Install Node.js 20 on your machine and go to the project root and run following command:

```
npm install
```

In order to generate the executables run following command:

```
npm run package
```

To generate executables for all platforms run this:

```
npm run package-all
```

Note: Executables can be found in `release/build` folder.

## Customizing the application

- Localization is located on `src/renderer/i18n` folder.
- App configuration can be found on `src/renderer/config` folder
