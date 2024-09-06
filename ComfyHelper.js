// Stupid amount of backtracking to make sure we get to the root.
import { app } from '../../../../../../../../../../../../../../../../scripts/app.js';
import { api } from '../../../../../../../../../../../../../../../../scripts/api.js';
import { $el } from '../../../../../../../../../../../../../../../../scripts/ui.js'

class CustomSettingTypes {
    static multilineSetting(name, setter, value, attrs) {
        // Ensure that tooltip has a default value if not provided
        const htmlID = `${name.replaceAll(' ', '').replaceAll('[', '').replaceAll(']', '-')}`;

        // Create the textarea element
        const textarea = $el('textarea', {
            value,
            id: htmlID,
            oninput: (e) => {
                adjustHeight();
            },
            className: "p-inputtext",
            style: {
                width: "100%",
                resize: "none",
            },
            ...attrs
        });

        const maxLines = 10;

        const adjustHeight = () => {
            requestAnimationFrame(() => {
                const parentDiv = textarea.parentElement;
                if (parentDiv != null) {
                    parentDiv.style.width = "100%";

                    const id = parentDiv.id;
                    if (id != null) {
                        const currentValue = api.getSetting(id);
                        if (currentValue != textarea.value) {
                            api.storeSetting(id, textarea.value);
                        }
                    }
                }

                textarea.style.height = ''; // Allow to shrink
                const lines = textarea.value.split('\n').length;
                const scrollHeight = textarea.scrollHeight + 3;
                if (lines > maxLines) {
                    const height = (scrollHeight / lines) * maxLines
                    textarea.setAttribute(
                        'style',
                        `width: 100%; height: ${height}px; resize: none;`
                    );
                    return;
                }
                textarea.setAttribute('style', `width: 100%; height: ${scrollHeight}px; resize: none;`);
            });
        };

        adjustHeight();
        return textarea;
    }
}

/**
 * A helper class to manage ComfyUI settings.
 */
export class SettingsHelper {
    /**
     * Creates a new SettingsHelper instance.
     * @param {string} prefix - The prefix to use for all settings.
     * @example
     * const settingsHelper = new SettingsHelper("example");
     */
    constructor(prefix) {
        if (!prefix.endsWith(".")) {
            prefix += ".";
        }
        this.prefix = prefix;
        this.PresetOnChange.reloadSettings = this.PresetOnChange.reloadSettings.bind(this);
        this.debouncedSendEvent = this.debounce((details) => {
            const event = new CustomEvent(this.prefix + 'reloadSettings', {
                detail: {
                    ...details,
                    eventSrc: "global",
                }
            });
            window.dispatchEvent(event);
        }, 250);

        this.debouncedEvents = {};
        this.defaultSettings = {};
    }

    /**
     * Enum-like object for valid setting types.
     */
    SettingsType = {
        BOOLEAN() {
            return { type: 'boolean' }
        },
        NUMBER() {
            return { type: 'number' }
        },
        SLIDER(min, max, step) {
            return {
                type: 'slider',
                attrs: { min: min, max: max, step: step },
            }
        },
        COMBO(...options) {
            return {
                type: 'combo',
                options: options,
            }
        },
        TEXT() {
            return { type: 'text' }
        },
        MULTILINE() {
            return { type: CustomSettingTypes.multilineSetting }
        },
        HIDDEN() {
            return { type: 'hidden' }
        },
    };

    /**
     * A collection of preset onChange functions for common settings use cases.
     */
    PresetOnChange = {
        /**
         * Sends out a custom event called {prefix}.reloadSettings. This function is debounced. If the setting id is passed along
         * in the details like this: `details.id` it will be handled seperately from other settings.
         * @example
         * // You can create a listener like this:
         * function onSettingsReload() {
         *     console.log("Example");
         * }
         * settingsHelper.addReloadSettingsListener(onSettingsReload);
         */
        reloadSettings(details) {
            const id = details?.id;

            if (id) {
                // Check if there's already a debounced function for this id
                if (!this.debouncedEvents[id]) {
                    // Create a debounced function for this id if it doesn't exist
                    this.debouncedEvents[id] = this.debounce((details) => {
                        const event = new CustomEvent(this.prefix + 'reloadSettings', {
                            detail: {
                                ...details,
                                eventSrc: "individual",
                            },
                        });
                        window.dispatchEvent(event);
                    }, 250);
                }

                // Call the debounced function for this specific id
                this.debouncedEvents[id](details);
            } else {
                // Fallback to the global debounce if no id is provided
                this.debouncedSendEvent(details);
            }
        }
    };

    #slugify(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
        str = str.toLowerCase(); // convert string to lowercase
        str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
                 .replace(/\s+/g, '-') // replace spaces with hyphens
                 .replace(/-+/g, '-'); // remove consecutive hyphens
        return str;
    }

    #generateId(name) {
        return this.prefix + this.#slugify(name);
    }

    #registerSetting(settingDefinition) {
        const extension = {
            name: settingDefinition.id,
            init() {
                app.ui.settings.addSetting({
                    ...settingDefinition,
                });
            },
        };
        app.registerExtension(extension);
    };

    /**
     * Adds a new setting.
     * @param {Object} settingDict - An object containing the setting properties.
     * @param {string} settingDict.name - The unique name of the setting.
     * @param {array} settingDict.category - An array of categories the setting belongs to.
     * @param {string} settingDict.type - The type of the setting (e.g., 'boolean', 'number', 'slider', 'combo', 'text').
     * @param {*} settingDict.defaultValue - The default value for the setting.
     * @param {function} settingDict.onChange - A function to run when the user changes the setting.
     * @param {*} settingDict.tooltip - A tooltip to show the user.
     * @param {...any} settingDict... - Additional options for the setting.
     * @example
     * settingsHelper.addSetting({
     *   name: "Dark Mode",
     *   category: ['Example', 'Visual', 'Dark Mode'],
     *   type: settingsHelper.SettingsType.BOOLEAN,
     *   defaultValue: false,
     *   onChange: (value) => {
     *     console.log("Dark Mode changed:", value);
     *   },
     *   tooltip: "Toggle dark mode for the UI."
     * });
     *
     * settingsHelper.addSetting({
     *   name: "Volume",
     *   type: settingsHelper.SettingsType.SLIDER,
     *   defaultValue: 50,
     *   attrs: { min: 0, max: 100, step: 1 },
     *   tooltip: "Adjust the volume level.",
     * });
     *
     * settingsHelper.addSetting({
     *   name: "Theme",
     *   type: settingsHelper.SettingsType.COMBO,
     *   defaultValue: "Light",
     *   options: settingsHelper.createSettingOptions({ text: "Light", value: "light" }, "Dark"),
     *   onChange: (value) => {
     *     console.log("Theme changed:", value);
     *   },
     *   tooltip: "Choose a UI theme."
     * });
     */
    addSetting(settingDict) {
        if (!settingDict.id) {
            settingDict.id = this.#generateId(settingDict.name);
        }
        const settingDefinition = {
            ...settingDict,
            // Check if 'type' is a function, and only call it if it is
            ...(typeof settingDict.type === 'function' ? settingDict.type() : settingDict.type),
        };
        this.defaultSettings[settingDict.id] = settingDict.defaultValue;
        this.#registerSetting(settingDefinition);
    }

    /**
     * Adds several settings. Pass an array of settings.
     * @param {Array.<Object>} settingsDefinitions - An array of setting objects.
     * @param {Object} settingsDefinitions[].name - The unique name of the setting.
     * @param {Array.<string>} settingsDefinitions[].category - An array of categories the setting belongs to.
     * @param {Object|function} settingsDefinitions[].type - The type of the setting (either a type object or a function that returns the type object).
     * @param {*} settingsDefinitions[].defaultValue - The default value for the setting.
     * @param {function} settingsDefinitions[].onChange - A function to run when the user changes the setting.
     * @param {string} [settingsDefinitions[].tooltip] - A tooltip to show the user
     * @example
     * const settingsDefinitions = [
           {
               name: "Boolean",
               category: ["Example", "Example", "Boolean"],
               defaultValue: true,
               tooltip: "This is a boolean setting",
               type: settingsHelper.SettingsType.BOOLEAN,
               onChange: () => settingsHelper.PresetOnChange.reloadSettings(),
           }
       ];
       settingsHelper.addSettings(settingsDefinitions);
     */
    addSettings(settingsDefinitions) {
        settingsDefinitions.forEach((setting) => {
            this.addSetting(setting);
        });
    }

    /**
     * Creates an array of options for 'combo' type settings.
     * @param {...string|Object} options - A list of strings or objects with text and value.
     * @returns {Array<Object>} An array of option objects.
     */
    createSettingOptions(...options) {
        return options.map(option =>
            typeof option === 'string' ? { text: option, value: option } : option
        );
    }

    async #fetchSetting(name) {
        // If name is a setting use the name, otherwise get the id from the generate function.
        if (this.defaultSettings[name] == undefined) {
            name = this.#generateId(name);
        }
        const settingUrl = "/settings/" + name;
        try {
            const response = await fetch(settingUrl);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            if (data == null) {
                return null;
            }

            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return null;
        }
    }

    /**
     * Retrieves the value of a setting. Will return the default value if it fails.
     * @param {string} name - The name of the setting to retrieve.
     * @returns {Promise<*>} The value of the setting.
     */
    async getSetting(name) {
        const response = await this.#fetchSetting(name);
        if (response == null) {
            return this.defaultSettings[name];
        }
        return response;
    }

    /**
     * Retrieves the value of a setting. Will return null if it fails or the user hasn't used the setting.
     * @param {string} name - The name of the setting to retrieve.
     * @returns {Promise<*>} The value of the setting.
     */
    async getSettingNoDefault(name) {
        return await this.#fetchSetting(name);
    }

    /**
     * Retrieves the value of multiple settings using `getSetting()`.
     * @param {Array} settingsArray - A string array of setting names/ ids to retrieve.
     * @returns {Promise<*>} The value of the setting.
     */
    async getMultipleSettings(settingsArray) {
        // Create an array of promises using getSetting with the corresponding default values
        const promises = settingsArray.map(name => this.getSetting(name));

        try {
            const results = await Promise.all(promises);

            // Convert the results to a Map or a plain object where each name is the key
            const settingsMap = {};
            settingsArray.forEach((name, index) => {
                settingsMap[name] = results[index];
            });

            return settingsMap;
        } catch (error) {
            console.error('There was a problem with one of the fetch operations:', error);
            return null;
        }
    }

    /**
     * Adds an event listener for the custom reloadSettings event.
     * @param {function} callback - The function to run when the reloadSettings event is triggered.
     */
    addReloadSettingsListener(callback) {
        const eventName = this.prefix + 'reloadSettings';

        window.addEventListener(eventName, (event) => {
            callback(event);
        });
    }

    /**
     * Creates a debounced function that delays the invocation of `func` until after `delay` milliseconds
     * have elapsed since the last time the debounced function was invoked.
     * @param {function} func - The function to run after the delay.
     * @param {number} delay - The delay in milliseconds to wait before running the function.
     * @returns {function} A debounced version of the original function that delays its execution.
     */
    debounce(func, delay) {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Creates a debounced function that only allows the function to be invoked on the leading edge
     * of the `wait` period. The function will only be called again after the `wait` period has passed.
     * @param {function} func - The function to run.
     * @param {number} wait - The time in milliseconds to wait before allowing another invocation.
     * @returns {function} A debounced function that triggers on the leading edge of the `wait` period.
     */
    leadingEdgeDebounce(func, wait) {
        let timeout;
        let lastCallTime = 0;

        return function(...args) {
            const now = Date.now();

            // If the last call was longer ago than the wait period, reset the timeout
            if (now - lastCallTime > wait) {
                lastCallTime = now;
                func.apply(this, args);  // Call the function immediately
            }

            clearTimeout(timeout);  // Clear any previous timeout

            // Set a new timeout that will reset `lastCallTime` after the wait period
            timeout = setTimeout(() => {
                lastCallTime = 0;
            }, wait);
        };
    }
}

export class UiHelper {
    constructor() {
        this.comfyLoaded = false;
    }

    /**
     * Wait until ComfyUI is loaded. Useful when using api, will immedeatly return if comy is loaded.
     * @example
     * await uiHelper.waitForComfy();
     */
    async waitForComfy() {
        // If comfy is already loaded, resolve immediately
        if (this.comfyLoaded) {
            return Promise.resolve(true);
        }

        // Otherwise, wait for the app to load
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (window.app) {
                    clearInterval(interval); // Stop checking once the app is ready
                    this.comfyLoaded = true;
                    resolve(true); // Resolve the promise
                }
            }, 500); // Check every 500ms
        });
    }

    /**
     * Enum-like object for valid severity levels.
     */
    Severity = {
        SUCCESS: "success",
        INFO: "info",
        WARNING: "warn",
        ERROR: "error",
    }

    /**
     * Create a popup in the top right. If you dont include life it will stay until the user removes it.
     * @param {Severity} severity - Severity of the popup, use `uiHelper.Severity`.
     * @param {string} title - Title of the popup.
     * @param {*} detail - Detailed message.
     * @param {number} life - Millisecond lifetime of the popup.
     * @example
     * uiHelper.addToast(
     *     uiHelper.Severity.WARNING,
     *     "Settings",
     *     "Updated settings.",
     *     2000
     * )
     */
    addToast(severity, title, detail, life = null) {
        app.extensionManager.toast.add({
            severity: severity,
            summary: title,
            detail: detail,
            life: life,
        })
    }

    addSideBarTab(id, icon, title, tooltip, type, render) {
        app.extensionManager.registerSidebarTab({
            id: id,
            icon: icon,
            title: title,
            tooltip: tooltip,
            type: type,
            render: render,
        });
    }
}