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

You can define a dict of settings and pass it to the `addSetting()` method. The setting must define properties such as `name`, `category`, `defaultValue`, `type`, and an optional `tooltip` and `onChange` handler. The function automatically generates the settings id, but you can manually pass in an id if you want to. For adding multiple settings at the same time, see the [examples](#examples).

The category is built like this: `[Main Name, Category Name, Setting Name]`. `Main Name` is the name seen on the left and is often the name of your extension, `Category Name` is the category the the setting is sorted into and `Setting Name` is not seen.

Here’s an example:

```js
settingsHelper.addSetting({
    name: "Boolean",
    category: ["Example", "Example", "Boolean"],
    defaultValue: true,
    tooltip: "This is a boolean setting",
    type: SettingsHelper.SettingsType.BOOLEAN,
    onChange: (newValue, oldValue) => SettingsHelper.PresetOnChange.reloadSettings(),
});
```

The examples id would be `example.boolean`, where `example` is the prefix we provide when we create the `SettingsHelper` and boolean is the slugified `name`.

Use `SettingsHelper.SettingsType` to get a list of all usable types, you can also use the shortcut `SettingsHelper.ST`:

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

If you use the `SettingsHelper.PresetOnChange.reloadSettings()` or manually send an event to `{prefix}.reloadSettings` you can use the `addReloadSettingsListener()` to run a function when a change is made:

```js
function onSettingsReload(event) {
    console.log(event);
}
settingsHelper.addReloadSettingsListener(onSettingsReload);
```

### Event Details

You can also send information with the `reloadSettings()`, PC is a shortcut to `PresetOnChange`:

```js
const setting = {
    name: "Boolean",
    category: ["Example", "Example", "Boolean"],
    defaultValue: true,
    tooltip: "This is a boolean setting",
    type: SettingsHelper.ST.BOOLEAN,
    onChange: () => SettingsHelper.PC.reloadSettings(setting), // Send this setting in the event
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
    UiHelper.Severity.WARNING,
    "Settings",
    "Updated settings.",
    2000 // Display for 2 seconds
);
```

Use `UiHelper.Severity` or `UiHelper.S` to get a list of all usable severities:

```js
SUCCESS: "success",
INFO: "info",
WARNING: "warn",
ERROR: "error",
```

## Node Context Menu

You can use the `addContextMenu(nodeType, menuItem, insertIndex)` method to add to the context menu of a node. `nodeType` is the name of the node, for example `Load Checkpoint`. `menuItem` is a dictionary, see below for more details. `insertIndex` is either an int or a function that returns an int, it will decide where in the context menu the menu item is placed.

```js
uiHelper.addContextMenu("Example Node", menuItem, UiHelper.PresetInsertIndex.aboveOption("Title"));
```

There are preset insert functions found in `UiHelper.PresetInsertIndex` or `UiHelper.PI`.

```js
aboveOption(optionContent, occurrence)
underOption(optionContent, occurrence)
atEnd()
atStart()
```

### Context Menu Items

You can easily create a context menu item with the `createContextMenuItem()` method. It simply returns a dictionary that looks like this:

```js
// With function
const menuItem = uiHelper.createContextMenuItem("example", false, () => console.log("example"));
// Witout function
const menuItem = {
    content: "example",
    disabled: false,
    callback: () => console.log("example"),
};
```

If you want to create a group of items, where the user has to open the group to see all the options you can use the `createContextMenuGroup()` method. It is also really simple and just looks like this:

```js
// With function
const menuGroup = uiHelper.createContextMenuGroup("Example", menuItem1, menuItem2, menuItem3)
// Witout function
const menuGroup = {
    content: "Example",
    disabled: false,
    has_submenu: true,
    submenu:  {
        options: [
            menuItem1,
            menuItem2,
            menuItem3,
        ]
    }
};
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
        type: SettingsHelper.SettingsType.BOOLEAN,
        onChange: () => SettingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Number",
        category: ["Example", "Example", "Number"],
        defaultValue: 10,
        tooltip: "This is a number setting",
        type: SettingsHelper.SettingsType.NUMBER,
        onChange: () => SettingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Combo",
        category: ["Example", "Example", "Combo"],
        defaultValue: "combo1",
        tooltip: "This is a combo setting",
        prefix: "beta",
        type: SettingsHelper.SettingsType.COMBO(
            { text: "Combo 1", value: "combo1" },
            { text: "Combo 2", value: "combo2" },
            { text: "Combo 3", value: "combo3" },
        ),
        onChange: () => SettingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Text",
        category: ["Example", "Example 2", "Text"],
        defaultValue: "Example",
        tooltip: "This is a text setting",
        type: SettingsHelper.SettingsType.TEXT,
        onChange: () => SettingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Multiline",
        tooltip: "This is a multiline setting",
        category: ["Example", "Example 2", "Multiline"],
        defaultValue: "Example\nExample\nExample\nExample\nExample\nExample",
        type: SettingsHelper.SettingsType.MULTILINE,
        onChange: () => SettingsHelper.PresetOnChange.reloadSettings(),
    },
    {
        name: "Slider",
        category: ["Example", "Example 2", "Slider"],
        defaultValue: 50,
        tooltip: "This is a slider setting",
        type: SettingsHelper.SettingsType.SLIDER(0, 100, 1),
        onChange: () => SettingsHelper.PresetOnChange.reloadSettings(settingsDefinitions[5]), // Send this setting in the event
    },
]
settingsHelper.addSettings(settingsDefinitions);
```
</details>

