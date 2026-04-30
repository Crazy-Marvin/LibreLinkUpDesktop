# LibreLinkUpDesktop Flathub Update Guide

## Important

Before proceeding with the Flathub build manifest update, it is crucial to test the build and run it locally.

## Prerequisites

Ensure the following tools are installed on your system:
- Flatpak
- Flatpak Builder
- org.electronjs.Electron2.BaseApp//23.08
- org.freedesktop.Sdk.Extension.node20//23.08

Execute the following commands to install the necessary tools:

```bash
sudo apt install flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub org.flatpak.Builder
flatpak install flathub org.electronjs.Electron2.BaseApp//23.08
flatpak install flathub org.freedesktop.Sdk.Extension.node20//23.08
sudo apt install flatpak-builder
```

## Process

1. **Clone the Repository:**   
   Clone or fork the Flathub repository from [https://github.com/flathub/rocks.poopjournal.librelinkupdesktop](https://github.com/flathub/rocks.poopjournal.librelinkupdesktop).

2. **Update the Manifest:**   
   Modify the manifest file with the new tag and commit the changes.

3. **Generate Generated Sources:**   
   To build locally, you may copy the generated sources from [https://github.com/Crazy-Marvin/LibreLinkUpDesktop](https://github.com/Crazy-Marvin/LibreLinkUpDesktop) or regenerate a new file as described in the "Updating Node Modules" section.

4. **Build and Install:**   
   Execute the command `flatpak-builder --user --install --force-clean build rocks.poopjournal.librelinkupdesktop.yml` to build and install the application.

5. **Run the Application:**   
   Launch the application using the command `flatpak run rocks.poopjournal.librelinkupdesktop`.

6. **Finalize the Update:**   
   If the application runs successfully, commit and push the changes (`generated-sources.json` and `rocks.poopjournal.librelinkupdesktop.yml` files) to the repository. Then, create a pull request to the master branch for the new release.

## Updating Node Modules

If the node modules have been updated, follow these steps to update the `generated-sources.json` file.

### Prerequisites
- Python 3.8
- pipx
- flatpak-node-generator

#### Setup

1. Clone the Flatpak Builder Tools repository from [https://github.com/flatpak/flatpak-builder-tools](https://github.com/flatpak/flatpak-builder-tools).

2. Navigate to the `node` directory and install the tools using `pipx install .`. For more details, refer to the README at [https://github.com/flatpak/flatpak-builder-tools/blob/master/node/README.md](https://github.com/flatpak/flatpak-builder-tools/blob/master/node/README.md).

3. Ensure your PATH is correctly set up with `pipx ensurepath`.

### Process

1. **Clone the Source Repository:**   
   Clone the LibreLinkUpDesktop source repository from [https://github.com/Crazy-Marvin/LibreLinkUpDesktop](https://github.com/Crazy-Marvin/LibreLinkUpDesktop).

2. **Prepare the Directory:**   
   Ensure the `node_modules` folder does not exist in your clone of the repository.

3. **Generate Sources:**   
   Run `flatpak-node-generator npm package-lock.json` to generate the new sources.

4. **Test the Build Locally:**   
   Follow the guide above to test the build locally.

5. **Update the Repository:**   
   Commit the updated `generated-sources.json` file to the LibreLinkUpDesktop repository.

   Note: Ensure the `generated-sources.json` file is present in both the Flathub repository and the upstream repository.
