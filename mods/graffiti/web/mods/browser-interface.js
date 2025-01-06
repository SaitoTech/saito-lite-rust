import ColorConverter from "./color-converter.js";
import BoardLayer from "./board-layer.js";
import Pixel from "./pixel.js";
import Line from "./line.js";
import Rectangle from "./rectangle.js";
import Ellipse from "./ellipse.js";
import ImageShape from "./image-shape.js";
import Utils from "./utils.js";


class BrowserInterface {
  constructor() {
    this.maxScale = 100;
    this.zoomAbsoluteFactor = 2 ** 0.25;
    this.zoomable = true;
    this.undoRedoPerSecond = 5;
    this.initialRgbaColor = {red: 247, green: 31, blue: 60, alpha: 255}; // Saito red;

    this.controls = {
      "clear-draft": {fa: "fas fa-trash-alt", shortcuts: ["Ctrl+Backspace"]},
      "undo":        {fa: "fas fa-undo-alt",  shortcuts: ["Ctrl+Z"]},
      "redo":        {fa: "fas fa-redo-alt",  shortcuts: ["Ctrl+Y", "Ctrl+Shift+Z"]},
      "submit":      {fa: "fas fa-check",     shortcuts: ["Enter"]},
    };
    this.tools = {
      "drag": {
        fa: "fas fa-arrows-up-down-left-right",
        cursor: "grab",
        settings: {}
      },
      "select-layer": {
        fa: "fas fa-arrow-pointer",
        cursor: "default",
        settings: {}
      },
      "pixel": {
        fa: "fas fa-pencil",
        cursor: "crosshair",
        settings: {}
      },
      "brush": {
        fa: "fas fa-paintbrush",
        cursor: "crosshair",
        settings: {
          size: {initialValue: 3, minValue: 1, maxValue: 20}
        }
      },
      "line": {
        fa: "fas fa-slash",
        cursor: "crosshair",
        settings: {
          size: {initialValue: 3, minValue: 1, maxValue: 20}
        }
      },
      "image": {
        fa: "fas fa-image",
        settings: {}
      }
    };
    this.colorPicker = {fa: "fas fa-eye-dropper", cursor: "copy"};
  }

  startRendering() {
    this.getElements();

    this.renderColorSubpanel();
    this.renderToolSettingsSubpanels();
    this.renderButtons();
  }

  finishRendering(mod) {
    this.mod = mod;
    this.app = mod.app;

    this.boardWidth  = this.mod.boardWidth;
    this.boardHeight = this.mod.boardHeight;
    this.boardState  = this.mod.boardState;
    this.blankTileRgbaColor = this.mod.blankTileRgbaColor;

    this.gcd_boardDimensions = Utils.gcd(this.boardWidth, this.boardHeight);
    
    this.renderBoard();
    this.renderSelectionLayer();
    this.attachEvents();
    this.setCurrent_tool("brush");

    document.body.classList.remove("wait-cursor");
    document.body.classList.add("normal-cursor");
  }

  renderColorSubpanel() {
    this.setCurrent_colorSettingState_fromRgba(this.initialRgbaColor);
    this.colorSubpanel.style.opacity = "1";
  }

  renderButtons() {
    for (const [controlName, control] of Object.entries(this.controls)) {
      this.renderTopBarButton(controlName, control, "controls");
      this.disableControl(controlName);
    }
    this.topBarSegments.controls.style.opacity = "1";

    for (const [toolName, tool] of Object.entries(this.tools)) {
      this.renderTopBarButton(toolName, tool, "tools");
    }
    this.topBarSegments.tools.style.opacity = "1";

    this.colorPicker.button.title = "Color Picker";
  }

  renderTopBarButton(name, feature, segmentName) {
    feature.button = document.createElement("button");
    feature.button.id = name + "-button";
    feature.button.title = this.label_fromName(name) + (feature.shortcuts ? ` (${feature.shortcuts[0]})` : "");
    feature.button.classList.add("pointer");
    this.topBarSegments[segmentName].appendChild(feature.button);

    feature.icon = document.createElement("i");
    feature.icon.id = name + "-icon";
    feature.icon.classList.add(...feature.fa.split(" "));
    feature.button.appendChild(feature.icon);

    if (name === "image") {
      feature.input = document.createElement("input");
      feature.input.type = "file";
      feature.input.accept = ".jpg, .jpeg, .png";
    }

    feature.button.style.opacity = "1";
  }

  setCurrent_tool(toolName) {
    if (this.currentToolName !== undefined) {
      this.board.classList.remove(this.tools[this.currentToolName].cursor);
      this.sidePanel.removeChild(this.tools[this.currentToolName].settingsSubpanel);
    }
    this.currentToolName = toolName;
    this.board.classList.add(this.tools[this.currentToolName].cursor);
    this.sidePanel.appendChild(this.tools[this.currentToolName].settingsSubpanel);

    for (const toolButton of this.topBarSegments.tools.children) {
      [toolButton.style.background, toolButton.style.borderTop] = (toolButton === this.tools[this.currentToolName].button) ?
          ["var(--selected-button-background-color)", "1.5px solid var(--selected-button-bordertop-color)"]
        : ["none", "none"];
    }

    this.selectionLayer.canvas.style.visibility = (toolName === "select-layer") ? "visible" : "hidden";
    if (toolName === "select-layer") {
      this.selectLayer(this.lastDraftLayer());
    }
  }

  iterateOverSettings(callback) {
    for (const hsvSetting of Object.values(this.hsvSettings)) {
      callback(hsvSetting);
    }
    for (const tool of Object.values(this.tools)) {
      for (const toolSetting of Object.values(tool.settings)) {
        callback(toolSetting);
      }
    }
  }  

  handleMousedown_forAdjuster(event, setting) {
    if (event.button === 0) {
      this.lastMousedownElement = setting.elements.adjuster;
      setting.elements.handle.classList.remove("grab");
      for (const element of document.body.querySelectorAll("*")) {
        element.classList.add("grabbing");
      }

      const position = this.position_fromEvent(event, setting.elements.adjuster);
      this.adjustSettingClones_fromPosition(position, setting);
    }
  }

  handleWheel_forAdjuster(event, setting) {
    const direction = (this.isSetting2D(setting) && !event.ctrlKey) ? "vertical" : "horizontal";
    const sign = ((direction === "vertical") === (event.deltaY < 0)) ? -1 : +1;
    this.adjustSettingClones_byUnit(direction, sign, setting);
  }

  adjustSettingClones_fromPosition(new_position, setting) {
    const widthOrHeight = (coordinateName) => ({"x": "clientWidth", "y": "clientHeight"})[coordinateName];

    const namesOfCoordinatesToChange = this.settingCoordinateNames(setting);
    const new_percentageValues = Object.fromEntries(namesOfCoordinatesToChange.map((nameOfCoordinateToChange) => {
      const new_percentageValue =
        new_position[nameOfCoordinateToChange] / setting.elements.adjuster[widthOrHeight(nameOfCoordinateToChange)] * 100;
      const percentageStep = this.settingPercentageStep(setting);
      const corrected_new_percentageValue = Math.round(new_percentageValue / percentageStep) * percentageStep;      
      return [this.leftTopProperty_fromCoordinateName(nameOfCoordinateToChange), corrected_new_percentageValue];
    }));

    this.adjustSettingClones_fromPercentageValues(new_percentageValues, setting);
  }

  settingPercentageStep(setting) {
    return (Object.values(this.hsvSettings).includes(setting)) ? 1 : 100 / (setting.maxValue - setting.minValue);
  }

  adjustSettingClones_byUnit(direction, sign, setting) {
    const propertyToChange = {horizontal: "left", vertical: "top"}[direction];
    const old_coordinateToChange_percentageValue = parseFloat(setting.elements.handle.style[propertyToChange]);
    const new_percentageValues = Object.fromEntries([
      [propertyToChange, old_coordinateToChange_percentageValue + sign * this.settingPercentageStep(setting)]
    ]);

    this.adjustSettingClones_fromPercentageValues(new_percentageValues, setting);
  }

  adjustSettingClones_fromPercentageValues(new_percentageValues, setting) {
    const corrected_new_percentageValues = Object.fromEntries(
      Object.entries(new_percentageValues).map(([propertyToChange, new_percentageValue]) =>
        [propertyToChange, Utils.boundedPercentageValue(new_percentageValue)]
      )
    );
    this.setCurrent_settingClonesState_fromPercentageValues(corrected_new_percentageValues, setting);
  }

  settingPositionProperties(setting) {
    return this.settingCoordinateNames(setting).map((coordinateName) => this.leftTopProperty_fromCoordinateName(coordinateName));
  }

  setCurrent_settingClonesState_fromPercentageValues(percentageValues, setting) {
    for (const [hsvSettingName, hsvSetting] of Object.entries(this.hsvSettings)) {
      if (setting === hsvSetting) {
        this.setCurrent_colorSettingState_fromPercentageValues(percentageValues, hsvSettingName);
        return;
      }
    }
    for (const toolSettingClone of this.toolSettingClones(setting)) {
      this.setCurrent_toolSettingState_fromPercentageValues(percentageValues, toolSettingClone);
    }
  }

  setCurrent_colorSettingState_fromPercentageValues(percentageValuesToChange, nameOfHsvSettingToChange) {
    this.setCurrent_hsvSettingHandle_percentageValues(percentageValuesToChange, nameOfHsvSettingToChange);

    const percentagePositions = Object.fromEntries(
      this.hsvSettingsNames().map((hsvSettingName) => [
        hsvSettingName,
        Object.fromEntries(
          this.settingPositionProperties(this.hsvSettings[hsvSettingName]).map((property) => [
            property,
            (hsvSettingName === nameOfHsvSettingToChange && Object.keys(percentageValuesToChange).includes(property)) ?
                percentageValuesToChange[property]
              : parseFloat(this.hsvSettings[hsvSettingName].elements.handle.style[property])
          ])
        )
      ])
    );
    const percentageValues = {
      hue:        percentagePositions.hue.left,
      saturation: percentagePositions.saturationAndValue.left,
      value:      percentagePositions.saturationAndValue.top
    };
    const hsvaColor = Object.fromEntries(Object.entries(percentageValues).map(([hsvComponentName, percentageValue]) =>
      [hsvComponentName, this.hsvComponent_fromPercentageValue(hsvComponentName, percentageValue)]
    ));
    hsvaColor.alpha = this.currentRgbaColor.alpha;
    this.setCurrent_colorState_fromHsva(hsvaColor);
  }

  setCurrent_colorState_fromHsva(hsvaColor) {
    const rgbaColor = ColorConverter.rgba_fromHsva(hsvaColor);

    this.currentRgbaColor = rgbaColor;

    const fullRgbaColor = ColorConverter.rgba_fromHsva({hue: hsvaColor.hue, saturation: 1, value: 1, alpha: hsvaColor.alpha});
    this.hsvSettings.saturationAndValue.elements.handle.style.background = ColorConverter.rgbCSS_fromRgba(rgbaColor);
    this.hsvSettings.saturationAndValue.elements.spectrumHueLayer.style.background = ColorConverter.rgbCSS_fromRgba(fullRgbaColor);
    this.hsvSettings.hue.elements.handle.style.background = ColorConverter.rgbCSS_fromRgba(fullRgbaColor);
  }

  settingCoordinateNames(setting) {
    return this.isSetting2D(setting) ? ["x", "y"] : ["x"];
  }

  handleMouseup_forSubmitButton() {
    this.handleSubmission();
  }

  handleSubmission() {
    document.body.classList.remove("normal-cursor");
    document.body.classList.add("wait-cursor");
    setTimeout(() => {
      this.submitDraftedTiles()
        .then((pendingTiles) => {
          this.drawPendingTiles(pendingTiles);
          this.clearDraft();
        })
        .catch((error) => {
          console.error("Error submitting drafted tiles:", error);
        })
        .finally(() => {
          document.body.classList.remove("wait-cursor");
          document.body.classList.add("normal-cursor");
        });
    }, 50);
  }

  handleMousedown_forUndoOrRedoButton(undoOrRedo) {
    this.startUndoingOrRedoing(undoOrRedo);
  }

  startUndoingOrRedoing(undoOrRedo) {
    if (this.stacks[undoOrRedo].length !== 0) {
      this[undoOrRedo]();
      this.undoRedoIntervalIDs[undoOrRedo] = setInterval(() => {
        if (this.stacks[undoOrRedo].length !== 0) {
          this[undoOrRedo]();
        } else {
          clearInterval(this.undoRedoIntervalIDs[undoOrRedo]);
        }
      }, 1000 / this.undoRedoPerSecond);
    }
  }

  handleMouseup_forUndoOrRedoButton(undoOrRedo) {
    this.stopUndoingOrRedoing(undoOrRedo);
  }

  stopUndoingOrRedoing(undoOrRedo) {
    clearInterval(this.undoRedoIntervalIDs[undoOrRedo]);
  }

  handleMouseleave_forUndoOrRedoButton(undoOrRedo) {
    clearInterval(this.undoRedoIntervalIDs[undoOrRedo]);
  }

  async nukeWallet() {
    await this.app.wallet.onUpgrade('nuke');
    reloadWindow(50);
  }

  handleMouseup_forColorPickerButton() {
    this.activateColorPicker();
  }

  getElements() {
    this.main = document.querySelector("main");

    this.sidePanel = document.getElementById("side-panel");
    this.colorSubpanel = document.getElementById("color-subpanel");
    this.hsvSettings = {
      saturationAndValue: {
        elements: {
          adjuster:         document.getElementById("saturation-value-adjuster"),
          spectrumHueLayer: document.getElementById("saturation-value-spectrum-hue-layer"),
          handle:           document.getElementById("saturation-value-handle")
        }
      },
      hue: {
        elements: {
          adjuster: document.getElementById("hue-adjuster"),
          handle:   document.getElementById("hue-handle")
        }
      }
    };
    this.colorPicker.button = document.getElementById("color-picker-button");

    this.topBar = document.getElementById("top-bar");
    this.topBarSegments = {
      controls: document.getElementById("controls-segment"),
      tools:    document.getElementById("tools-segment"),
      wallet:   document.getElementById("wallet-segment")
    };

    this.displayArea = document.getElementById("display-area");
    this.loader = document.getElementById("loader");
    this.board = document.getElementById("board");
    this.selectionCanvas = document.getElementById("selection-canvas");
  }

  renderToolSettingsSubpanels() {
    for (const tool of Object.values(this.tools)) {
      tool.settingsSubpanel = document.createElement("div");
      tool.settingsSubpanel.classList.add("side-column", "subpanel", "tool-settings-subpanel");

      const toolSettingsList = document.createElement("div");
      toolSettingsList.classList.add("tool-settings-list");
      tool.settingsSubpanel.appendChild(toolSettingsList);

      for (const [toolSettingName, toolSetting] of Object.entries(tool.settings)) {
        toolSetting.elements = {};

        toolSetting.elements.container = document.createElement("div");
        toolSetting.elements.container.classList.add("tool-setting-container");
        toolSettingsList.appendChild(toolSetting.elements.container);
  
        toolSetting.elements.nameText = document.createElement("div");
        toolSetting.elements.nameText.classList.add("text", "tool-setting-name-text");
        toolSetting.elements.nameText.innerHTML = this.label_fromName(toolSettingName);
        toolSetting.elements.container.appendChild(toolSetting.elements.nameText);
  
        toolSetting.elements.adjuster = document.createElement("div");
        toolSetting.elements.adjuster.classList.add("tool-setting-adjuster", "pointer");
        toolSetting.elements.container.appendChild(toolSetting.elements.adjuster);
  
        toolSetting.elements.bar = document.createElement("div");
        toolSetting.elements.bar.classList.add("tool-setting-bar");
        toolSetting.elements.adjuster.appendChild(toolSetting.elements.bar);
  
        toolSetting.elements.handle = document.createElement("div");
        toolSetting.elements.handle.classList.add("handle", "tool-setting-handle", "grab");
        toolSetting.elements.adjuster.appendChild(toolSetting.elements.handle);
  
        toolSetting.elements.value = document.createElement("div");
        toolSetting.elements.value.classList.add("text", "tool-setting-value");
        toolSetting.elements.container.appendChild(toolSetting.elements.value);


        this.setCurrent_toolSettingState_fromValue(toolSetting.initialValue, toolSetting);
      }

      tool.settingsSubpanel.style.opacity = "1";
    }
  }

  toolSettingClones(toolSettingRepresentative) {
    let toolSettingRepresentativeName;
    for (const tool of Object.values(this.tools)) {
      for (const [toolSettingName, toolSetting] of Object.entries(tool.settings)) {
        if (toolSetting === toolSettingRepresentative) {
          toolSettingRepresentativeName = toolSettingName;
        }
      }
    }
    const clones = [];
    for (const tool of Object.values(this.tools)) {
      for (const [toolSettingName, toolSetting] of Object.entries(tool.settings)) {
        if (toolSettingName === toolSettingRepresentativeName) {
          clones.push(toolSetting);
        }
      }
    }
    return clones;
  }

  isSetting2D(setting) {
    return setting === this.hsvSettings.saturationAndValue;
  }

  leftTopProperty_fromCoordinateName(coordinateName) {
    return {"x": "left", "y": "top"}[coordinateName];
  }

  otherHsvSettingName(hsvSettingName) {
    return Utils.otherOne(hsvSettingName, this.hsvSettingsNames());
  }

  hsvSettingsNames() {
    return Object.keys(this.hsvSettings);
  }

  setCurrent_hsvSettingHandle_percentageValues(hsvSettingHandle_percentageValues, hsvSettingName) {
    for (const [property, percentageValue] of Object.entries(hsvSettingHandle_percentageValues)) {
      this.hsvSettings[hsvSettingName].elements.handle.style[property] = `${percentageValue}%`;
    }
  }

  percentageValue_fromHsvComponent(hsvComponentName, hsvComponent) {
    const normalizedHsvComponent = hsvComponent / this.hsvComponentMaxValue(hsvComponentName);
    const corrected_normalizedHsvComponent = (hsvComponentName === "value") ? 1 - normalizedHsvComponent : normalizedHsvComponent;
    return Utils.round(corrected_normalizedHsvComponent * 100, 2);
  }

  hsvComponent_fromPercentageValue(hsvComponentName, percentageValue) {
    const normalizedPercentageValue = percentageValue / 100;
    const corrected_normalizedPercentageValue = (hsvComponentName === "value") ? 1 - normalizedPercentageValue : normalizedPercentageValue;
    const hsvComponent = corrected_normalizedPercentageValue * this.hsvComponentMaxValue(hsvComponentName);
    const corrected_hsvComponent = (hsvComponentName === "hue") ? hsvComponent % this.hsvComponentMaxValue("hue") : hsvComponent;
    return corrected_hsvComponent;
  }
  
  setCurrent_colorSettingState_fromHsva(hsvaColor) {
    const percentageValue = (hsvComponentName) => this.percentageValue_fromHsvComponent(hsvComponentName, hsvaColor[hsvComponentName]);

    const hueSettingHandle_percentageValues = {left: percentageValue("hue")};
    this.setCurrent_hsvSettingHandle_percentageValues(hueSettingHandle_percentageValues, "hue");

    const saturationAndValueSettingHandle_percentageValues = {left: percentageValue("saturation"), top:  percentageValue("value")};
    this.setCurrent_hsvSettingHandle_percentageValues(saturationAndValueSettingHandle_percentageValues, "saturationAndValue");

    this.setCurrent_colorState_fromHsva(hsvaColor);
  }

  setCurrent_toolSettingState_fromValue(toolSettingValue, toolSetting) {
    const toolSettingHandle_percentagePosition = {
      left: Utils.round((toolSettingValue - toolSetting.minValue) / (toolSetting.maxValue - toolSetting.minValue) * 100, 2)
    };
    this.setCurrent_toolSettingState(toolSettingHandle_percentagePosition, toolSettingValue, toolSetting);
  }

  setCurrent_toolSettingState_fromPercentageValues(percentageValues, toolSetting) {
    const toolSettingValue = Math.round(
      toolSetting.minValue + (percentageValues.left / 100) * (toolSetting.maxValue - toolSetting.minValue)
    );
    this.setCurrent_toolSettingState(percentageValues, toolSettingValue, toolSetting);
  }

  setCurrent_toolSettingState(percentageValues, toolSettingValue, toolSetting) {
    toolSetting.currentValue = toolSettingValue;


    toolSetting.elements.handle.style.left = `${percentageValues.left}%`;
    toolSetting.elements.bar.style.background = `linear-gradient(90deg,
      var(--tool-setting-adjuster-left-color)  ${percentageValues.left}%,
      var(--tool-setting-adjuster-right-color) ${percentageValues.left}%
    )`;
    toolSetting.elements.value.innerHTML = toolSettingValue.toString();
  }

  hsvComponentMaxValue(componentName) {
    return {"hue": 360, "saturation": 1, "value": 1}[componentName];
  }

  setCurrent_colorSettingState_fromRgba(rgbaColor) {
    this.setCurrent_colorSettingState_fromHsva(ColorConverter.hsva_fromRgba(rgbaColor));
  }

  moveBoard(old_mousePosition, new_mousePosition) {
    this.boardApparentLeft += new_mousePosition.x - old_mousePosition.x;
    this.boardApparentTop  += new_mousePosition.y - old_mousePosition.y;

    this.updateBoardRendering();
    this.updateSelectionLayer();
  }

  draftShape(shape, isOnNewLayer=true) {
    const layer = isOnNewLayer ? this.addDraftLayer() : this.lastDraftLayer();
    layer.addShape(shape);
  }

  correctBoardPosition() {
    const minFractionVisible = 0.75;

    const maxLeft = (1 - minFractionVisible) * this.displayAreaWidth;
    const maxTop  = (1 - minFractionVisible) * this.displayAreaHeight;

    const minRight  = minFractionVisible * this.displayAreaWidth;
    const minBottom = minFractionVisible * this.displayAreaHeight;
    const minLeft = minRight  - this.boardApparentWidth;
    const minTop  = minBottom - this.boardApparentHeight;

    if (this.boardApparentLeft > maxLeft) { this.boardApparentLeft = Math.floor(maxLeft); }
    if (this.boardApparentTop  > maxTop)  { this.boardApparentTop  = Math.floor(maxTop);  }
    if (this.boardApparentLeft < minLeft) { this.boardApparentLeft = Math.ceil(minLeft);  }
    if (this.boardApparentTop  < minTop)  { this.boardApparentTop  = Math.ceil(minTop);   }
  }

  updateBoardRendering() {
    this.correctBoardPosition();

    this.boardRenderingLeft = this.boardApparentLeft;
    this.boardRenderingTop  = this.boardApparentTop;

    this.board.style.left = `${this.boardRenderingLeft}px`;
    this.board.style.top  = `${this.boardRenderingTop}px`;
    this.board.style.transform = `scale(${this.currentScale})`;
  }

  handleResize_forWindow() {
    this.boardApparentLeft += Math.round(this.displayArea.clientWidth  / 2) - Math.round(this.displayAreaWidth  / 2);
    this.boardApparentTop  += Math.round(this.displayArea.clientHeight / 2) - Math.round(this.displayAreaHeight / 2);

    this.updateDisplaySize();
    this.updateBoardRendering();
    if (this.currentToolName === "select-layer") {
      this.updateSelectionLayer();
    }
  }

  updateDisplaySize() {
    this.displayAreaWidth  = this.displayArea.clientWidth;
    this.displayAreaHeight = this.displayArea.clientHeight;

    this.minBoardApparentWidth  = Math.min(this.displayAreaWidth, this.boardWidth / this.boardHeight * this.displayAreaHeight);
    this.minBoardApparentHeight = Math.min(this.displayAreaHeight, this.boardHeight / this.boardWidth * this.displayAreaWidth);

    this.minScale = this.minBoardApparentWidth / this.boardRenderingWidth;
  }

  renderBoard() {
    this.boardRenderingWidth  = this.boardWidth;
    this.boardRenderingHeight = this.boardHeight;

    this.board.style.width  = `${this.boardRenderingWidth}px`;
    this.board.style.height = `${this.boardRenderingHeight}px`;


    this.updateDisplaySize();


    this.boardApparentWidth  = Math.ceil(this.minBoardApparentWidth);
    this.boardApparentHeight = Math.ceil(this.minBoardApparentHeight);
    this.boardApparentLeft = Math.round((this.displayAreaWidth  - this.boardApparentWidth)  / 2);
    this.boardApparentTop  = Math.round((this.displayAreaHeight - this.boardApparentHeight) / 2);

    this.currentScale = this.boardApparentWidth / this.boardRenderingWidth;

    
    this.updateBoardRendering();


    this.baseLayers = {};
    for (const layerName of ["background", "confirmed", "pending"]) {
      this.baseLayers[layerName] = new BoardLayer(this.boardWidth, this.boardHeight, this.board.childElementCount + 1, layerName);
      this.board.appendChild(this.baseLayers[layerName].canvas);
    }
    this.baseLayers.background.fill(this.blankTileRgbaColor, false);


    this.board.style.opacity = "1";
    this.displayArea.removeChild(this.loader);
  }

  label_fromName(name) {
    return name
      .split("-")
      .map((word) => Utils.firstLetterUppercaseWord(word))
      .join(" ");
  }

  position_fromEvent(event, referenceElement) {
    const referenceRect = referenceElement.getBoundingClientRect();

    const position = {
      x: event.pageX - referenceRect.left,
      y: event.pageY - referenceRect.top
    };
    if (referenceElement === this.displayArea) {
      this.populateCoordinatesOnBoard(position);
    }

    return position;
  }

  populateCoordinatesOnBoard(position) {
    position.i_float = (position.x - this.boardApparentLeft) / this.currentScale;
    position.j_float = (position.y - this.boardApparentTop)  / this.currentScale;

    position.i_center = Math.round(position.i_float);
    position.j_center = Math.round(position.j_float);

    position.i = Math.floor(position.i_float);
    position.j = Math.floor(position.j_float);
  }

  setScale(inputZoomFactor) {
    const inputScale = this.currentScale * inputZoomFactor;
    const [new_scale, roundingFunction] = (inputScale < this.minScale) ? [this.minScale, Math.ceil]  :
                                          (inputScale > this.maxScale) ? [this.maxScale, Math.floor] : [inputScale, Math.round];

    const corrected_new_scale = Math.max(1, roundingFunction(this.gcd_boardDimensions * new_scale)) / this.gcd_boardDimensions;
    const corrected_zoomFactor = corrected_new_scale / this.currentScale;

    this.currentScale = corrected_new_scale;
    return corrected_zoomFactor;
  }

  handleWheel_forDisplayArea(event) {
    event.preventDefault();
    if (this.zoomable) {
      const position = this.position_fromEvent(event, this.displayArea);

      if (this.isInsideBoard(position)) {
        const corrected_zoomFactor = this.setScale((event.deltaY < 0) ? this.zoomAbsoluteFactor : 1 / this.zoomAbsoluteFactor);
        this.boardApparentLeft = Math.round(position.x + corrected_zoomFactor * (this.boardApparentLeft - position.x));
        this.boardApparentTop  = Math.round(position.y + corrected_zoomFactor * (this.boardApparentTop  - position.y));

        this.boardApparentWidth  = this.boardWidth  * this.currentScale;
        this.boardApparentHeight = this.boardHeight * this.currentScale;

        this.updateBoardRendering();
        this.updateSelectionLayer();
      }
    }
  }

  addDraftLayer(layer=null) {
    if (this.draftLayers.length === 0) {
      this.enableControl("clear-draft");
      this.enableControl("submit");
    }

    if (this.stacks.undo.length === 0) {
      this.enableControl("undo");
    }

    if (layer === null) {
      this.stacks.redo.length = 0;
      this.disableControl("redo");
      layer = new BoardLayer(this.boardWidth, this.boardHeight, this.board.childElementCount + 1);
    }

    this.board.appendChild(layer.canvas);
    this.draftLayers.push(layer);

    if (this.currentToolName === "select-layer") {
      this.selectLayer(this.lastDraftLayer());
    }

    return layer;
  }

  lastDraftLayer() {
    return (this.draftLayers.length !== 0) ? this.draftLayers[this.draftLayers.length - 1] : null;
  }

  apparentRgbaColor(i, j) {
    let apparentRgbaColor = this.baseRgbaColor(i, j);
    for (const layer of this.draftLayers) {
      const [red, green, blue, alpha] = layer.ctx.getImageData(i, j, 1, 1).data;
      apparentRgbaColor = this.mod.mixedRgbaColor(apparentRgbaColor, {red, green, blue, alpha});
    }

    return apparentRgbaColor;
  }

  deactivateColorPicker() {
    this.isColorPickerActive = false;
    this.colorPicker.button.style.background = "none";
    this.board.classList.remove(this.colorPicker.cursor);
  }

  handleWheel_forMain(event) {
    event.preventDefault();
  }

  handleMouseup_forMain() {
    this.isMouseDown = false;
    for (const element of document.body.querySelectorAll("*")) {
      if (element.classList.contains("grabbing")) {
        element.classList.remove("grabbing");
      }
    }
    this.iterateOverSettings((setting) => {
      setting.elements.handle.classList.add("grab");
    });
  }

  handleMousedown_forMain(event) {
    if (event.button === 0) {
      this.isMouseDown = true;
    }
  }

  isInsideLayer(position, layer) {
    return (layer === null) ? false : position.i >= layer.layerBox.left && position.i < layer.layerBox.right
                                   && position.j >= layer.layerBox.top  && position.j < layer.layerBox.bottom;
  }

  isInsideSelectedLayer(position) {
    return this.selectedLayer !== null && this.isInsideLayer(position, this.selectedLayer);
  }

  latestLayerContainingPosition(position) {
    for (const layer of this.draftLayers.toReversed()) {
      if (this.isInsideLayer(position, layer)) {
        return layer;
      }
    }
    return null;
  }

  layersAbove(referenceLayer) {
    const reversedResult = [];
    for (const layer of this.draftLayers.toReversed()) {
      if (layer === referenceLayer) {
        break;
      } else {
        reversedResult.push(layer);
      }
    }
    return reversedResult.toReversed();
  }

  isNearlyInside_someLayerAboveSelectedLayer(position) {
    return this.layersAbove(this.selectedLayer).some((layer) => this.isNearlyInside(position, layer));
  }

  isInside_someLayerAboveSelectedLayer(position) {
    return this.layersAbove(this.selectedLayer).some((layer) => this.isInsideLayer(position, layer));
  }

  handleMousedown_forDisplayArea(event) {
    if (event.button === 0) {
      const position = this.position_fromEvent(event, this.displayArea);

      this.currentMousePositionInDisplayArea = Utils.shallowCopy(position);

      this.selectionLayer.lastMousedownNearlyInsideSelectedLayer = this.isNearlyInside(position, this.selectedLayer);
      if (this.selectedLayer !== null) {
        if (!this.isNearlyInside_someLayerAboveSelectedLayer(position)) {
          this.updateSelectionLayerCursorAndResizingSides("mousedown", position, position, true, event.shiftKey);
          this.selectionLayer.lastMousedownCursor = this.selectionLayer.cursor;
        }
      }

      if (this.isInsideBoard(position)) {
        this.lastMousedownElement = this.board;

        if (!this.isColorPickerActive) {  
          if (this.currentToolName === "drag") {
            this.board.classList.remove("grab");
            this.board.classList.add("grabbing");
          }
          if (this.currentToolName === "pixel") {
            this.draftShape(new Pixel({position: position, rgbaColor: this.currentRgbaColor}));
          }
          if (this.currentToolName === "brush") {
            this.draftShape(new Line({
              toolName: "brush",
              start: position, end: position, rgbaColor: this.currentRgbaColor,
              width: this.tools["brush"].settings.size.currentValue
            }));
          }
          if (["rectangle", "ellipse", "line"].includes(this.currentToolName)) {
            this.shapeOriginPosition = position;

            const shapeArgs = {
              toolName: this.currentToolName,
              start: position, end: position, rgbaColor: this.currentRgbaColor
            };
            if (this.currentToolName === "line") {
              shapeArgs.width = this.tools["line"].settings.size.currentValue;
            }

            const shape = (() => {
              switch (this.currentToolName) {
                case "rectangle": return new Rectangle(shapeArgs);
                case "ellipse":   return new Ellipse(shapeArgs);
                case "line":      return new Line(shapeArgs);
              }
            })();

            this.draftShape(shape);
          }
        }
      } else {
        this.lastMousedownElement = undefined;
      }
    }
  }

  isInsideBoard(position) {
    return position.x >= this.boardApparentLeft && position.x < this.boardApparentLeft + this.boardApparentWidth
        && position.y >= this.boardApparentTop  && position.y < this.boardApparentTop  + this.boardApparentHeight;
  }

  nearestPositionInBoard(targetPosition, otherPosition) {
    const xmin = this.boardApparentLeft;
    const ymin = this.boardApparentTop;
    const xmax = this.boardApparentLeft + this.boardApparentWidth - Number.EPSILON;
    const ymax = this.boardApparentTop + this.boardApparentHeight - Number.EPSILON;

    const t = Math.max(0,
      (targetPosition.x < otherPosition.x) ? (xmin - targetPosition.x) / (otherPosition.x - targetPosition.x) :
      (targetPosition.x > otherPosition.x) ? (xmax - targetPosition.x) / (otherPosition.x - targetPosition.x) : 0,
      (targetPosition.y < otherPosition.y) ? (ymin - targetPosition.y) / (otherPosition.y - targetPosition.y) :
      (targetPosition.y > otherPosition.y) ? (ymax - targetPosition.y) / (otherPosition.y - targetPosition.y) : 0
    );
    const nearestPosition = {
      x: (1-t) * targetPosition.x + t * otherPosition.x,
      y: (1-t) * targetPosition.y + t * otherPosition.y
    };
    this.populateCoordinatesOnBoard(nearestPosition);
    return nearestPosition;
  }

  isNearlyInside(position, layer, direction=null) {
    return (layer === null) ? false :
           (direction === null) ? this.isNearlyInside(position, layer, "horizontal")
                               && this.isNearlyInside(position, layer, "vertical") :
              this.isInsideFarFromBorders(position, layer, direction)
           || Utils.sides_fromDirection(direction).some((side) => this.isNearBorderLine(position, layer, side));
  }

  isInsideFarFromBorders(position, layer, direction) {
    const coordinate = position[Utils.continuousCoordinateName_fromDirection(direction)];
    const dimension  = this.boxDimension(layer, Utils.dimensionName_fromDirection(direction));

    return Math.abs(coordinate - this.middle(layer, direction)) < dimension / 2 - this.selectionLayer.borderScope;
  }

  boxDimension(layer, dimensionName) {
    return this.border(layer, Utils.positiveSide_fromDimensionName(dimensionName))
         - this.border(layer, Utils.negativeSide_fromDimensionName(dimensionName));
  }

  middle(layer, direction) {
    return Utils.mean(Utils.sides_fromDirection(direction).map((side) => this.border(layer, side)));
  }

  border(layer, side) {
    const direction = Utils.direction_fromSide(side);
    const boardApparentPosition = ({horizontal: this.boardApparentLeft, vertical: this.boardApparentTop})[direction];

    return boardApparentPosition + layer.unionHullBox[side] * this.currentScale;
  }

  isNearBorderLine(position, layer, side) {
    return this.distanceToBorderLine(position, layer, side) <= this.selectionLayer.borderScope;
  }

  distanceToBorderLine(position, layer, side) {
    return Math.abs(position[Utils.continuousCoordinateName_fromSide(side)] - this.border(layer, side));
  }

  sideRelativeToMiddle(position, layer, direction) {
    const coordinate = position[Utils.continuousCoordinateName_fromDirection(direction)];

    return (coordinate < this.middle(layer, direction)) ?
        Utils.negativeSide_fromDirection(direction)
      : Utils.positiveSide_fromDirection(direction);
  }

  isNearBorder(position, layer, side) {
    return this.isNearBorderLine(position, layer, side)
        && this.isNearlyInside(position, layer, Utils.otherDirection(Utils.direction_fromSide(side)));
  }

  matchSideRelativeToMiddle(position, layer, side) {
    return this.sideRelativeToMiddle(position, layer, Utils.direction_fromSide(side)) === side;
  }

  isInsideBorderArea(position, layer, side) {
    return this.isNearBorder(position, layer, side) && this.matchSideRelativeToMiddle(position, layer, side);
  }

  matchNearestBorder(position, layer, side) {
    const isDirectionHorizontal = (Utils.direction_fromSide(side) === "horizontal");
    const isDirectionHorizontal_sign = isDirectionHorizontal ? +1 : -1;
    const continuousCoordinateName = Utils.continuousCoordinateName_fromSide(side);
    const coordinate      = position[continuousCoordinateName];
    const otherCoordinate = position[Utils.otherOne(continuousCoordinateName, Utils.CONTINOUS_COORDINATES_NAMES)];

    return Utils.orthogonalSides(side).every((orthogonalSide) => isDirectionHorizontal === (
        isDirectionHorizontal_sign * Utils.sign_fromSide(side)           * (coordinate      - this.border(layer, side))
      > isDirectionHorizontal_sign * Utils.sign_fromSide(orthogonalSide) * (otherCoordinate - this.border(layer, orthogonalSide))
    ));
  }

  isInsideSomeOrthogonalSideArea(position, layer, side) {
    return Utils.orthogonalSides(side).some((orthogonalSide) => this.isNearBorder(position, layer, orthogonalSide));
  }

  updateSelectionLayerCursorAndResizingSides(eventType, old_position, new_position, isMouseDown, lockAspectRatio=false) {
    if (this.selectedLayer !== null) {
      const isNearBorder                   = (side)      => this.isNearBorder(old_position, this.selectedLayer, side);
      const isInsideBorderArea             = (side)      => this.isInsideBorderArea(old_position, this.selectedLayer, side);
      const isInsideSomeOrthogonalSideArea = (side)      => this.isInsideSomeOrthogonalSideArea(old_position, this.selectedLayer, side);
      const isInsideFarFromBorders         = (direction) => this.isInsideFarFromBorders(old_position, this.selectedLayer, direction);
      const matchNearestBorder             = (side)      => this.matchNearestBorder(old_position, this.selectedLayer, side);
      const isNearlyInside                 = (direction) => this.isNearlyInside(old_position, this.selectedLayer, direction);
      const matchSideRelativeToMiddle      = (side)      => this.matchSideRelativeToMiddle(old_position, this.selectedLayer, side);
  

      this.selectionLayer.resizingSides = Utils.objectFrom(Utils.SIDES, (side) =>
        !this.selectionLayer.lastMousedownNearlyInsideSelectedLayer          ?  null     :
        !(matchSideRelativeToMiddle(side) && isMouseDown)                    ?  null     :
        isNearBorder(side) && (!lockAspectRatio || matchNearestBorder(side)) ? "master"  :
        lockAspectRatio && isInsideSomeOrthogonalSideArea(side)              ? "subject" : null
      );
    

      const cursorTableIndex = (direction) =>
        isNearlyInside(direction) ? (
          (isMouseDown && this.selectionLayer.lastMousedownNearlyInsideSelectedLayer) ?
            1 + (this.selectionLayer.resizingSides[Utils.positiveSide_fromDirection(direction)] !== null ? 1 : 0)
              - (this.selectionLayer.resizingSides[Utils.negativeSide_fromDirection(direction)] !== null ? 1 : 0) :
          (lockAspectRatio && !(isInsideFarFromBorders("horizontal") && isInsideFarFromBorders("vertical"))) ?
            2 * Utils.sides_fromDirection(direction).map((side) => 
              isInsideBorderArea(side) || (isInsideSomeOrthogonalSideArea(side) && matchSideRelativeToMiddle(side))
            ).indexOf(true) :
          (
             this.selectionLayer.lastMousedownNearlyInsideSelectedLayer
          || eventType === "mouseup" || (eventType === "mousemove" && !isMouseDown)
          ) ? 
            [
              isInsideBorderArea(Utils.negativeSide_fromDirection(direction)),
              isInsideFarFromBorders(direction),
              isInsideBorderArea(Utils.positiveSide_fromDirection(direction))
            ].indexOf(true)
          : -1
        ) : -1;

      const grabCursor = isMouseDown ? "grabbing" : "grab";

      const old_cursor = this.selectionLayer.cursor;
      const new_cursor =
        (    
           (!this.isInside_someLayerAboveSelectedLayer(new_position) || (isMouseDown && eventType === "mousemove"))
        && cursorTableIndex("horizontal") >= 0 && cursorTableIndex("vertical") >= 0
        ) ? [
          ["nwse-resize", "ns-resize", "nesw-resize"],
          [  "ew-resize",  grabCursor,   "ew-resize"],
          ["nesw-resize", "ns-resize", "nwse-resize"]
        ][cursorTableIndex("vertical")][cursorTableIndex("horizontal")] : this.selectionLayer.defaultCursor;

      if (new_cursor !== old_cursor) {
        this.selectionLayer.canvas.classList.remove(old_cursor);
        this.selectionLayer.canvas.classList.add(new_cursor);
      }
      this.selectionLayer.cursor = new_cursor;
    }
  }

  sameDiscretePosition(position1, position2, center=false) {
    if (center) {
      return position1.i_center === position2.i_center
          && position1.j_center === position2.j_center;
    } else {
      return position1.i === position2.i
          && position1.j === position2.j;
    }
  }

  handleMousemove_forDisplayArea(event) {
    const old_position = Utils.shallowCopy(this.currentMousePositionInDisplayArea);
    const new_position = this.position_fromEvent(event, this.displayArea);

    this.currentMousePositionInDisplayArea = Utils.shallowCopy(new_position);

    this.updateSelectionLayerCursorAndResizingSides("mousemove", old_position, new_position, this.isMouseDown, event.shiftKey);
    
    if (this.isMouseDown) {
      if (!this.sameDiscretePosition(old_position, new_position, true)) {
        if (this.currentToolName === "select-layer" && this.selectedLayer !== null) {
          if (this.selectionLayer.cursor === "grabbing") {
            this.selectedLayer.move(old_position, new_position);
          } else if (Utils.SIDES.some((side) => this.selectionLayer.resizingSides[side] !== null)) {
            this.selectedLayer.resize(old_position, new_position, this.selectionLayer.resizingSides);
          }
          this.updateSelectionLayer();
        }
      }

      if (this.lastMousedownElement === this.board) {
        if (this.currentToolName === "drag") {
          this.moveBoard(old_position, new_position);
        }
        if (this.isInsideBoard(old_position) || this.isInsideBoard(new_position)) {
          const old_positionInBoard = this.nearestPositionInBoard(old_position, new_position);
          const new_positionInBoard = this.nearestPositionInBoard(new_position, old_position);

          if (!this.sameDiscretePosition(old_positionInBoard, new_positionInBoard)) {
            if (this.currentToolName === "pixel") {
              this.draftShape(new Pixel({position: new_positionInBoard, rgbaColor: this.currentRgbaColor}), false);
            }
            if (this.currentToolName === "brush") {
              this.draftShape(new Line({
                toolName: "brush",
                start: old_positionInBoard, end: new_positionInBoard, rgbaColor: this.currentRgbaColor,
                width: this.tools["line"].settings.size.currentValue
              }), false);
            }
            if (["rectangle", "ellipse", "line"].includes(this.currentToolName)) {
              this.lastDraftLayer().clear();

              const shapeArgs = {
                toolName: this.currentToolName,
                start: this.shapeOriginPosition, end: new_positionInBoard, rgbaColor: this.currentRgbaColor
              };
              if (this.currentToolName === "line") {
                shapeArgs.width = this.tools["line"].settings.size.currentValue;
              }

              const shape = (() => {
                switch (this.currentToolName) {
                  case "rectangle": return new Rectangle(shapeArgs);
                  case "ellipse":   return new Ellipse(shapeArgs);
                  case "line":      return new Line(shapeArgs);
                }
              })();

              this.draftShape(shape, false);
            }
          }
        }
      }
    }
  }

  handleMouseup_forDisplayArea(event) {
    if (this.currentToolName === "drag") {
      this.board.classList.remove("grabbing");
      this.board.classList.add("grab");
    }
    if (this.currentToolName === "select-layer") {
      const position = this.position_fromEvent(event, this.displayArea);
      const latestLayerContainingPosition = this.latestLayerContainingPosition(position);
      if (latestLayerContainingPosition !== this.selectedLayer) {
        if (!this.isNearlyInside(position, this.selectedLayer) || this.isInsideSelectedLayer(position)) {
          this.selectLayer(latestLayerContainingPosition);
        }
      }
      this.updateSelectionLayerCursorAndResizingSides("mouseup", position, position, false, event.shiftKey);
    }
    if (this.isColorPickerActive) {
      const position = this.position_fromEvent(event, this.displayArea);
      if (this.isInsideBoard(position)) {
        this.setCurrent_colorSettingState_fromRgba(this.apparentRgbaColor(position.i, position.j));
        this.deactivateColorPicker();
      }
    }
  }

  handleContextmenu_forDisplayArea(event) {
    event.preventDefault();
  }

  attachEvents() {
    window.addEventListener("resize", () => { this.handleResize_forWindow(); });


    this.isMouseDown = false;
    this.lastMousedownElement = undefined;
    this.hoveredElement = undefined;

    this.main.addEventListener("wheel",     (event) => { this.handleWheel_forMain(event);     }, true);
    this.main.addEventListener("mousedown", (event) => { this.handleMousedown_forMain(event); }, true);
    this.main.addEventListener("mouseup",   ()      => { this.handleMouseup_forMain();        }, true);


    this.draftLayers = [];

    this.displayArea.addEventListener("wheel",       (event) => { this.handleWheel_forDisplayArea(event);       });
    this.displayArea.addEventListener("mousedown",   (event) => { this.handleMousedown_forDisplayArea(event);   });
    this.displayArea.addEventListener("mousemove",   (event) => { this.handleMousemove_forDisplayArea(event);   });
    this.displayArea.addEventListener("mouseup",     (event) => { this.handleMouseup_forDisplayArea(event);     });
    this.displayArea.addEventListener("contextmenu", (event) => { this.handleContextmenu_forDisplayArea(event); });


    this.iterateOverSettings((setting) => {
      setting.elements.adjuster.addEventListener("wheel",     (event) => { this.handleWheel_forAdjuster(event, setting);     });
      setting.elements.adjuster.addEventListener("mousedown", (event) => { this.handleMousedown_forAdjuster(event, setting); });
      setting.elements.handle.addEventListener("mousedown", () => { this.handleMousedown_forSettingHandle(setting); });
      setting.elements.handle.addEventListener("mouseup",   () => { this.handleMouseup_forSettingHandle(setting); });
    });
    this.main.addEventListener("mousemove", (event) => {
      this.iterateOverSettings((setting) => { this.handleMousemove_forAdjuster(event, setting); });
    });


    this.controls["clear-draft"].button.addEventListener("mouseup", () => { this.handleMouseup_forClearDraftButton(); });
    this.controls["submit"]     .button.addEventListener("mouseup", () => { this.handleMouseup_forSubmitButton();     });

    this.stacks = {"undo": this.draftLayers, "redo": []};
    this.undoRedoIntervalIDs = {};
    for (const undoOrRedo of ["undo", "redo"]) {
      this.controls[undoOrRedo].button.onmousedown  = () => { this.handleMousedown_forUndoOrRedoButton(undoOrRedo);  };
      this.controls[undoOrRedo].button.onmouseup    = () => { this.handleMouseup_forUndoOrRedoButton(undoOrRedo);    };
      this.controls[undoOrRedo].button.onmouseleave = () => { this.handleMouseleave_forUndoOrRedoButton(undoOrRedo); };
    }

    for (const [toolName, tool] of Object.entries(this.tools)) {
      tool.button.addEventListener("mouseup", () => { this.setCurrent_tool(toolName); });
    }
    this.tools["image"].button.addEventListener("mouseup", () => { this.tools["image"].input.click(); });
    this.tools["image"].input.onchange = () => { this.handleOnchange_forImageButtonInput(); };

    this.isColorPickerActive = false;
    this.colorPicker.button.addEventListener("mouseup", () => { this.handleMouseup_forColorPickerButton(); });
    this.iterateOverButtons((button) => {
      button.addEventListener("mouseenter", () => { this.hoveredElement = button;    });
      button.addEventListener("mouseleave", () => { this.hoveredElement = undefined; });
      const buttonBackgrounds = {
        mouseenter: "var(--hovered-button-background-color)", mouseleave: "none",
        mousedown: "var(--selected-button-background-color)", mouseup: "none"
      };
      for (const [eventtype, propertyValue] of Object.entries(buttonBackgrounds)) {
        button.addEventListener(eventtype, () => {
          if ( button !== this.tools[this.currentToolName].button &&
              (button !== this.controls["submit"].button || this.controls["submit"].button.disabled) &&
              (button !== this.colorPicker.button || !this.isColorPickerActive)) {
            button.style.background = propertyValue;
          }
        });
      }
    });


    this.pressedKeys = {};
    this.nbPressedKeys = 0;
    document.addEventListener("keydown", (event) => { this.handleKeydown_forDocument(event); });
    document.addEventListener("keyup",   (event) => { this.handleKeyup_forDocument(event);   });
  }

  handleOnchange_forImageButtonInput() {
    const files = this.tools["image"].input.files;
    if (files.length === 0) {
      console.error("No file selected.");
    } else if (!["image/jpeg", "image/png"].includes(files[0].type)) {
      console.error("Invalid file:", files[0].type);
    } else {
      const imageToDraw = new Image();
      imageToDraw.src = URL.createObjectURL(files[0]);
      imageToDraw.onload = () => {
        const scale = Math.min(1, this.boardWidth / imageToDraw.width, this.boardHeight / imageToDraw.height);
        const imageWidthOnLayer  = Math.round(scale * imageToDraw.width);
        const imageHeightOnLayer = Math.round(scale * imageToDraw.height);
        this.draftShape(new ImageShape({
          content: imageToDraw,
          position: {
            i: Math.floor((this.boardWidth  - imageWidthOnLayer)  / 2),
            j: Math.floor((this.boardHeight - imageHeightOnLayer) / 2)
          },
          sizeOnLayer: {width: imageWidthOnLayer, height: imageHeightOnLayer}
        }));

        this.setCurrent_tool("select-layer");
      };
      imageToDraw.onerror = () => { console.error("Error loading image to draw."); };
    }
  }

  selectLayer(layer) {
    if (layer !== this.selectedLayer) {
      this.selectedLayer = layer;
      this.updateSelectionLayer();
    }
  }

  renderSelectionLayer() {
    this.selectionLayer = {};
    this.selectionLayer.canvas = this.selectionCanvas;
    this.selectionLayer.canvas.width  = this.displayArea.clientWidth;
    this.selectionLayer.canvas.height = this.displayArea.clientHeight;
    this.selectionLayer.ctx = this.selectionLayer.canvas.getContext("2d");

    this.selectionLayer.defaultCursor = this.tools["select-layer"].cursor;
    this.selectionLayer.borderScope = Utils.px_fromRem(0.5);

    this.selectionLayer.lastMousedownNearlyInsideSelectedLayer = false;

    this.selectedLayer = null;
  }

  clearSelectionLayer() {
    this.selectionLayer.ctx.clearRect(0, 0, this.selectionLayer.canvas.width, this.selectionLayer.canvas.height);
  }

  updateSelectionLayer() {
    this.selectionLayer.canvas.width  = this.displayArea.clientWidth;
    this.selectionLayer.canvas.height = this.displayArea.clientHeight;

    this.clearSelectionLayer();
    if (this.selectedLayer !== null) {
      this.drawLayerSelectionBox(this.selectedLayer);
    }
  }

  drawLayerSelectionBox(layer) {
    const left   = Math.round(this.boardApparentLeft + this.currentScale * layer.unionHullBox.left)   + 0.5;
    const right  = Math.round(this.boardApparentLeft + this.currentScale * layer.unionHullBox.right)  + 0.5;
    const top    = Math.round(this.boardApparentTop  + this.currentScale * layer.unionHullBox.top)    + 0.5;
    const bottom = Math.round(this.boardApparentTop  + this.currentScale * layer.unionHullBox.bottom) + 0.5;

    const ctx = this.selectionLayer.ctx;


    ctx.strokeStyle = "white";

    const corners = [{x: left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
    for (let i = 0; i < corners.length; i++) {
      ctx.beginPath();
      ctx.moveTo(corners[(i+0) % corners.length].x, corners[(i+0) % corners.length].y);
      ctx.lineTo(corners[(i+1) % corners.length].x, corners[(i+1) % corners.length].y);
      ctx.stroke();
    }


    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "black";
    
    ctx.beginPath();
    ctx.moveTo(left + 0.5, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.stroke();
  }

  handleKeyup_forDocument(event) {
    const eventKey = event.key.toLowerCase();
    for (const undoOrRedo of ["undo", "redo"]) {
      if (
        this.controls[undoOrRedo].shortcuts.some((shortcut) => {
          const keys = this.keys_fromShortcut(shortcut);
          return keys.every((key) => this.pressedKeys[key]) && keys.includes(eventKey);
        })
      ) {
        this.stopUndoingOrRedoing(undoOrRedo);
      }
    }
    this.pressedKeys[eventKey] = false;
    this.nbPressedKeys--;
  }

  handleKeydown_forDocument(event) {
    const eventKey = event.key.toLowerCase();
    if (this.pressedKeys[eventKey]) {
      return;
    }
    this.pressedKeys[eventKey] = true;
    this.nbPressedKeys++;
    if (this.pressedKeys["n"] && eventKey === "*") {
      this.nukeWallet();
    } else {
      const callbacks = {
        "clear-draft": () => { this.clearDraft(); },
        "undo":        () => { this.startUndoingOrRedoing("undo"); },
        "redo":        () => { this.startUndoingOrRedoing("redo"); },
        "submit":      () => { this.handleSubmission(); },
      }
      for (const [controlName, control] of Object.entries(this.controls)) {
        if (
          control.shortcuts.some((shortcut) => {
            const keys = this.keys_fromShortcut(shortcut);
            return keys.length === this.nbPressedKeys
                && keys.slice(0, -1).every((key) => this.pressedKeys[key])
                && eventKey === keys[keys.length - 1];
          })
        ) {
          callbacks[controlName]();
        }
      }
    }
  }

  key_fromKeyName(keyName) {
    const keys = {"Ctrl": "control"};
    return keys[keyName] ?? keyName.toLowerCase();
  }

  keys_fromShortcut(shortcut) {
    return shortcut.split("+").map((keyName) => this.key_fromKeyName(keyName));
  }

  handleMousedown_forSettingHandle(setting) {
    setting.elements.handle.classList.remove("grab");
    setting.elements.handle.classList.add("grabbing");
  }

  handleMouseup_forSettingHandle(setting) {
    setting.elements.handle.classList.remove("grabbing");
    setting.elements.handle.classList.add("grab");
  }

  iterateOverButtons(callback) {
    for (const segment of Object.values(this.topBarSegments)) {
      for (const button of segment.children) {
        callback(button);
      }
    }
    callback(this.colorPicker.button);
  }

  handleMousemove_forAdjuster(event, setting) {
    if (this.isMouseDown && this.lastMousedownElement === setting.elements.adjuster) {
      const position = this.position_fromEvent(event, setting.elements.adjuster);
      this.adjustSettingClones_fromPosition(position, setting);
    }
  }

  handleMouseup_forClearDraftButton() {
    this.clearDraft();
  }

  clearDraft() {
    while (this.draftLayers.length !== 0) {
      this.removeLastDraftLayer();
    }
    this.stacks.redo.length = 0;
    this.disableControl("undo");
    this.disableControl("redo");
  }

  removeLastDraftLayer() {
    const lastDraftLayer = this.draftLayers.pop();
    this.board.removeChild(lastDraftLayer.canvas);

    if (this.currentToolName === "select-layer") {
      this.selectLayer(this.lastDraftLayer());
    }
    
    if (this.draftLayers.length === 0) {
      this.disableControl("clear-draft");
      this.disableControl("submit");
    }

    return lastDraftLayer;
  }

  disableControl(controlName) {
    this.controls[controlName].button.disabled = true;
    this.controls[controlName].button.style.pointerEvents = "none";
    this.controls[controlName].button.classList.add("not-allowed");
    if (controlName === "submit") {
      this.controls["submit"].button.style.background = (this.hoveredElement === this.controls["submit"].button) ?
        "var(--hovered-button-background-color)" : "none";
    }
  }

  enableControl(controlName) {
    this.controls[controlName].button.disabled = false;
    this.controls[controlName].button.style.pointerEvents = "auto";
    this.controls[controlName].button.classList.remove("not-allowed");
    if (controlName === "submit") {
      this.controls["submit"].button.style.background = "var(--submit-button-background-color)";
    }
  }

  undo() {
    const lastDraftLayer = this.removeLastDraftLayer();
    if (this.stacks.undo.length === 0) {
      this.disableControl("undo");
    }

    if (this.stacks.redo.length === 0) {
      this.enableControl("redo");
    }
    this.stacks.redo.push(lastDraftLayer);
  }

  iterateOverUnionOfShapeBoxesInsideBoard(layer, callback) {
    for (let i = layer.layerBox.left; i < layer.layerBox.right; i++) {
      const jIntervals = [];
      for (const shapeBox of layer.shapeBoxes) {
        if (i >= shapeBox.corners.left.i && i <= shapeBox.corners.right.i) {
          const slope  = (corner1, corner2) => (corner2.j - corner1.j) / (corner2.i - corner1.i);
          const jBound = (baseCorner) => {
            return Math.round(
              baseCorner.j + (
                (i < baseCorner.i) ? slope(baseCorner, shapeBox.corners.left)  :
                (i > baseCorner.i) ? slope(baseCorner, shapeBox.corners.right) : 0
              ) * (i - baseCorner.i)
            );
          }
          jIntervals.push({min: jBound(shapeBox.corners.top), max: jBound(shapeBox.corners.bottom)});
        }
      }
  
      jIntervals.sort((interval1, interval2) => interval1.min - interval2.min);
  
      let last_j = -1;
      for (const jInterval of jIntervals) {
        if (jInterval.max > last_j) {
          const jMin = Math.max(jInterval.min, last_j + 1);
          const jMax = Math.min(jInterval.max, this.boardHeight - 1);
          for (let j = jMin; j <= jMax; j++) {
            callback(i, j);
          }
          last_j = jMax;
        }
      }
    }
  }

  async submitDraftedTiles() {
    const rgbaColorsToSend = {};
    for (const layer of this.draftLayers) {
      const layerData = layer.ctx.getImageData(
        layer.layerBox.left,  layer.layerBox.top,
        layer.layerBox.width, layer.layerBox.height
      ).data;
      const layerRgbaColors = {};
      this.iterateOverUnionOfShapeBoxesInsideBoard(layer, (i, j) => {
        const layerDataIndex = 4 * ((j - layer.layerBox.top) * layer.layerBox.width + (i - layer.layerBox.left));
        if (layerData[layerDataIndex + 3] !== 0) {
          const positionStr = JSON.stringify({i, j});
          layerRgbaColors[positionStr] = {
            red:   layerData[layerDataIndex + 0],
            green: layerData[layerDataIndex + 1],
            blue:  layerData[layerDataIndex + 2],
            alpha: layerData[layerDataIndex + 3]
          };
        }
      });
      for (const [positionStr, rgbaColorToAdd] of Object.entries(layerRgbaColors)) {
        const old_rgbaColor = rgbaColorsToSend[positionStr] ?? {red: 0, green: 0, blue: 0, alpha: 0};
        rgbaColorsToSend[positionStr] = this.mod.mixedRgbaColor(old_rgbaColor, rgbaColorToAdd);
      }
    }
    const tilesToSend = [];
    for (const [positionStr, rgbaColor] of Object.entries(rgbaColorsToSend)) {
      const {i, j} = JSON.parse(positionStr);
      for (const componentName of Object.keys(rgbaColor)) {
        rgbaColor[componentName] = Math.round(rgbaColor[componentName]);
      }
      tilesToSend.push({i, j, rgbaColor});
    }


    if (tilesToSend.length !== 0) {
      const ordinal = await this.mod.sendDrawingTransaction(tilesToSend);
      const effectiveTileArray = tilesToSend.map((tile) => this.boardState.setTile(tile, "pending", ordinal));
      return effectiveTileArray;
    }
  }

  redo() {
    const layer = this.stacks.redo.pop();
    if (this.stacks.redo.length === 0) {
      this.disableControl("redo");
    }

    if (this.stacks.undo.length === 0) {
      this.enableControl("undo");
    }
    this.addDraftLayer(layer);
  }

  activateColorPicker() {
    this.isColorPickerActive = true;
    this.colorPicker.button.style.background = "var(--selected-button-background-color)";
    this.board.classList.add(this.colorPicker.cursor);
  }

  baseRgbaColor(i, j) {
    const pendingRgbaColor   = this.boardState.getTileRgbaColor(i, j, "pending")   ?? {red: 0, green: 0, blue: 0, alpha: 0};
    const confirmedRgbaColor = this.boardState.getTileRgbaColor(i, j, "confirmed") ?? {red: 0, green: 0, blue: 0, alpha: 0};

    return this.mod.mixedRgbaColor(this.mod.mixedRgbaColor(this.blankTileRgbaColor, confirmedRgbaColor), pendingRgbaColor);
  }

  drawConfirmedTiles(tileArray) {
    this.baseLayers.confirmed.drawTiles(tileArray);
  }

  drawPendingTiles(tileArray) {
    this.baseLayers.pending.drawTiles(tileArray);
  }

  undrawPendingTiles(tileArray) {
    this.drawPendingTiles(tileArray.map((tile) => ({i: tile.i, j: tile.j, rgbaColor: null})));
  }
}

export default BrowserInterface;