function pageLoaded()
{
    HTMLViewController.pageLoaded();
    ExtensionsPreferencesViewController.load();
    ExtensionsPreferencesView.pageDidLoad();
}

function removeIfExists(element)
{
    if (element)
        element.remove();
}

Extension = function(identifier)
{
    this.identifier = identifier;

    this.initialize();
}

Extension.prototype = {
    get enabled()
    {
        return ExtensionsPreferencesViewController.extensionEnabled(this.identifier);
    },

    set enabled(value)
    {
        ExtensionsPreferencesViewController.setExtensionEnabled(this.identifier, value);
    },

    get enabledInPrivateBrowsingWindows()
    {
        return ExtensionsPreferencesViewController.extensionEnabledInPrivateBrowsingWindows(this.identifier);
    },

    set enabledInPrivateBrowsingWindows(value)
    {
        ExtensionsPreferencesViewController.setExtensionEnabledInPrivateBrowsingWindows(this.identifier, value);
    },

    get authorName()
    {
        return ExtensionsPreferencesViewController.extensionAuthorName(this.identifier);
    },

    get description()
    {
        return ExtensionsPreferencesViewController.extensionDescription(this.identifier);
    },

    get displayName()
    {
        return ExtensionsPreferencesViewController.extensionDisplayName(this.identifier);
    },

    get version()
    {
        return ExtensionsPreferencesViewController.extensionVersion(this.identifier);
    },

    get websiteURL()
    {
        return ExtensionsPreferencesViewController.extensionWebsiteURL(this.identifier);
    },

    get settings()
    {
        return ExtensionsPreferencesViewController.extensionSettings(this.identifier);
    },

    get secureSettings()
    {
        return ExtensionsPreferencesViewController.extensionSecureSettings(this.identifier);
    },

    get settingsInterfaceItems()
    {
        return ExtensionsPreferencesViewController.extensionSettingsInterfaceItems(this.identifier);
    },

    get enableInPrivateBrowsingWindowsString()
    {
        return ExtensionsPreferencesViewController.enableInPrivateBrowsingWindowsString(this.identifier);
    },

    get isSignedByApple()
    {
        return ExtensionsPreferencesViewController.extensionIsSignedByApple(this.identifier);
    },

    select: function()
    {
        ExtensionsPreferencesView.selectedExtension = this;
    },

    initialize: function()
    {
        var icon = document.createElement("img");
        icon.src = this.smallIconURL(IconResolution.LowResolution);
        icon.classList.add("icon");
        icon.classList.add("low-res");
        icon.setAttribute("alt", "");

        var highResIcon = document.createElement("img");
        highResIcon.src = this.smallIconURL(IconResolution.HighResolution);
        highResIcon.classList.add("icon");
        highResIcon.classList.add("high-res");
        highResIcon.setAttribute("alt", "");

        this.sidebarElement = document.createElement("div");
        this.sidebarElement.appendChild(icon);
        this.sidebarElement.appendChild(highResIcon);
        this.sidebarElement.appendChild(document.createTextNode(this.displayName));
        this.sidebarElement.classList.add("item");
        if (!this.enabled)
            this.sidebarElement.classList.add("disabled");
        this.sidebarElement.addEventListener("click", this.sidebarItemSelected.bind(this), false);
        this.sidebarElement.setAttribute("role", "option");
        this.sidebarElement.setAttribute("aria-flowto", "contentView");

        // Add reference back to the Extension object.
        this.sidebarElement.extension = this;
    },

    display: function()
    {
        document.getElementById("low-res-icon").src = this.iconURL(IconResolution.LowResolution);
        document.getElementById("high-res-icon").src = this.iconURL(IconResolution.HighResolution);
        document.getElementById("low-res-icon").setAttribute("alt", HTMLViewController.UIString("%@ icon").format(this.displayName));
        document.getElementById("high-res-icon").setAttribute("alt", HTMLViewController.UIString("%@ icon").format(this.displayName));
        document.getElementById("title").textContent = this.displayName + " " + this.version;
        document.getElementById("description").textContent = this.description;
        document.getElementById("enableCheckboxLabel").textContent = HTMLViewController.UIString("Enable “%@”").format(this.displayName);
        document.getElementById("enableInPrivateBrowsingWindowsCheckboxLabel").textContent = this.enableInPrivateBrowsingWindowsString;
        if (!this.enableInPrivateBrowsingWindowsString) {
            document.getElementById("enableInPrivateBrowsingWindowsCheckbox").style.display = "none";
            document.querySelectorAll("#contentView .header")[0].style.minHeight = "107px";
        }

        var authorElement = document.getElementById("author");
        authorElement.textContent = "";

        if (this.authorName) {
            if (this.websiteURL) {
                var linkElement = document.createElement("a");
                linkElement.href = this.websiteURL;
                authorElement.appendChild(linkElement);
                authorElement = linkElement;
            }

            authorElement.textContent = HTMLViewController.UIString("by %@").format(this.authorName);
        }

        var settingsElement = document.getElementById("settings");
        settingsElement.removeChildren();

        const settingsInterfaceItems = this.settingsInterfaceItems;
        if (settingsInterfaceItems && settingsInterfaceItems.length) {
            function settingChanged(interfaceItem, newValue, deleted)
            {
                var settings = (interfaceItem["Secure"] ? this.secureSettings : this.settings);
                if (deleted)
                    delete settings[interfaceItem["Key"]];
                else
                    settings[interfaceItem["Key"]] = newValue;
            }

            var tableElement = createExtensionSettingsTableElement(settingsInterfaceItems, this.settings, this.secureSettings, settingChanged.bind(this));

            if (tableElement.rows.length) {
                settingsElement.appendChild(tableElement);
                settingsElement.classList.remove("empty");
            }
        }

        if (!settingsElement.childNodes.length) {
            settingsElement.classList.add("empty");
            var textDiv = document.createElement("div");
            textDiv.classList.add("placeholder-text");
            textDiv.textContent = HTMLViewController.UIString("No Settings");
            settingsElement.appendChild(textDiv);
        }

        this.updateEnableButtons();
        this.updateEnableInPrivateBrowsingWindowsButton();
    },

    updateEnableButtons: function()
    {
        document.getElementById("enableCheckboxButton").checked = this.enabled;
        if (this.enabled) {
            document.getElementById("enableInPrivateBrowsingWindowsCheckbox").style.color = "black";
            document.getElementById("enableInPrivateBrowsingWindowsCheckboxButton").disabled = false;
        } else {
            document.getElementById("enableInPrivateBrowsingWindowsCheckbox").style.color = "gray";
            document.getElementById("enableInPrivateBrowsingWindowsCheckboxButton").disabled = true;
        }
    },

    updateEnableInPrivateBrowsingWindowsButton: function()
    {
        if (!this.enableInPrivateBrowsingWindowsString)
            return;

        document.getElementById("enableInPrivateBrowsingWindowsCheckboxButton").checked = this.enabledInPrivateBrowsingWindows;
    },

    sidebarItemSelected: function(event)
    {
        this.select();
    },

    iconURL: function(resolution)
    {
        return ExtensionsPreferencesViewController.extensionIconURL(this.identifier, resolution);
    },

    largeIconURL: function(resolution)
    {
        return ExtensionsPreferencesViewController.extensionLargeIconURL(this.identifier, resolution);
    },

    smallIconURL: function(resolution)
    {
        return ExtensionsPreferencesViewController.extensionSmallIconURL(this.identifier, resolution);
    }
}

var ExtensionsPreferencesView = {
    _selectedExtension: null,

    // All installed extensions in installation order
    extensions: [],

    // Map from identifiers to their Extension objects
    extensionsByIdentifier: {},

    updateContentViewPlaceholder: function()
    {
        var contentViewPlaceholderId = "contentView-placeholder";
        if (this.extensions.length)
            document.getElementById(contentViewPlaceholderId).classList.add("hidden");
        else
            document.getElementById(contentViewPlaceholderId).classList.remove("hidden");
    },

    pageDidLoad: function()
    {
        this.extensionsEnabledStateChanged(this.extensionsEnabled);

        document.getElementById("updates-item").addEventListener("click", this.updatesItemSelected.bind(this), false);

        document.getElementById("enableCheckboxButton").addEventListener("change", this.enableButtonClicked.bind(this), false);
        document.getElementById("enableInPrivateBrowsingWindowsCheckboxButton").addEventListener("change", this.enableInPrivateBrowsingWindowsButtonClicked.bind(this), false);
        document.getElementById("uninstallButton").addEventListener("click", this.uninstallButtonClicked.bind(this), false);
        document.getElementById("sidebar").addEventListener("keydown", this.sidebarKeyDown.bind(this), false);

        document.getElementById("sidebar").focus();

        document.documentElement.setAttribute("aria-label", HTMLViewController.UIString("Extensions"));
        document.getElementById("sidebar").setAttribute("aria-label", HTMLViewController.UIString("Extensions"));
        document.getElementById("contentView").setAttribute("aria-label", HTMLViewController.UIString("Extension Info"));

        if (!ExtensionsPreferencesViewController.supportsAppleSignedExtensions()) {
            var installUpdatesAutomaticallyCheckbox = document.getElementById("install-updates-automatically");
            installUpdatesAutomaticallyCheckbox.checked = ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically;
            installUpdatesAutomaticallyCheckbox.addEventListener("change", this.installUpdatesAutomaticallyDidChange.bind(this), false);

            document.getElementById("install-all-updates").addEventListener("click", this.installAllUpdatesButtonClicked.bind(this), false);
        }

        this.updateContentViewPlaceholder();
        this.initializeAvailableUpdates();
    },
    
    pageUnloaded: function()
    {
        if (this.installUpdatesAutomaticallyCountdownInterval)
            this.installUpdatesAutomaticallyCountdownDidFinish();
        
        ExtensionsPreferencesViewController.unload();
    },

    updateBestAvailableExtensionVersion: function(identifier)
    {
        var version = ExtensionsPreferencesViewController.bestAvailableVersionNumber(identifier);
        this.bestAvailableExtensionVersionDidChange(identifier, version);
    },

    addExtension: function(identifier)
    {
        var extension = new Extension(identifier);
        this.extensions.push(extension);
        this.extensionsByIdentifier[identifier] = extension;
        document.getElementById("extensionList").appendChild(extension.sidebarElement);

        // Check if there is already an update available.
        this.updateBestAvailableExtensionVersion(extension.identifier);

        this.updateContentViewPlaceholder();
    },

    removeExtension: function(identifier)
    {
        var extension = this.extensionsByIdentifier[identifier];
        if (!extension)
            return;

        // Before removing the extension from the sidebar, determine the next extension to focus in the sidebar.
        if (this.selectedExtension == extension) {
            if (extension.sidebarElement.nextSibling)
                extension.sidebarElement.nextSibling.extension.select();
            else if (extension.sidebarElement.previousSibling)
                extension.sidebarElement.previousSibling.extension.select();
            else {
                // There are no installed extensions remaining.
                this.selectedExtension = null;
            }
        }

        // Remove the sidebar element of this extension.
        document.getElementById("extensionList").removeChild(extension.sidebarElement);
        
        // If the extension to remove has an update, remove it by setting the best available version
        // for the extension to undefined.
        this.bestAvailableExtensionVersionDidChange(identifier, undefined);

        this.extensions.remove(this.extensionsByIdentifier[identifier], true);
        delete this.extensionsByIdentifier[identifier];

        this.updateContentViewPlaceholder();
    },

    extensionWasUpdated: function(identifier)
    {
        var extension = this.extensionsByIdentifier[identifier];
        if (!extension)
            return;

        this.updateBestAvailableExtensionVersion(identifier);

        if (this.selectedExtension === extension)
            extension.display();
    },

    selectExtension: function(identifier)
    {
        var extension = this.extensionsByIdentifier[identifier];
        if (!extension)
            return;
        extension.select();
    },

    extensionStateChanged: function(identifier, enabled)
    {
        var extension = this.extensionsByIdentifier[identifier];
        if (!extension)
            return;

        if (enabled)
            extension.sidebarElement.classList.remove("disabled");
        else
            extension.sidebarElement.classList.add("disabled");

        if (this.selectedExtension === extension) {
            extension.updateEnableButtons();
        }
    },

    extensionsEnabledStateChanged: function(enabled)
    {
        if (enabled) {
            document.body.classList.remove("collapsed");
            ExtensionsPreferencesViewController.resizeWindowToEnabledHeight();
            return;
        }

        this.selectedExtension = null;
        document.getElementById("extensionList").removeChildren();
        document.getElementById("available-updates-container").removeChildren();

        document.body.classList.add("collapsed");
        ExtensionsPreferencesViewController.resizeWindowToDisabledHeight();

        this.extensions = [];
        this.extensionsByIdentifier = {};
    },

    get extensionsEnabled()
    {
        return ExtensionsPreferencesViewController.extensionsEnabled();
    },

    sidebarKeyDown: function(event)
    {
        if (!this.extensions.length)
            return;

        var handled = false;

        var selectedSidebarElement;
        if (this.selectedExtension)
            selectedSidebarElement = this.selectedExtension.sidebarElement;

        if (event.keyIdentifier === "Up") {
            if (selectedSidebarElement) {
                if (selectedSidebarElement.previousSibling)
                  selectedSidebarElement.previousSibling.extension.select();  
            } else {
                // Up was pressed when the updates field was selected (therefore there is no selected sidebar
                // extension, so we want to select the last extension on the list.
                this.extensions[this.extensions.length - 1].select();
            }

            handled = true;
        } else if (event.keyIdentifier === "Down") {
            if (selectedSidebarElement && selectedSidebarElement.nextSibling)
                selectedSidebarElement.nextSibling.extension.select();
            else
                this.updatesItemSelected(event);
                
            handled = true;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }
    },

    enableButtonClicked: function(event)
    {
        if (!this.selectedExtension)
            return;

        // Uncheck the enable checkbox for now, extensionStateChanged() may check it again based on
        // the user’s response to the trust confirmation alert (if displayed).
        event.target.checked = false;
        this.selectedExtension.enabled = !this.selectedExtension.enabled;
    },

    enableInPrivateBrowsingWindowsButtonClicked: function(event)
    {
        if (!this.selectedExtension)
            return;
        this.selectedExtension.enabledInPrivateBrowsingWindows = !this.selectedExtension.enabledInPrivateBrowsingWindows;
    },

    uninstallButtonClicked: function(event)
    {
        if (!this.selectedExtension)
            return;
        ExtensionsPreferencesViewController.uninstallExtension(this.selectedExtension.identifier);
    },

    get selectedExtension()
    {
        return this._selectedExtension;
    },

    set selectedExtension(extension)
    {
        if (this._selectedExtension === extension)
            return;

        if (this._selectedExtension) {
            this._selectedExtension.sidebarElement.classList.remove("selected");
            this._selectedExtension.sidebarElement.setAttribute("aria-selected", "false");
        }

        this._selectedExtension = extension;

        if (!this._selectedExtension) {
            document.getElementById("extensionInfo").classList.add("hidden");
            return;
        }

        ExtensionsPreferencesViewController.setSelectedExtension(this._selectedExtension.identifier);

        document.getElementById("updates-item").classList.remove("selected");
        this._selectedExtension.sidebarElement.classList.add("selected");
        this._selectedExtension.sidebarElement.setAttribute("aria-selected", "true");

        this._selectedExtension.sidebarElement.scrollIntoViewIfNeeded(true);
        this._selectedExtension.display();

        document.getElementById("updates").classList.add("hidden");
        document.getElementById("extensionInfo").classList.remove("hidden");
    },

    updatesItemSelected: function(event)
    {
        this.selectedExtension = null;
        document.getElementById("updates-item").classList.add("selected");
        document.getElementById("updates").classList.remove("hidden");
        
        ExtensionsPreferencesViewController.checkForUpdatesNow();
    },

    initializeAvailableUpdates: function()
    {
        var installUpdatesAutomatically = ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically;
        var availableUpdates = document.getElementById("available-updates-container");
        availableUpdates.removeChildren();

        for (var index = 0; index < this.extensions.length; ++index) {
            var extension = this.extensions[index];

            if (installUpdatesAutomatically && extension.isSignedByApple)
                continue;

            var bestAvailableVersionNumber = ExtensionsPreferencesViewController.bestAvailableVersionNumber(extension.identifier);
            if (!bestAvailableVersionNumber)
                continue;

            extension.availableUpdateElement = this.createAvailableUpdateElement(extension, bestAvailableVersionNumber);
            availableUpdates.appendChild(extension.availableUpdateElement);
        }
        this.numberOfAvailableUpdatesDidChange();
    },
    
    installAllUpdatesButtonClicked: function(event)
    {
        this.extensions.forEach(function(extension) {
            ExtensionsPreferencesViewController.downloadAndInstallBestAvailableVersionForIdentifier(extension.identifier);
        });
    },
    
    updateExtensionButtonClicked: function(event)
    {
        ExtensionsPreferencesViewController.downloadAndInstallBestAvailableVersionForIdentifier(event.target.extensionIdentifier);
    },

    createAvailableUpdateElement: function(extension, versionNumber)
    {
        console.assert(versionNumber);

        var container = document.createElement("div");
        container.className = "available-update";

        var icon = document.createElement("img");
        icon.src = extension.largeIconURL(IconResolution.LowResolution);
        icon.className = "low-res";
        container.appendChild(icon);

        var highResIcon = document.createElement("img");
        highResIcon.src = extension.largeIconURL(IconResolution.HighResolution);
        highResIcon.className = "high-res";
        container.appendChild(highResIcon);

        var textChildren = [
            { content: extension.displayName, tag: "h2" },
            { content: extension.authorName, tag: "div" },
            { content: HTMLViewController.UIString("Version: %@").format(versionNumber), tag: "div", className: "version-number" },
            { content: HTMLViewController.UIString("Update"), tag: "button" },
        ];

        for (var childIndex = 0; childIndex < textChildren.length; ++childIndex) {
            var child = document.createElement(textChildren[childIndex].tag);
            child.className = textChildren[childIndex].className;
            child.appendChild(document.createTextNode(textChildren[childIndex].content));
            if (textChildren[childIndex].tag == "button") {
                child.extensionIdentifier = extension.identifier;
                child.addEventListener("click", this.updateExtensionButtonClicked.bind(this), false);
            }
            container.appendChild(child);
        }

        return container;
    },

    bestAvailableExtensionVersionDidChange: function(identifier, versionNumber)
    {
        var extension = this.extensionsByIdentifier[identifier];
        console.assert(extension);

        if (extension.isSignedByApple && ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically)
            versionNumber = undefined;

        if (!versionNumber) {
            if (extension.availableUpdateElement) {
                extension.availableUpdateElement.remove();
                delete extension.availableUpdateElement;
            }
            this.numberOfAvailableUpdatesDidChange();
            return;
        }

        if (extension.availableUpdateElement) {
            var versionNumberElement = extension.availableUpdateElement.getElementsByClassName("version-number")[0];
            versionNumberElement.textContent = HTMLViewController.UIString("Version: %@").format(versionNumber);
            return;
        }

        extension.availableUpdateElement = this.createAvailableUpdateElement(extension, versionNumber);

        // Find the next installed extension that has an available update, and insert this one just before it.
        var indexOfExtension = this.extensions.indexOf(extension);
        var nextAvailableUpdateElement;
        for (var index = indexOfExtension + 1; index < this.extensions.length; ++index) {
            if (!this.extensions[index].availableUpdateElement)
                continue;
            nextAvailableUpdateElement = this.extensions[index].availableUpdateElement;
            break;
        }

        document.getElementById("available-updates-container").insertBefore(extension.availableUpdateElement, nextAvailableUpdateElement);
        this.numberOfAvailableUpdatesDidChange();
    },

    numberOfAvailableUpdatesDidChange: function()
    {
        // FIXME 19507741: Remove this repaint-workaround once https://bugs.webkit.org/show_bug.cgi?id=140581 is fixed.
        var availableUpdates = document.getElementById("available-updates-container");
        if (availableUpdates) {
            availableUpdates.classList.add("repaint-workaround");
            availableUpdates.offsetWidth;
            availableUpdates.classList.remove("repaint-workaround");
        }

        this.updateUpdatesContent();

        // The bubble needs to show the number of updates displayed, not necessarily
        // the number available, such as when Apple-signed extensions are automatically updated.
        var count = 0;
        if (ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically) {
            if (ExtensionsPreferencesViewController.supportsAppleSignedExtensions)
                count = this.numberOfDeveloperSignedExtensionsWithUpdates();
        } else
            count = this.numberOfExtensionsWithUpdates();

        var bubble = document.getElementById("updates-count-bubble");

        if (!count || this.installUpdatesAutomaticallyCountdownInterval) {
            bubble.classList.add("hidden");
            // Hide the updates-item when no available updates are displayed.
            document.querySelector("#sidebar > .footer").style.display = "none";
            document.getElementById("extensionList").style.bottom = "0";
            return;
        }

        // Show the updates-item when available updates are displayed.
        document.getElementById("extensionList").style.bottom = "30px";
        document.querySelector("#sidebar > .footer").style.display = "inherit";
        bubble.classList.remove("hidden");
        bubble.textContent = count;
    },

    clearUpdatesForAppleSignedExtensions: function()
    {
        for (var extension of this.extensions) {
            if (extension.isSignedByApple && extension.availableUpdateElement) {
                extension.availableUpdateElement.remove();
                delete extension.availableUpdateElement;
            }
        }
    },

    didToggleInstallExtensionUpdatesAutomatically: function(installUpdatesAutomatically)
    {
        if (installUpdatesAutomatically) {
            // If the user turned on automatic updates, make sure that we update the number of
            // available updates, so we properly render the updates-item element.
            if (ExtensionsPreferencesViewController.supportsAppleSignedExtensions)
                this.clearUpdatesForAppleSignedExtensions();

            this.numberOfAvailableUpdatesDidChange();
        } else {
            // If the user turned off automatic updates, make sure we initialize the available updates,
            // so that the user will be able to see any available updates they might have right after they
            // uncheck the box.
            // The most likely scenario for this would be if the user turned off automatic updates during
            // the countdown, before they were even turned on).
            this.initializeAvailableUpdates();
        }
    },
    
    installUpdatesAutomaticallyDidChange: function(event)
    {
        if (ExtensionsPreferencesViewController.supportsAppleSignedExtensions())
            return;

        var shouldUpdateAutomatically = event.target.checked;
        
        if (shouldUpdateAutomatically) {
            // We check for elements with the class name available-update, because we only want to start a countdown
            // if there are available updates. If checking the box doesn't have any instant effect, we don't need to
            // have a countdown.
            if (document.getElementsByClassName("available-update").length)
                this.startInstallUpdatesAutomaticallyCountdown();
            else
                ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically = true;
        } else {
            this.stopInstallUpdatesAutomaticallyCountdown();
            ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically = false;
        }

        this.didToggleInstallExtensionUpdatesAutomatically(shouldUpdateAutomatically);
    },
    
    startInstallUpdatesAutomaticallyCountdown: function()
    {
        if (ExtensionsPreferencesViewController.supportsAppleSignedExtensions())
            return;

        var countdown = document.getElementById("install-updates-automatically-countdown");
        var timeLeft = 10;

        console.assert(!this.installUpdatesAutomaticallyCountdownInterval);

        function updateInstallAutomaticallyCountdown()
        {
            if (!timeLeft) {
                this.stopInstallUpdatesAutomaticallyCountdown();
                this.installUpdatesAutomaticallyCountdownDidFinish();
                return;
            }

            countdown.textContent = HTMLViewController.UIString("Automatic install will begin in %@ seconds…").format(timeLeft);
            countdown.classList.remove("hidden");
            --timeLeft;
        }

        updateInstallAutomaticallyCountdown();
        this.installUpdatesAutomaticallyCountdownInterval = setInterval(updateInstallAutomaticallyCountdown.bind(this), 1000);
    },
    
    stopInstallUpdatesAutomaticallyCountdown: function()
    {
        if (ExtensionsPreferencesViewController.supportsAppleSignedExtensions())
            return;

        if (this.installUpdatesAutomaticallyCountdownInterval)
            clearTimeout(this.installUpdatesAutomaticallyCountdownInterval);
        delete this.installUpdatesAutomaticallyCountdownInterval;

        document.getElementById("install-updates-automatically-countdown").classList.add("hidden");

        this.updateUpdatesContent();
    },
    
    installUpdatesAutomaticallyCountdownDidFinish: function()
    {
        ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically = true;
        
        this.updateUpdatesContent();
    },

    showAppleSignedExtensionsSupportedUpdateHeader: function()
    {
        removeIfExists(document.getElementById("install-updates-automatically"));
        removeIfExists(document.querySelector("#updates-header > label"));
        removeIfExists(document.getElementById("install-all-updates"));
        removeIfExists(document.getElementById("install-updates-automatically-countdown"));

        document.getElementById("updates-explanation").textContent = HTMLViewController.UIString("Updates are available for one or more of your extensions. To install an update, click its Update button.");

        var updatesHeaderDiv = document.getElementById("updates-header");
        updatesHeaderDiv.classList.add("simpleHeader");
        updatesHeaderDiv.classList.remove("header");
        updatesHeaderDiv.classList.remove("hidden");
    },

    numberOfDeveloperSignedExtensionsWithUpdates: function()
    {
        return this.extensions.reduce(function(count, extension) {
            return count + ((extension.availableUpdateElement && !extension.isSignedByApple) ? 1 : 0);
        }, 0);
    },

    numberOfExtensionsWithUpdates: function()
    {
        return this.extensions.reduce(function(count, extension) {
            return count + (extension.availableUpdateElement ? 1 : 0);
        }, 0);
    },

    numberOfDeveloperSignedExtensionsInstalled: function()
    {
        return this.extensions.reduce(function(numberOfDeveloperSignedExtensions, extension) {
            return numberOfDeveloperSignedExtensions + (extension.isSignedByApple ? 0 : 1);
        }, 0);
    },

    updateUpdatesContent: function()
    {
        var emptyText;
        var installUpdatesAutomatically = ExtensionsPreferencesViewController.shouldInstallUpdatesAutomatically || this.installUpdatesAutomaticallyCountdownInterval;

        if (ExtensionsPreferencesViewController.supportsAppleSignedExtensions()) {
            if (this.numberOfExtensionsWithUpdates() > 0) {
                this.showAppleSignedExtensionsSupportedUpdateHeader();
            } else {
                document.getElementById("updates-header").classList.add("hidden");
                if (ExtensionsPreferencesViewController.numberOfAvailableUpdates === 0) {
                    if (installUpdatesAutomatically && this.numberOfDeveloperSignedExtensionsInstalled() === 0)
                        emptyText = HTMLViewController.UIString("Extensions Will Be Automatically Updated");
                    else
                        emptyText = HTMLViewController.UIString("No Updates Available");
                }
            }
        } else {
            var text;
            if (installUpdatesAutomatically) {
                text = HTMLViewController.UIString("Safari will automatically install updates for your extensions. If you prefer to install updates manually, deselect Install Updates Automatically.");
                emptyText = HTMLViewController.UIString("Extensions Will Be Automatically Updated");
            } else if (ExtensionsPreferencesViewController.numberOfAvailableUpdates > 0) {
                text = HTMLViewController.UIString("Updates are available for one or more of your extensions. To install an update click its Install button, or click Install All Updates.");
            } else {
                text = HTMLViewController.UIString("To have Safari automatically install updates for your extensions, select Install Updates Automatically.");
                emptyText = HTMLViewController.UIString("No Updates Available");
            }
            
            if (installUpdatesAutomatically || !ExtensionsPreferencesViewController.numberOfAvailableUpdates)
                document.getElementById("install-all-updates").classList.add("hidden");
            else
                document.getElementById("install-all-updates").classList.remove("hidden");

            document.getElementById("updates-explanation").textContent = text;
        }

        if (emptyText) {
            var availableUpdatesContainer = document.getElementById("available-updates-container");
            availableUpdatesContainer.removeChildren();

            // Create the placeholder element.
            var placeholder = document.createElement("div");
            placeholder.id = "available-updates-placeholder";

            var textDiv = document.createElement("div");
            textDiv.classList.add("placeholder-text");
            textDiv.textContent = emptyText;
            placeholder.appendChild(textDiv);

            availableUpdatesContainer.appendChild(placeholder);

            // Remove all the available-update elements from the extensions. They were just removed from the DOM,
            // and other code relies on these elements always being in the DOM, if they exist.
            for (var index = 0; index < this.extensions.length; ++index)
                delete this.extensions[index].availableUpdateElement;
        } else {
            // If there is currently placeholder text, make sure we delete it.
            removeIfExists(document.getElementById("available-updates-placeholder"));
        }

    },
}
