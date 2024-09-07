# ComfyUI Helper

This project provides a helper class `SettingsHelper` and `UiHelper` to streamline handling settings and UI interactions in ComfyUI extensions.

## Features
- Easily add and manage settings for ComfyUI.
- Settings can be of type `BOOLEAN`, `NUMBER`, `SLIDER`, `COMBO`, `TEXT`, `MULTILINE`, or `HIDDEN`.
- Automatically triggers events when settings are changed.
- Provides debounced event handling.
- Simple API for creating UI popups, sidebars, and managing async app state.

## Installation
Either download the latest [release](https://github.com/sn0w12/ComfyUIHelper/releases/latest) or clone the repository.

```javascript
import { SettingsHelper, UiHelper } from "./SettingsHelper.js";
```

# Settings Helper

## Initializing SettingsHelper and UiHelper

```javascript
const settingsHelper = new SettingsHelper("example");
const uiHelper = new UiHelper();
```

## Adding Settings

You can define a dict of settings and pass it to the `addSetting()` method. The setting must define properties such as `name`, `category`, `defaultValue`, `type`, and an optional `tooltip` and `onChange` handler.

Here’s an example:

```javascript
settingsHelper.addSetting({
    name: "Boolean",
    category: ["Example", "Example", "Boolean"],
    defaultValue: true,
    tooltip: "This is a boolean setting",
    type: settingsHelper.SettingsType.BOOLEAN,
    onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
});
```

Use settingsHelper.SettingsType to get a list of all usable types:
```javascript
BOOLEAN(),
NUMBER(),
SLIDER(min, max, step),
COMBO(...options),
TEXT(),
MULTILINE(),
HIDDEN(),
```

## Listening for Setting Changes

If you use the `settingsHelper.PresetOnChange.reloadSettings()` or manually send an event to `{prefix}.reloadSettings` you can use the `addReloadSettingsListener()` to run a function when a change is made:

```javascript
function onSettingsReload(event) {
    console.log(event);
}
settingsHelper.addReloadSettingsListener(onSettingsReload);
```

### Event Details

You can also send information with the `reloadSettings()`:

```javascript
const setting = {
    name: "Boolean",
    category: ["Example", "Example", "Boolean"],
    defaultValue: true,
    tooltip: "This is a boolean setting",
    type: settingsHelper.SettingsType.BOOLEAN,
    onChange: () => settingsHelper.PresetOnChange.reloadSettings(setting), // Send this setting in the event
};

settingsHelper.addSetting(setting);
```

This can then be gotten by the listener:

```javascript
function onSettingsReload(event) {
    console.log(event.detail);
}
settingsHelper.addReloadSettingsListener(onSettingsReload);
```

## Getting Settings

You can retrieve a setting using the `getSetting()` method:

```javascript
const setting = await settingsHelper.getSetting("Boolean");
```

# UI Helper

## Wait for ComfyUI to Load

You can also use `UiHelper` to wait for ComfyUI to load:

```javascript
await uiHelper.waitForComfy();
```

## Adding Toasts

Use `UiHelper` to display a popup notification (toast) in ComfyUI:

```javascript
uiHelper.addToast(
    uiHelper.Severity.WARNING,
    "Settings",
    "Updated settings.",
    2000 // Display for 2 seconds
);
```
