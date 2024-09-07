# ComfyUI Helper

This project provides a helper class `SettingsHelper` and `UiHelper` to streamline handling settings and UI interactions in ComfyUI extensions.

## Features
- Easily add and manage settings for ComfyUI.
- Settings can be of type `BOOLEAN`, `NUMBER`, `SLIDER`, `COMBO`, `TEXT`, `MULTILINE`, or `HIDDEN`.
- Automatically triggers events when settings are changed.
- Provides debounced event handling.

## Installation
Either download the latest [release](https://github.com/sn0w12/ComfyUIHelper/releases/latest) or clone the repository.

```js
import { SettingsHelper, UiHelper } from "./SettingsHelper.js";
```

# Settings Helper

## Initializing SettingsHelper and UiHelper

```js
const settingsHelper = new SettingsHelper("example");
const uiHelper = new UiHelper();
```

## Adding Settings

You can define a dict of settings and pass it to the `addSetting()` method. The setting must define properties such as `name`, `category`, `defaultValue`, `type`, and an optional `tooltip` and `onChange` handler.

Here’s an example:

```js
settingsHelper.addSetting({
    name: "Boolean",
    category: ["Example", "Example", "Boolean"],
    defaultValue: true,
    tooltip: "This is a boolean setting",
    type: settingsHelper.SettingsType.BOOLEAN,
    onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
});
```

Use `settingsHelper.SettingsType` to get a list of all usable types:

```js
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

```js
function onSettingsReload(event) {
    console.log(event);
}
settingsHelper.addReloadSettingsListener(onSettingsReload);
```

### Event Details

You can also send information with the `reloadSettings()`:

```js
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

```js
function onSettingsReload(event) {
    console.log(event.detail);
}
settingsHelper.addReloadSettingsListener(onSettingsReload);
```

> <details>
>    <summary><i>Log</i></summary>
>
>   ```json
>   {
>       "name": "Boolean",
>       "category": [
>           "Example",
>           "Example",
>           "Boolean"
>       ],
>       "defaultValue": true,
>       "tooltip": "This is a boolean setting",
>       "id": "example.boolean",
>       "eventSrc": "individual"
>   }


## Getting Settings

You can retrieve a setting using the `getSetting()` method:

```js
const setting = await settingsHelper.getSetting("Boolean");
```

# UI Helper

## Wait for ComfyUI to Load

You can also use `UiHelper` to wait for ComfyUI to load:

```js
await uiHelper.waitForComfy();
```

## Adding Toasts

Use `UiHelper` to display a popup notification (toast) in ComfyUI:

```js
uiHelper.addToast(
    uiHelper.Severity.WARNING,
    "Settings",
    "Updated settings.",
    2000 // Display for 2 seconds
);
```

Use `uiHelper.Severity` to get a list of all usable severities:

```js
SUCCESS: "success",
INFO: "info",
WARNING: "warn",
ERROR: "error",
```
