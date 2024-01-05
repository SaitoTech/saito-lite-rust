const RBTree     = require("bintrees").RBTree;
const createHash = require("crypto").createHash;

class GraffitiUI {
  constructor(mod) {
    this.mod = mod;
    
    this.slug       = this.mod.slug;
    this.gridWidth  = this.mod.gridWidth;
    this.gridHeight = this.mod.gridHeight;
    this.gridState  = this.mod.gridState;

    this.maxScale = 15;
    this.zoomAbsoluteFactor = Math.sqrt(Math.sqrt(2));
    this.markSizeRatio = 0.1;
    this.hourglassHeightRatio = 0.5;
    this.actionsPerSecond = 10;

    this.draggable = false;
    this.zoomable  = false;

    this.buttonLightColor  = "#f7f7f7";
    this.buttonShadowColor = "#909090";
  }

  async render() {
    this.renderForeground();
    this.renderButtonElements();
    this.attachEventsToForeground();
    await this.loadBaseHourglass();
    this.attachEventsToButtonElements();
  }

  renderForeground() {
    this.foreground_widthHeight_ratio = this.gridWidth / this.gridHeight;
    this.wholeView_foregroundApparentWidth
      = Math.min(window.innerWidth, window.innerHeight * this.foreground_widthHeight_ratio);
    this.wholeView_foregroundApparentHeight
      = Math.min(window.innerHeight, window.innerWidth / this.foreground_widthHeight_ratio);

    this.minScale = this.wholeView_foregroundApparentWidth / this.gridWidth;
    this.currentScale = this.minScale;

    
    this.gridApparentWidth   = this.gridWidth  * this.currentScale;
    this.gridApparentHeight  = this.gridHeight * this.currentScale;
    this.gridRenderingWidth  = this.gridWidth  * this.maxScale;
    this.gridRenderingHeight = this.gridHeight * this.maxScale;

    this.foregroundLeft = (window.innerWidth  - this.wholeView_foregroundApparentWidth)  / 2;
    this.foregroundTop  = (window.innerHeight - this.wholeView_foregroundApparentHeight) / 2;
    this.gridApparentLeft = this.foregroundLeft;
    this.gridApparentTop  = this.foregroundTop;
    this.gridRenderingLeft = this.gridApparentLeft - (this.gridRenderingWidth  - this.gridApparentWidth)  / 2;
    this.gridRenderingTop  = this.gridApparentTop  - (this.gridRenderingHeight - this.gridApparentHeight) / 2;


    this.foreground = document.createElement("div");
    this.foreground.id = "foreground";
    document.body.appendChild(this.foreground);
    this.foreground.style.width  = `${this.gridApparentWidth}px`;
    this.foreground.style.height = `${this.gridApparentHeight}px`;
    this.foreground.style.left = `${this.foregroundLeft}px`;
    this.foreground.style.top  = `${this.foregroundTop}px`;

    this.gridContainer = document.createElement("div");
    this.gridContainer.id = "gridContainer";
    this.foreground.appendChild(this.gridContainer);
    this.gridContainer.style.width  = `${this.gridRenderingWidth}px`;
    this.gridContainer.style.height = `${this.gridRenderingHeight}px`;
    this.gridContainer.style.left = `${this.gridRenderingLeft - this.foregroundLeft}px`;
    this.gridContainer.style.top  = `${this.gridRenderingTop  - this.foregroundTop}px`;
    this.gridContainer.style.transform = `scale(${this.currentScale / this.maxScale})`;

    this.grid = document.createElement("canvas");
    this.grid.id = "grid";
    this.gridContainer.appendChild(this.grid);
    this.grid.width  = this.gridRenderingWidth;
    this.grid.height = this.gridRenderingHeight;

    this.gridCtx = this.grid.getContext("2d");
    this.gridCtx.imageSmoothingEnabled = false;
    this.gridCtx.fillStyle = this.mod.blankTileColor;
    this.gridCtx.fillRect(0, 0, this.grid.width, this.grid.height);
  }

  updateForegroundRendering() {
    this.gridApparentWidth  = this.gridWidth  * this.currentScale;
    this.gridApparentHeight = this.gridHeight * this.currentScale;

    this.gridRenderingLeft = this.gridApparentLeft - (this.gridRenderingWidth  - this.gridApparentWidth)  / 2;
    this.gridRenderingTop  = this.gridApparentTop  - (this.gridRenderingHeight - this.gridApparentHeight) / 2;

    this.gridContainer.style.left = `${this.gridRenderingLeft - this.foregroundLeft}px`;
    this.gridContainer.style.top  = `${this.gridRenderingTop  - this.foregroundTop}px`;
    this.gridContainer.style.transform = `scale(${this.currentScale / this.maxScale})`;
  }

  renderButtonElements() {
    this.renderButtonContainers();
    this.renderButtons();
    this.renderButtonImages();
    this.renderColorPicker();
  }

  renderButtonContainers() {
    this.allButtonsContainer  = document.createElement("div");
    this.colorPickerContainer = document.createElement("div");

    this.buttonContainers = [this.allButtonsContainer, this.colorPickerContainer];
    for (const buttonContainer of this.buttonContainers) {
      buttonContainer.classList.add("buttonContainer");
      document.body.appendChild(buttonContainer);
    }
  }

  renderButtons() {
    this.cancelButton  = document.createElement("button");
    this.undoButton    = document.createElement("button");
    this.colorButton   = document.createElement("button");
    this.redoButton    = document.createElement("button");
    this.confirmButton = document.createElement("button");

    this.colorButton.id = "colorButton";

    this.buttons = [this.cancelButton, this.undoButton, this.colorButton, this.redoButton, this.confirmButton];
    for (const button of this.buttons) {
      this.allButtonsContainer.appendChild(button);
      button.style.backgroundImage = `linear-gradient(to bottom, ${this.buttonLightColor}, ${this.buttonShadowColor})`;
    }
  }

  renderButtonImages() {
    const imageDir = `${this.slug}/img`;

    this.cancelButtonImage = document.createElement("img");
    this.cancelButton.appendChild(this.cancelButtonImage);
    this.cancelButtonImage.src = `${imageDir}/cancel-mini.png`;
    this.cancelButtonImage.style = "width: 25px; height: 21px";

    this.undoButtonImage = document.createElement("img");
    this.undoButton.appendChild(this.undoButtonImage);
    this.undoButtonImage.src = `${imageDir}/undo-mini.png`;
    this.undoButtonImage.style = "width: 40px; height: 34px";

    this.redoButtonImage = document.createElement("img");
    this.redoButton.appendChild(this.redoButtonImage);
    this.redoButtonImage.src = `${imageDir}/redo-mini.png`;
    this.redoButtonImage.style = "width: 40px; height: 34px";

    this.confirmButtonImage = document.createElement("img");
    this.confirmButton.appendChild(this.confirmButtonImage);
    this.confirmButtonImage.src = `${imageDir}/confirm-mini.png`;
    this.confirmButtonImage.style = "width: 25px; height: 21px";
  }

  renderColorPicker() {
    this.colorPickerButton = document.createElement("label");
    this.colorPickerButton.id = "colorPickerButton";
    this.colorPickerContainer.appendChild(this.colorPickerButton);
    this.colorPickerButton.htmlFor = "colorPickerInput";
    this.colorPickerButton.style.backgroundImage =
      `linear-gradient(to bottom, ${this.buttonLightColor}, ${this.buttonShadowColor})`;

    this.selectedColor = document.createElement("div");
    this.selectedColor.id = "selectedColor";
    this.colorPickerButton.appendChild(this.selectedColor);
  }

  attachEventsToForeground() {
    this.mousePosition = {x: null, y: null, i: null, j: null};
    this.mousedown = false;
    this.lastMousedownButton = null;
    this.lastMousedownInsideGrid = null;

    // `tileHash` to make sure likely adjacent drafted tiles have non-adjacent keys on average
    // to form a well-balanced red-black tree (perhaps not necessary).
    this.draftedTiles = new RBTree((a,b) => { return this.tileHash(a) - this.tileHash(b); });

    this.foreground.addEventListener("wheel",       (event) => { this.onWheelOverForeground(event);       });
    this.foreground.addEventListener("mousedown",   (event) => { this.onMousedownOverForeground(event);   });
    this.foreground.addEventListener("mousemove",   (event) => { this.onMousemoveOverForeground(event);   });
    this.foreground.addEventListener("mouseup",     ()      => { this.onMouseupOverForeground();          });
    this.foreground.addEventListener("contextmenu", (event) => { this.onContextMenuOverForeground(event); });
  }

  attachEventsToButtonElements() {
    this.attachStyleEventsToButtonElements();
    this.attachFeatureEventsToButtonElements();
  }

  attachStyleEventsToButtonElements() {
    for (const button of this.buttons) {
      button.style.cursor = "pointer";
      button.addEventListener("mousedown", () => {
        button.style.backgroundImage = `linear-gradient(to bottom, ${this.buttonShadowColor}, ${this.buttonLightColor})`;
      });
      button.addEventListener("mouseup", () => {
        button.style.backgroundImage = `linear-gradient(to bottom, ${this.buttonLightColor}, ${this.buttonShadowColor})`;
      });
      button.addEventListener("mouseleave", () => {
        button.style.backgroundImage = `linear-gradient(to bottom, ${this.buttonLightColor}, ${this.buttonShadowColor})`;
      });
    }
    this.colorPickerButton.style.cursor = "pointer";
  }

  attachFeatureEventsToColorPicker() {
    this.colorPickerInput = document.createElement("input");
    this.colorPickerContainer.appendChild(this.colorPickerInput);
    this.colorPickerInput.type = "color";
    this.colorPickerInput.id = "colorPickerInput";

    this.colorPickerInput.addEventListener("input", () => {
      this.selectedColor.style.background = this.colorPickerInput.value;
    });
  }

  attachFeatureEventsToButtonElements() {
    this.cancelButton.addEventListener("mouseup", () => { this.onMouseupOverCancelButton(); });
    this.confirmButton.addEventListener("mouseup", () => { this.onMouseupOverConfirmButton(); });

    this.attachFeatureEventsToColorPicker();
    this.attachFeatureEventsToUndoButton();
    this.attachFeatureEventsToRedoButton();
  }

  attachFeatureEventsToUndoButton() {
    this.undoStack = [];
    let undoIntervalId;
    this.undoButton.addEventListener("mousedown", () => {
      if (this.undoStack.length != 0) {
        this.undo();
        undoIntervalId = setInterval(() => {
          if (this.undoStack.length != 0) {
            this.undo();
          } else {
            clearInterval(undoIntervalId);
          }
        }, 1000 / this.actionsPerSecond);
      }
    });
    this.undoButton.addEventListener("mouseup",    () => { clearInterval(undoIntervalId); });
    this.undoButton.addEventListener("mouseleave", () => { clearInterval(undoIntervalId); });
  }

  attachFeatureEventsToRedoButton() {
    this.redoStack = [];
    let redoIntervalId;
    this.redoButton.addEventListener("mousedown", () => {
      if (this.redoStack.length != 0) {
        this.redo();
        redoIntervalId = setInterval(() => {
          if (this.redoStack.length != 0) {
            this.redo();
          } else {
            clearInterval(redoIntervalId);
          }
        }, 1000 / this.actionsPerSecond);
      }
    });
    this.redoButton.addEventListener("mouseup",    () => { clearInterval(redoIntervalId); });
    this.redoButton.addEventListener("mouseleave", () => { clearInterval(redoIntervalId); });
  }

  updateScale(zoomFactor) {
    const newScale = this.currentScale * zoomFactor;
    if (newScale < this.minScale) {
      zoomFactor = this.minScale / this.currentScale;
      this.currentScale = this.minScale;
    } else if (newScale > this.maxScale) {
      zoomFactor = this.maxScale / this.currentScale;
      this.currentScale = this.maxScale;
    } else {
      this.currentScale = newScale;
    }
    return zoomFactor;
  }

  updateTilesRendering(locatedStateArray) {
    for (const locatedState of locatedStateArray) {
      this.updateTileRendering(locatedState);
    }
  }

  updateTileRendering(newLocatedState) {
    const {i: i, j: j, state: newState} = newLocatedState;
    if (newState.drafted !== null) {
      this.drawTile(i, j, newState.drafted.color);
      this.drawDraftMark(i, j, newState.drafted.color);
    } else if (newState.pending !== null) {
      this.drawTile(i, j, newState.pending.color);
      this.drawHourglass(i, j, newState.pending.color);
    } else if (newState.confirmed !== null) {
      this.drawTile(i, j, newState.confirmed.color);
    } else {
      this.drawTile(i, j, this.mod.blankTileColor);
    }
  }

  updateMousePosition(event, i, j) {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
    if (this.isInsideGrid(this.mousePosition)) {
      this.mousePosition.i = i;
      this.mousePosition.j = j;
    } else {
      this.mousePosition.i = null;
      this.mousePosition.j = null;
    }
  }

  onWheelOverForeground(event) {
    if (this.zoomable) {
      event.preventDefault();
      const zoomFactor = this.updateScale(
        (event.deltaY < 0) ? this.zoomAbsoluteFactor : 1 / this.zoomAbsoluteFactor
      );
      this.gridApparentLeft = event.clientX + zoomFactor * (this.gridApparentLeft - event.clientX);
      this.gridApparentTop  = event.clientY + zoomFactor * (this.gridApparentTop  - event.clientY);
      this.updateForegroundRendering();
    }
  }

  onMousedownOverForeground(event) {
    this.lastMousedownButton = event.button;
    this.lastMousedownInsideGrid = this.isInsideGrid({x: event.clientX, y: event.clientY});
    if (this.lastMousedownButton === 0 || this.lastMousedownButton === 2) {
      this.mousedown = true;
      const i = Math.floor((event.clientX - this.gridApparentLeft) / this.currentScale);
      const j = Math.floor((event.clientY - this.gridApparentTop)  / this.currentScale);
      if (this.lastMousedownInsideGrid) {
        this.actOnTile(i, j);
      }
      this.updateMousePosition(event, i, j);
    }
  }

  onMousemoveOverForeground(event) {
    const i = Math.floor((event.clientX - this.gridApparentLeft) / this.currentScale);
    const j = Math.floor((event.clientY - this.gridApparentTop)  / this.currentScale);
    if (this.mousedown) {
      if (!this.lastMousedownInsideGrid) {
        if (this.draggable) {
          this.moveForeground(event);
        }
      } else if (this.isInsideGrid({x: event.clientX, y: event.clientY})) {
        if (i !== this.mousePosition.i || j !== this.mousePosition.j) {
          this.actOnTile(i, j);
        }
      }
    }
    this.updateMousePosition(event, i, j);
  }

  onMouseupOverForeground() {
    this.mousedown = false;
  }

  onContextMenuOverForeground(event) {
    event.preventDefault();
  }

  onMouseupOverCancelButton() {
    this.clearDraft();
  }

  onMouseupOverConfirmButton() {
    if (this.draftedTiles.size !== 0) {
      const tilesToSend = [];
      const it = this.draftedTiles.iterator(); let draftedTile;
      while ((draftedTile = it.next()) !== null) {
        tilesToSend.push(draftedTile);
      }
      this.mod.sendPaintingTransaction(tilesToSend).then((ordinal) => {
        for (const tile of tilesToSend) {
          this.mod.updateTile(tile, "pending", ordinal);
        }
        this.clearDraft();
      });
    }
  }

  moveForeground(event) {
    this.gridApparentLeft += event.clientX - this.mousePosition.x;
    this.gridApparentTop  += event.clientY - this.mousePosition.y;
    if (this.gridApparentLeft > window.innerWidth / 2) {
      this.gridApparentLeft = window.innerWidth / 2;
    } else if (this.gridApparentTop > window.innerHeight / 2) {
      this.gridApparentTop  = window.innerHeight / 2;
    } else if (this.gridApparentLeft < window.innerWidth / 2 - this.gridApparentWidth) {
      this.gridApparentLeft = window.innerWidth / 2 - this.gridApparentWidth;
    } else if (this.gridApparentTop  < window.innerHeight / 2 - this.gridApparentHeight) {
      this.gridApparentTop  = window.innerHeight / 2 - this.gridApparentHeight;
    }
    this.updateForegroundRendering();
  }

  isInsideGrid(position) {
    return position.x >= this.gridApparentLeft
        && position.x < this.gridApparentWidth + this.gridApparentLeft
        && position.y >= this.gridApparentTop
        && position.y < this.gridApparentHeight + this.gridApparentTop;
  }

  actOnTile(i, j) {
    if (this.lastMousedownButton === 0) {
      this.tryAndDraftTile(i, j);
    } else if (this.lastMousedownButton === 2) {
      this.tryAndUndraftTile(i, j);
    } else {
      console.error("Unexpected mousedown button: " + this.lastMousedownButton);
    }
  }

  undo() {
    const lastAction = this.undoStack.pop();
    this.redoStack.push(lastAction);
    const reversedLastActionType = this.actionType(this.reversedAction(lastAction));
    const tile = {i: lastAction.i, j: lastAction.j};
    if (reversedLastActionType === "undraft" || reversedLastActionType === "redraft") {
      this.draftedTiles.remove(tile);
    }
    if (reversedLastActionType === "draft"   || reversedLastActionType === "redraft") {
      tile.color = lastAction.oldDraftColor;
      this.draftedTiles.insert(tile);
    } else {
      tile.color = null;
    }
    this.mod.updateTile(tile, "drafted");
  }

  redo() {
    const lastUndoneAction = this.redoStack.pop();
    this.undoStack.push(lastUndoneAction);
    const lastUndoneActionType = this.actionType(lastUndoneAction);
    const tile = {i: lastUndoneAction.i, j: lastUndoneAction.j};
    if (lastUndoneActionType === "undraft" || lastUndoneActionType === "redraft") {
      this.draftedTiles.remove(tile);
    }
    if (lastUndoneActionType === "draft"   || lastUndoneActionType === "redraft") {
      tile.color = lastUndoneAction.newDraftColor;
      this.draftedTiles.insert(tile);
    } else {
      tile.color = null;
    }
    this.mod.updateTile(tile, "drafted");
  }

  actionType(action) {
    if (action.oldDraftColor === null && action.newDraftColor !== null) {
      return "draft";
    } else if (action.oldDraftColor !== null && action.newDraftColor !== null) {
      return "redraft";
    } else if (action.oldDraftColor !== null && action.newDraftColor === null) {
      return "undraft";
    } else {
      console.error("Unexpected action: " + action);
    }
  }

  reversedAction(action) {
    return {
      i: action.i, j: action.j,
      oldDraftColor: action.newDraftColor, newDraftColor: action.oldDraftColor
    };
  }

  clearDraft() {
    const it = this.draftedTiles.iterator(); let draftedTile;
    while ((draftedTile = it.next()) !== null) {
      this.mod.updateTile({i: draftedTile.i, j: draftedTile.j, color: null}, "drafted");
    }
    this.draftedTiles.clear();
  }

  tryAndDraftTile(i, j) {
    const alreadyDraftedTile = this.draftedTiles.find({i: i, j: j});
    if (alreadyDraftedTile === null) {
      this.draftTile(i, j, null, this.colorPickerInput.value);
    } else {
      if (this.colorPickerInput.value !== alreadyDraftedTile.color) {
        this.draftedTiles.remove(alreadyDraftedTile);
        this.draftTile(i, j, alreadyDraftedTile.color, this.colorPickerInput.value);
      }
    }
  }

  tryAndUndraftTile(i, j) {
    const alreadyDraftedTile = this.draftedTiles.find({i: i, j: j});
    if (alreadyDraftedTile !== null) {
      this.undraftTile(i, j, alreadyDraftedTile.color);
    }
  }

  draftTile(i, j, oldDraftColor, newDraftColor) {
    this.undoStack.push({i: i, j: j, oldDraftColor: oldDraftColor, newDraftColor: newDraftColor});
    this.redoStack = [];
    const draftTile = {i: i, j: j, color: newDraftColor};
    this.draftedTiles.insert(draftTile);
    this.mod.updateTile(draftTile, "drafted");
  }

  undraftTile(i, j, oldDraftColor) {
    this.undoStack.push({i: i, j: j, oldDraftColor: oldDraftColor, newDraftColor: null});
    this.redoStack = [];
    this.draftedTiles.remove({i: i, j: j});
    this.mod.updateTile({i: i, j: j, color: null}, "drafted");
  }

  loadBaseHourglass() {
    return new Promise((resolve, reject) => {
      this.baseHourglass = document.createElement("canvas");
      this.baseHourglassCtx = this.baseHourglass.getContext("2d", {willReadFrequently: true});
      this.baseHourglassImage = new Image();
      this.baseHourglassImage.src = `${this.slug}/img/hourglass-mini.png`;

      this.baseHourglassImage.onload = () => {
        console.assert(this.baseHourglassImage.width >= 1);
        this.hourglassWidthRatio  = this.hourglassHeightRatio
                                    * this.baseHourglassImage.width / this.baseHourglassImage.height;
        this.baseHourglass.width  = this.hourglassWidthRatio  * this.maxScale;
        this.baseHourglass.height = this.hourglassHeightRatio * this.maxScale;
        console.assert(this.baseHourglass.width >= 1);
        console.assert(this.baseHourglass.height >= 1);
        this.baseHourglassCtx.drawImage(
          this.baseHourglassImage, 0, 0, this.baseHourglass.width, this.baseHourglass.height
        );
        resolve();
      };

      this.baseHourglassImage.onerror = () => {
        reject();
      };
    });
  }

  drawTile(i, j, color) {
    this.gridCtx.fillStyle = color;
    this.gridCtx.fillRect(i * this.maxScale, j * this.maxScale, this.maxScale, this.maxScale);
  }

  drawDraftMark(i, j, tileColor) {
    this.gridCtx.fillStyle = this.markColor(tileColor);
    this.gridCtx.fillRect(
      (i + 0.5 - this.markSizeRatio / 2) * this.maxScale,
      (j + 0.5 - this.markSizeRatio / 2) * this.maxScale,
      this.markSizeRatio * this.maxScale,
      this.markSizeRatio * this.maxScale
    );
  }

  drawHourglass(i, j, tileColor) {
    console.assert(this.baseHourglass.width >= 1);
    console.assert(this.baseHourglass.height >= 1);
    const hourglassImageData = this.baseHourglassCtx.getImageData(
      0, 0, this.baseHourglass.width, this.baseHourglass.height
    );
    const components = this.mod.colorToComponents(tileColor);
    for (let s = 0; s < hourglassImageData.data.length; s += 4) {       
      for (const k of [0, 1, 2]) {
        hourglassImageData.data[s+k] = this.mixedComponent(
          components[k], this.oppositeComponent(components[k]), hourglassImageData.data[s+3]
        );
      }
      hourglassImageData.data[s+3] = 255;
    }
    this.gridCtx.putImageData(
      hourglassImageData,
      (i + 0.5 - this.hourglassWidthRatio  / 2) * this.maxScale,
      (j + 0.5 - this.hourglassHeightRatio / 2) * this.maxScale,
    );
  }

  markColor(color) {
    const intComponents = this.mod.colorToComponents(color);
    const markIntComponents = intComponents.map(this.oppositeComponent);
    return this.mod.componentsToColor(markIntComponents);
  }

  oppositeComponent(component) {
    return (component > 127) ? 0 : 255;
  }

  mixedComponent(component1, component2, alpha2) {
    return Math.round(component1 + (alpha2 / 255) * (component2 - component1));
  }

  tileHash(tile) {
    const id = tile.i * this.gridHeight + tile.j;
    return parseInt(createHash("md5").update(id.toString()).digest("hex"), 16) % (10 ** 15);
  }
}

module.exports = GraffitiUI;