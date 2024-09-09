// Stupid amount of backtracking to make sure we get to the root.
import { app } from '../../../../../../../../../../../../../../../../scripts/app.js';
import { api } from '../../../../../../../../../../../../../../../../scripts/api.js';
import { $el } from '../../../../../../../../../../../../../../../../scripts/ui.js';

class GroupTypes {
    static booleanSetting(name, setter, value, attrs) {
        const htmlID = CustomSettingTypes.generateHtmlID(name);

        const wrapperDiv = $el('div', {
            className: 'setting-input',
            style: {
                flex: '1',
                display: 'flex',
                justifyContent: 'flex-end',
                marginLeft: '1rem',
            }
        });

        // Create the main toggle switch container div
        const toggleSwitchContainer = $el('div', {
            id: htmlID,
            className: `p-toggleswitch p-component ${value ? 'p-toggleswitch-checked' : ''}`,
            style: { position: 'relative' }, // Use an object for the style property
            'data-pc-name': 'toggleswitch',
            'data-pc-section': 'root',
            'data-p-checked': value.toString(),
            'data-p-disabled': 'false'
        });

        // Create the checkbox input
        const checkboxInput = $el('input', {
            type: 'checkbox',
            role: 'switch',
            className: 'p-toggleswitch-input',
            checked: value,
            'aria-checked': value.toString(),
            'data-pc-section': 'input',
            onchange: (e) => {
                const isChecked = e.target.checked;
                setter(isChecked); // Update the setting with the new value
                toggleSwitchContainer.classList.toggle('p-toggleswitch-checked', isChecked); // Toggle the class for visual feedback
                toggleSwitchContainer.setAttribute('data-p-checked', isChecked.toString()); // Update the `data-p-checked` attribute
            },
            ...attrs
        });

        // Create the slider span element
        const sliderSpan = $el('span', {
            className: 'p-toggleswitch-slider',
            'data-pc-section': 'slider'
        });

        // Append the input and slider to the container
        toggleSwitchContainer.appendChild(checkboxInput);
        toggleSwitchContainer.appendChild(sliderSpan);

        wrapperDiv.appendChild(toggleSwitchContainer);
        return wrapperDiv;
    }

    static sliderSetting(name, setter, value, { min = 0, max = 100, step = 1 } = {}, attrs) {
        const htmlID = CustomSettingTypes.generateHtmlID(name);

        // Create the wrapper div with the class 'setting-input'
        const wrapperDiv = $el('div', {
            className: 'setting-input',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px' // Space between slider and number input
            }
        });

        // Create the slider container div
        const sliderContainer = $el('div', {
            id: htmlID,
            className: 'input-slider',
            style: {
                flexGrow: '1',
                position: 'relative'
            }
        });

        // Create the slider component (div with spans for range and handle)
        const sliderComponent = $el('div', {
            className: 'p-slider p-component p-slider-horizontal slider-part',
            'data-pc-name': 'slider',
            'data-pc-section': 'root',
            style: { width: '100%', position: 'relative' }
        });

        // Create the slider range span (visual range of slider)
        const sliderRange = $el('span', {
            className: 'p-slider-range',
            'data-pc-section': 'range',
            style: {
                position: 'absolute',
                width: `${((value - min) / (max - min)) * 100}%`
            }  // Set the width based on value
        });

        // Create the slider handle span (visual handle of the slider)
        const sliderHandle = $el('span', {
            className: 'p-slider-handle',
            tabindex: '0',
            role: 'slider',
            'aria-valuemin': min.toString(),
            'aria-valuenow': value.toString(),
            'aria-valuemax': max.toString(),
            'aria-orientation': 'horizontal',
            'data-pc-section': 'handle',
            style: {
                position: 'absolute',
                left: `${((value - min) / (max - min)) * 100}%`
            }  // Set the initial position of the handle based on the value
        });

        // Make the slider handle draggable
        const startDrag = (event) => {
            const sliderWidth = sliderComponent.offsetWidth;
            const updateValue = (event) => {
                const clientX = event.clientX || event.touches[0].clientX;
                const rect = sliderComponent.getBoundingClientRect();
                let newValue = ((clientX - rect.left) / sliderWidth) * (max - min) + min;
                newValue = Math.max(min, Math.min(max, Math.round(newValue / step) * step));  // Ensure it's within range and respects step
                setter(newValue);  // Call the setter to update the value
                sliderHandle.style.left = `${((newValue - min) / (max - min)) * 100}%`;  // Update slider handle position
                sliderRange.style.width = `${((newValue - min) / (max - min)) * 100}%`;  // Update slider range width
                numberInput.value = newValue.toString();  // Sync number input
                rangeInput.value = newValue.toString();  // Sync hidden range input
            };

            const stopDrag = () => {
                document.removeEventListener('mousemove', updateValue);
                document.removeEventListener('touchmove', updateValue);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
            };

            document.addEventListener('mousemove', updateValue);
            document.addEventListener('touchmove', updateValue);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        };

        sliderHandle.addEventListener('mousedown', startDrag);
        sliderHandle.addEventListener('touchstart', startDrag);

        // Create the range input (hidden, will control the slider)
        const rangeInput = $el('input', {
            type: 'range',
            min,
            max,
            step,
            value,
            style: { display: 'none' },  // Hidden input to control the slider
            oninput: (e) => {
                const newValue = parseInt(e.target.value, 10);
                setter(newValue); // Call the setter to update the value
                // Update slider visuals
                sliderHandle.style.left = `${((newValue - min) / (max - min)) * 100}%`;
                sliderRange.style.width = `${((newValue - min) / (max - min)) * 100}%`;
                numberInput.value = newValue.toString();  // Sync number input
            },
            ...attrs
        });

        // Append the range input, slider range, and handle to the slider component
        sliderComponent.appendChild(sliderRange);
        sliderComponent.appendChild(sliderHandle);
        sliderContainer.appendChild(sliderComponent);
        sliderContainer.appendChild(rangeInput);  // Hidden range input

        // Create the number input component
        const numberInput = $el('input', {
            type: 'text',
            className: 'p-inputtext p-component p-inputnumber-input',
            role: 'spinbutton',
            'aria-valuemin': min.toString(),
            'aria-valuemax': max.toString(),
            'aria-valuenow': value.toString(),
            inputmode: 'numeric',
            value: value.toString(),
            style: { width: '60px', textAlign: 'left' },  // Adjust width and alignment
            oninput: (e) => {
                const newValue = parseInt(e.target.value, 10);
                if (!isNaN(newValue) && newValue >= min && newValue <= max) {
                    setter(newValue);
                    // Update slider visuals
                    sliderHandle.style.left = `${((newValue - min) / (max - min)) * 100}%`;
                    sliderRange.style.width = `${((newValue - min) / (max - min)) * 100}%`;
                    rangeInput.value = newValue.toString();  // Sync hidden range input
                }
            }
        });

        // Append the slider container and number input to the wrapper div
        wrapperDiv.appendChild(sliderContainer);
        wrapperDiv.appendChild(numberInput);

        return wrapperDiv;
    }
}

class CustomSettingTypes {
    static generateHtmlID(name) {
        return `${name.replaceAll(' ', '').replaceAll('[', '').replaceAll(']', '-')}`
    }

    static multilineSetting(name, setter, value, attrs) {
        // Ensure that tooltip has a default value if not provided
        const htmlID = CustomSettingTypes.generateHtmlID(name);

        // Create the textarea element
        const textarea = $el('textarea', {
            value,
            id: htmlID,
            oninput: (e) => {
                adjustHeight();
                console.log(e.target.value)
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

    static colorPickerSetting(name, setter, value, attrs) {
        const htmlID = CustomSettingTypes.generateHtmlID(name);

        // Create the color input element
        const colorInput = $el('input', {
            type: 'color',
            value,  // Pre-set the value of the color picker
            id: htmlID,
            className: "p-inputtext",
            onchange: (e) => {
                const newColor = e.target.value;
                setter(newColor);
            },
            ...attrs
        });

        // Styling or additional setup if necessary
        colorInput.style.height = '40px';
        colorInput.style.cursor = 'pointer';
        colorInput.style.flexGrow = '1';
        colorInput.style.padding = '3px 5px'

        requestAnimationFrame(() => {
            const parent = colorInput.parentElement;
            if (parent != null) {
                parent.style.display = 'contents'
            }
        });

        return colorInput;
    }

    static groupSetting(name, setter, value, attrs) {
        const htmlID = CustomSettingTypes.generateHtmlID(name);
        const settings = attrs.settings;
        const collapsible = attrs.collapsible;
        console.log(app.ui.settings.textElement)

        // Create a container element for the group
        const groupContainer = $el('div', {
            id: htmlID,
            style: {
                flexGrow: '1',
            }
        });

        // If collapsible, add a button to collapse/expand
        let toggleButton;
        if (collapsible) {
            toggleButton = $el('button', {
                textContent: `Toggle ${name}`,
                className: "p-inputtext",
                style: {
                    marginBottom: '10px',
                    width: '100%',
                    cursor: 'pointer',
                },
                onclick: () => {
                    settingsContainer.style.display = settingsContainer.style.display === 'none' ? 'flex' : 'none';
                    toggleButton.style.marginBottom = toggleButton.style.marginBottom === '10px' ? '0px' : '10px';
                    setTimeout(() => {
                        toggleButton.blur();
                    }, 100);
                }
            });
            groupContainer.appendChild(toggleButton);
        }

        // Create the settings container for grouping the settings DOM elements
        let settingsContainer = $el('div', {
            id: 'GroupContainer',
            style: {
                display: 'flex',
                gap: '10px',
                flexDirection: 'column',
            }
        });

        // Clear any existing settings before rendering new ones
        groupContainer.innerHTML = '';
        if (toggleButton) {
            groupContainer.appendChild(toggleButton);  // Re-append the toggle button if collapsible
        }
        const renderedSettings = [];
        // Dynamically render each setting and append to the container
        settings.forEach(setting => {
            const renderedSetting = app.ui.settings.settingsLookup[setting.id].render(); // Dynamically render the setting
            renderedSettings.push(app.ui.settings.settingsLookup[setting.id]);

            // Create a wrapper div for the label and setting element
            const settingWrapper = $el('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                }
            });

            // Create the label element
            const label = $el('label', {
                textContent: setting.name,
                className: 'setting-label',
                style: {
                    flexBasis: '30%',
                    pointer: 'text',
                }
            });

            // Append the label and rendered setting element to the wrapper
            settingWrapper.appendChild(label);
            settingWrapper.appendChild(renderedSetting);

            // Ensure layout is correct based on type
            if (typeof setting.type.type === 'function') {
                renderedSetting.style.flexBasis = '70%';
                renderedSetting.style.marginLeft = '10px';
                settingsContainer.appendChild(settingWrapper);
            } else {
                settingsContainer.appendChild(renderedSetting);
            }

            // Optionally hide original setting element if required
            const originalSettingElement = document.getElementById(setting.id);
            if (originalSettingElement) {
                originalSettingElement.parentElement.parentElement.style.display = 'none';
            }

            // Ensure the setting wrapper is visible
            requestAnimationFrame(() => {
                settingWrapper.style.display = 'flex';
            });
        });

        // Append the settings container to the group container
        groupContainer.appendChild(settingsContainer);

        // Ensure that the container is visible
        requestAnimationFrame(() => {
            const parent = groupContainer.parentElement;
            if (parent != null) {
                parent.style.display = 'contents';
            }
        });

        renderedSettings
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => s.render())
            .filter(Boolean)

        return groupContainer;
    }
}

/**
 * A helper class to manage ComfyUI settings.
 */
export class SettingsHelper {
    /**
     * A dictionary of all settings added with the `SettingsHelper`.
     */
    static defaultSettings = {};

    getDefaultSettings() {
        return SettingsHelper.defaultSettings;
    }

    /**
     * All ComfyUI settings.
     */
    static allSettings;
    static debouncedEvents = {};

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

        SettingsHelper.SettingsType.GROUP = SettingsHelper.SettingsType.GROUP.bind(this);
        SettingsHelper.PresetOnChange.reloadSettings = SettingsHelper.PresetOnChange.reloadSettings.bind(this);
        SettingsHelper.debouncedSendEvent = this.debounce((details) => {
            const event = new CustomEvent(this.prefix + 'reloadSettings', {
                detail: {
                    ...details,
                    eventSrc: "global",
                }
            });
            window.dispatchEvent(event);
        }, 250);

        SettingsHelper.debouncedEvents = {};

        this.uiHelper = new UiHelper();
        this.#initialize();
    }

    async #initialize() {
        if (!SettingsHelper.allSettings) {
            SettingsHelper.allSettings = await this.getAllSettings();
        }
    }

    /**
     * Enum-like object for valid setting types.
     */
    static SettingsType = {
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
        COLORPICKER() {
            return { type: CustomSettingTypes.colorPickerSetting }
        },
        GROUP(name, settings, collapsible = false) {
            settings.forEach(setting => {
                this.addSetting(setting);
            });

            return {
                type: CustomSettingTypes.groupSetting,
                attrs: { name: name, settings: settings, collapsible: collapsible },
            }
        },
        HIDDEN() {
            return { type: 'hidden' }
        },
    };
    static ST = SettingsHelper.SettingsType;

    static GroupTypes = {
        BOOLEAN() {
            return { type: GroupTypes.booleanSetting }
        },
        NUMBER() {
            return { type: 'number' }
        },
        SLIDER(min, max, step) {
            return {
                type: GroupTypes.sliderSetting,
                attrs: { min: min, max: max, step: step },
            }
        },
        COMBO(...options) {
            return {
                type: GroupTypes.comboSetting,
                attrs: { options }
            }
        },
        TEXT() {
            return { type: 'text' }
        },
        MULTILINE() {
            return { type: CustomSettingTypes.multilineSetting }
        },
        COLORPICKER() {
            return { type: CustomSettingTypes.colorPickerSetting }
        },
    }

    /**
     * A collection of preset onChange functions for common settings use cases.
     */
    static PresetOnChange = {
        /**
         * Sends out a custom event called {prefix}.reloadSettings. This function is debounced. If the setting id is passed along
         * in the details like this: `details.id` it will be handled separately from other settings.
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
                if (!SettingsHelper.debouncedEvents[id]) {
                    // Create a debounced function for this id if it doesn't exist
                    SettingsHelper.debouncedEvents[id] = this.debounce((details) => {
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
                SettingsHelper.debouncedEvents[id](details);
            } else {
                // Fallback to the global debounce if no id is provided
                SettingsHelper.debouncedSendEvent(details);
            }
        }
    };
    static PC = SettingsHelper.PresetOnChange;

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
     *   type: SettingsHelper.SettingsType.BOOLEAN,
     *   defaultValue: false,
     *   onChange: (newValue, oldValue) => {
     *       console.log('New Value:', newValue);
     *       console.log('Old Value:', oldValue);
     *   },
     *   tooltip: "Toggle dark mode for the UI."
     * });
     *
     * settingsHelper.addSetting({
     *   name: "Volume",
     *   type: SettingsHelper.SettingsType.SLIDER,
     *   defaultValue: 50,
     *   attrs: { min: 0, max: 100, step: 1 },
     *   tooltip: "Adjust the volume level.",
     * });
     *
     * settingsHelper.addSetting({
     *   name: "Theme",
     *   type: SettingsHelper.SettingsType.COMBO,
     *   defaultValue: "Light",
     *   options: settingsHelper.createSettingOptions({ text: "Light", value: "light" }, "Dark"),
     *   onChange: (newValue, oldValue) => {
     *       console.log('New Value:', newValue);
     *       console.log('Old Value:', oldValue);
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
        SettingsHelper.defaultSettings[settingDict.id] = settingDict.defaultValue;
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
               type: SettingsHelper.SettingsType.BOOLEAN,
               onChange: () => SettingsHelper.PresetOnChange.reloadSettings(),
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

    async #fetchApi(route, options = {}) {
		if (!options.headers) {
			options.headers = {};
		}

        options.cache = 'no-store';

        try {
            const response = await fetch(route, options);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return null;
        }
    }

    async #fetchSetting(name) {
        const settingUrl = "/settings/" + name;
        const data = await this.#fetchApi(settingUrl);
        return data;
    }

    /**
     * Returns the id of a setting.
     * @param {string} name
     * @returns
     */
    getSettingId(name) {
        if (SettingsHelper.defaultSettings[name] == undefined && !SettingsHelper.allSettings.hasOwnProperty(name)) {
            name = this.#generateId(name);
        }

        return name;
    }

    /**
     * Retrieves the value of a setting. Will return the default value if it fails.
     * @param {string} name - The name of the setting to retrieve.
     * @returns {Promise<*>} The value of the setting.
     */
    async getSetting(name) {
        await this.uiHelper.waitForComfy();
        name = this.getSettingId(name);
        const response = await this.#fetchSetting(name);
        if (response == null) {
            return SettingsHelper.defaultSettings[name];
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
     * Sets the value of a setting.
     * @param {string} name - The name of the setting to set.
     * @param {*} value - The value of the setting.
     */
    setSetting(name, value) {
        // If name is a setting use the name, otherwise get the id from the generate function.
        if (SettingsHelper.defaultSettings[name] == undefined) {
            name = this.#generateId(name);
        }
        api.storeSetting(name, value);
    }

    /**
     * Retrieves the value of multiple settings.
     * @param {string} settings - Several settings to retrieve.
     * @returns {Promise<*>} The value of the setting.
     */
    async getMultipleSettings(...settings) {
        const allSettings = await this.getAllSettings();

        const settingsMap = settings.reduce((map, setting) => {
            const settingName = this.getSettingId(setting);

            map[setting] = allSettings[settingName] !== undefined
                ? allSettings[settingName]
                : SettingsHelper.defaultSettings[settingName];

            return map;
        }, {});

        return settingsMap;
    }

    /**
     * Get all ComfyUI settings.
     * @returns
     */
    async getAllSettings() {
        const allSettings = await this.#fetchApi("/settings");
        SettingsHelper.allSettings = allSettings;
        return allSettings;
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
    static contextMenuNames = [];

    /**
     * Creates a new UiHelper instance.
     * @example
     * const uiHelper = new UiHelper();
     */
    constructor() {
        this.comfyLoaded = false;
    }

    /**
     * Wait until ComfyUI is loaded. Useful when using api, will immediately return if comfy is loaded.
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
    static Severity = {
        SUCCESS: "success",
        INFO: "info",
        WARNING: "warn",
        ERROR: "error",
    }
    static S = UiHelper.Severity;

    /**
     * Create a popup in the top right. If you don't include life it will stay until the user removes it.
     * @param {Severity} severity - Severity of the popup, use `UiHelper.Severity`.
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

    /**
     * Enum-like object for preset index functions.
     */
    static PresetInsertIndex = {
        /**
         * Find the index of a given option string in the menu. The dividers are `null`.
         * @param {*} optionContent - The content to search for (can be a string or null).
         * @param {number} occurrence - The occurrence number to find (default is 1 for the first occurrence).
         * @returns {function} A function that takes options and returns the index of the matching option.
         */
        aboveOption(optionContent, occurrence = 1) {
            return function (options) {
                let matchCount = 0;

                // Find the index of the nth occurrence of the option that matches the specified content or is null
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];

                    // Case 1: If optionContent is null, look for null options
                    if (optionContent === null && option === null) {
                        matchCount++;
                        if (matchCount === occurrence) {
                            return i;
                        }
                    }

                    // Case 2: If optionContent is a string, compare it with option.content (if option is not null)
                    if (option && option.content && option.content === optionContent) {
                        matchCount++;
                        if (matchCount === occurrence) {
                            return i;
                        }
                    }
                }

                // If no matching occurrence is found, return -1 (append at the end)
                return -1;
            };
        },

        /**
         * Find the index just below a given option string in the menu.  The dividers are `null`.
         * @param {*} optionContent - The content to search for (can be a string or null).
         * @param {number} occurrence - The occurrence number to find (default is 1 for the first occurrence).
         * @returns {function} A function that takes options and returns the index just after the matching option.
         */
        underOption(optionContent, occurrence = 1) {
            return function (options) {
                const indexAbove = UiHelper.PresetInsertIndex.aboveOption(optionContent, occurrence)(options);
                // Return the index after the found index, or -1 if no match is found (which appends to the end)
                return indexAbove !== -1 ? indexAbove + 1 : -1;
            };
        },

        /**
         * Always insert at the end of the menu.
         * @returns {function} - A function that returns -1.
         */
        atEnd() {
            return function (options) {
                return -1; // Always return -1 to append at the end
            };
        },

        /**
         * Always insert at the beginning
         * @returns {function} A function that returns 0.
         */
        atStart() {
            return function (options) {
                return 0; // Insert at the start (index 0)
            };
        }
    };
    static PI = UiHelper.PresetInsertIndex;

    #registerContextMenu(name, nodeType, menuItem, insertIndex) {
        app.registerExtension({
            name,
            async setup() {
                const original_getNodeMenuOptions = app.canvas.getNodeMenuOptions;
                app.canvas.getNodeMenuOptions = function (node) {
                    const options = original_getNodeMenuOptions.apply(this, arguments);

                    if (node.type === nodeType) {
                        let index = (typeof insertIndex === 'function') ? insertIndex(options, node) : insertIndex;

                        if (index !== -1) {
                            options.splice(index, 0, menuItem);
                        } else {
                            options.push(menuItem);
                        }
                    }
                    return options;
                };
            },
        });
    }

    /**
     * Registers a context menu for a specific node type within the app's canvas.
     *
     * @param {string} nodeType - The type of node for which the context menu will be applied.
     * @param {Object} menuItem - The menu item to be added to the context menu. This object can be made with the `createContextMenuItem()` or `createContextMenuGroup()` function.
     * @param {(number|function)} insertIndex - The index at which the menu item should be inserted.
     *        If a number is provided, it will be used as the index for insertion.
     *        If a function is provided, it should return an index based on the current context (e.g., options and node).
     *        The function signature is `(options: Array, node: Object) => number`. There are several preset functions in `uiHelper.PresetInsertIndex`
     * @example
     * const menuItem = uiHelper.createContextMenuItem("example", false, () => console.log("example"));
     *
     * uiHelper.addContextMenu("Example Node", menuItem, UiHelper.PresetInsertIndex.aboveOption("Title"));
     * uiHelper.addContextMenu("Example Node", menuItem, UiHelper.PresetInsertIndex.underOption(null, 2));
     */
    addContextMenu(nodeType, menuItem, insertIndex) {
        let baseName = nodeType + ".contextMenu";
        let name = baseName;
        let counter = 1;

        // Check if the name already exists in contextMenuNames and append a number if needed
        while (UiHelper.contextMenuNames.includes(name)) {
            name = `${baseName}_${counter}`;
            counter++;
        }

        // Once a unique name is found, push it into the contextMenuNames array
        UiHelper.contextMenuNames.push(name);

        // Proceed with registering the context menu
        this.#registerContextMenu(name, nodeType, menuItem, insertIndex);
    }

    /**
     * Creates a context menu item.
     *
     * @param {string} content - The label for the context menu item.
     * @param {boolean} disabled - A boolean indicating whether the menu item is disabled.
     * @param {function} callback - The function to be executed when the menu item is clicked.
     * @returns {Object} A context menu item object to be used in the context menu.
     */
    createContextMenuItem(content, disabled, callback) {
        return {
            content: content,
            disabled: disabled,
            callback: callback
        }
    }

    /**
     * Creates a context menu group (submenu).
     *
     * @param {string} name - The name of the menu group.
     * @param {...Object} menuItems - A variable number of context menu items to be included in the group. Can be made with the `createContextMenuItem()` function.
     * @returns {Object} A context menu group object with the provided items as a submenu.
     */
    createContextMenuGroup(name, ...menuItems) {
        return {
            content: name,
            disabled: false,
            has_submenu: true,
            submenu:  {
                options: menuItems
            }
        }
    }
}