# ComfyUI Helper

This project provides a helper class `SettingsHelper` and `UiHelper` to streamline handling settings and UI interactions in ComfyUI extensions.

## Features
- Easily add and manage settings for ComfyUI.
- Extensively documented methods.
- Settings can be of type `BOOLEAN`, `NUMBER`, `SLIDER`, `COMBO`, `TEXT`, `MULTILINE`, or `HIDDEN`.
- Easily triggers events when settings are changed.
- Provides debounced event handling.

![Settings](https://i.imgur.com/RqoMTvf.png)

## Installation
Either download the latest [release](https://github.com/sn0w12/ComfyUIHelper/releases/latest) or clone the repository.

# Settings Helper

## Initializing SettingsHelper and UiHelper

```js
import { SettingsHelper, UiHelper } from "./ComfyUIHelper/ComfyHelper.js";

const settingsHelper = new SettingsHelper("example");
const uiHelper = new UiHelper();
```

## Adding Settings

You can define a dict of settings and pass it to the `addSetting()` method. The setting must define properties such as `name`, `category`, `defaultValue`, `type`, and an optional `tooltip` and `onChange` handler. The function automatically generates the settings id.

The category is built like this: `[Main Name, Category Name, Setting Name]`. `Main Name` is the name seen on the left and is often the name of your extension, `Category Name` is the category the the setting is sorted into and `Setting Name` is not seen.

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

The examples id would be `example.boolean`, where `example` is the prefix we provide when we create the `SettingsHelper` and boolean is the slugified `name`.

Use `settingsHelper.SettingsType` to get a list of all usable types:

```js
BOOLEAN(),
NUMBER(),
SLIDER(min, max, step),
COMBO(...options),
TEXT(),
MULTILINE(), // Multiline is not an official setting type.
HIDDEN(),
```

### Setting id

Since the helper assigns the id of the setting automatically (if you don't provide one) it might be a little unclear what a settings id is. You can use the `getSettingId()` function to get the id of a setting if you pass the name you gave the setting.

```js
settingsHelper.getSettingId("Boolean");
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

<details>
  <summary>Log</summary>

```json
{
    "name": "Boolean",
    "category": [
        "Example",
        "Example",
        "Boolean"
    ],
    "defaultValue": true,
    "tooltip": "This is a boolean setting",
    "id": "example.boolean",
    "eventSrc": "individual"
}
```
</details>

## Getting Settings

You can retrieve a setting using the `getSetting()` method:

```js
const setting = await settingsHelper.getSetting("Boolean");
```

You can get multiple settings using the `getMultipleSettings()` method:

```js
const settings = await settingsHelper.getMultipleSettings("Boolean", "example.boolean");
```

You can get all ComfyUI settings if you use the `getAllSettings()` method. This returns a map of all settings and their current value, this map is also stored in `SettingsHelper.allSettings`.

```js
const allSettings = await settingsHelper.getAllSettings();
const allSettings = SettingsHelper.allSettings; // cached settings.
```

## Setting Settings

You can set a setting with the `setSetting()` method:

```js
settingsHelper.setSetting("Boolean", true);
```

# UI Helper

## Wait for ComfyUI to Load

You can use `UiHelper` to wait for ComfyUI to load:

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

# Examples

<details>
    <summary>Examples of All Setting Types</summary>

```js
const settingsDefinitions = [
    {
        name: "Boolean",
        category: ["Example", "Example", "Boolean"],
        defaultValue: true,
        tooltip: "This is a boolean setting",
        type: settingsHelper.SettingsType.BOOLEAN,
        onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Number",
        category: ["Example", "Example", "Number"],
        defaultValue: 10,
        tooltip: "This is a number setting",
        type: settingsHelper.SettingsType.NUMBER,
        onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Combo",
        category: ["Example", "Example", "Combo"],
        defaultValue: "combo1",
        tooltip: "This is a combo setting",
        prefix: "beta",
        type: settingsHelper.SettingsType.COMBO(
            { text: "Combo 1", value: "combo1" },
            { text: "Combo 2", value: "combo2" },
            { text: "Combo 3", value: "combo3" },
        ),
        onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Text",
        category: ["Example", "Example 2", "Text"],
        defaultValue: "Example",
        tooltip: "This is a text setting",
        type: settingsHelper.SettingsType.TEXT,
        onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Multiline",
        tooltip: "This is a multiline setting",
        category: ["Example", "Example 2", "Multiline"],
        defaultValue: "Example\nExample\nExample\nExample\nExample\nExample",
        type: settingsHelper.SettingsType.MULTILINE,
        onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Slider",
        category: ["Example", "Example 2", "Slider"],
        defaultValue: 50,
        tooltip: "This is a slider setting",
        type: settingsHelper.SettingsType.SLIDER(0, 100, 1),
        onChange: () => settingsHelper.PresetOnChange.reloadSettings(settingsDefinitions[5]), // Send this setting in the event
    },
]
settingsHelper.addSettings(settingsDefinitions);
```
</details>

