const RBTree     = require("bintrees").RBTree;
const createHash = require("crypto").createHash;

class GraffitiUI {
  constructor(mod) {
    this.mod = mod;
    
    this.slug       = this.mod.slug;
    this.gridWidth  = this.mod.gridWidth;
    this.gridHeight = this.mod.gridHeight;
    this.gridState  = this.mod.gridState;

    this.zoomAbsoluteFactor = Math.sqrt(Math.sqrt(2));
    this.markSizeRatio = 0.15;
    this.hourglassHeightRatio = 0.6;
    this.actionsPerSecond = 10;

    this.foregroundLeftMarginRatio   = 0.00;
    this.foregroundRightMarginRatio  = 0.00;
    this.foregroundTopMarginRatio    = 0.01;
    this.foregroundBottomMarginRatio = 0.01;

    this.draggable = false;
    this.zoomable  = false;

    this.presetColors = [
      "#000000", "#707070", "#bbbbbb", "#ffffff", "#ffff00", "#fcca43", "#ff7f00", "#ff0000", "#b90303",
      "#965601", "#7f7f00", "#5d935d", "#007f7f", "#7f7fff", "#3ba4f8", "#00ffff", "#7fff7f", "#00ff00",
      "#116d00", "#020b86", "#0000ff", "#ff00ff", "#b32ab2", "#7f007f", "#fc3f88", "#ff7f7f", "#fad099",
    ];

    this.defaultColor = "#f71f3d"; // Saito red
  }

  async render() {
    this.renderForeground();
    this.renderSidebar();
    this.renderPalette();
    this.renderSubmitButton();
    this.attachEventsToForeground();
    this.attachEventsToButtons();
  }

  renderForeground() {
    this.foregroundMaxWidth  = (1 - this.foregroundLeftMarginRatio - this.foregroundRightMarginRatio) * window.innerWidth;
    this.foregroundMaxHeight = (1 - this.foregroundTopMarginRatio - this.foregroundBottomMarginRatio) * window.innerHeight;
    this.foregroundLeftMargin = this.foregroundLeftMarginRatio * window.innerWidth;
    this.foregroundTopMargin  = this.foregroundTopMarginRatio  * window.innerHeight;

    this.foregroundWidth  = Math.min(this.foregroundMaxWidth, this.foregroundMaxHeight * this.gridWidth / this.gridHeight);
    this.foregroundHeight = Math.min(this.foregroundMaxHeight, this.foregroundMaxWidth * this.gridHeight / this.gridWidth);
    this.foregroundLeft = this.foregroundLeftMargin + (this.foregroundMaxWidth  - this.foregroundWidth)  / 2;
    this.foregroundTop  = this.foregroundTopMargin  + (this.foregroundMaxHeight - this.foregroundHeight) / 2;


    this.minScale = this.foregroundWidth / this.gridWidth;
    this.maxScale = Math.ceil(this.minScale);
    this.currentScale = this.minScale;


    this.gridApparentWidth   = this.gridWidth  * this.currentScale;
    this.gridApparentHeight  = this.gridHeight * this.currentScale;
    this.gridRenderingWidth  = this.gridWidth  * this.maxScale;
    this.gridRenderingHeight = this.gridHeight * this.maxScale;

    this.gridApparentLeft = this.foregroundLeft;
    this.gridApparentTop  = this.foregroundTop;
    this.gridRenderingLeft = this.gridApparentLeft - (this.gridRenderingWidth  - this.gridApparentWidth)  / 2;
    this.gridRenderingTop  = this.gridApparentTop  - (this.gridRenderingHeight - this.gridApparentHeight) / 2;



    this.foreground = document.createElement("div");
    this.foreground.id = "foreground";
    this.foreground.style.width  = `${this.gridApparentWidth}px`;
    this.foreground.style.height = `${this.gridApparentHeight}px`;
    this.foreground.style.left = `${this.foregroundLeft}px`;
    this.foreground.style.top  = `${this.foregroundTop}px`;
    document.body.appendChild(this.foreground);

    this.gridContainer = document.createElement("div");
    this.gridContainer.id = "grid-container";
    this.gridContainer.style.width  = `${this.gridRenderingWidth}px`;
    this.gridContainer.style.height = `${this.gridRenderingHeight}px`;
    this.gridContainer.style.left = `${this.gridRenderingLeft - this.foregroundLeft}px`;
    this.gridContainer.style.top  = `${this.gridRenderingTop  - this.foregroundTop}px`;
    this.gridContainer.style.transform = `scale(${this.currentScale / this.maxScale})`;
    this.foreground.appendChild(this.gridContainer);


    this.backgroundLayer = document.createElement("canvas");
    this.backgroundLayer.className = "grid-layer";
    this.backgroundLayer.id = "background-layer";
    this.backgroundLayer.width  = this.gridRenderingWidth;
    this.backgroundLayer.height = this.gridRenderingHeight;
    this.gridContainer.appendChild(this.backgroundLayer);

    this.backgroundLayerCtx = this.backgroundLayer.getContext("2d");
    this.backgroundLayerCtx.imageSmoothingEnabled = false;
    this.backgroundLayerCtx.fillStyle = this.mod.blankTileColor;
    this.backgroundLayerCtx.fillRect(0, 0, this.backgroundLayer.width, this.backgroundLayer.height);


    this.confirmedLayer = document.createElement("canvas");
    this.confirmedLayer.className = "grid-layer";
    this.confirmedLayer.id = "confirmed-layer";
    this.confirmedLayer.width  = this.gridRenderingWidth;
    this.confirmedLayer.height = this.gridRenderingHeight;
    this.gridContainer.appendChild(this.confirmedLayer);

    this.confirmedLayerCtx = this.confirmedLayer.getContext("2d");
    this.confirmedLayerCtx.imageSmoothingEnabled = false;


    this.pendingLayer = document.createElement("canvas");
    this.pendingLayer.className = "grid-layer";
    this.pendingLayer.id = "pending-layer";
    this.pendingLayer.width  = this.gridRenderingWidth;
    this.pendingLayer.height = this.gridRenderingHeight;
    this.gridContainer.appendChild(this.pendingLayer);

    this.pendingLayerCtx = this.pendingLayer.getContext("2d");
    this.pendingLayerCtx.imageSmoothingEnabled = false;


    this.draftedLayer = document.createElement("canvas");
    this.draftedLayer.className = "grid-layer";
    this.draftedLayer.id = "drafted-layer";
    this.draftedLayer.width  = this.gridRenderingWidth;
    this.draftedLayer.height = this.gridRenderingHeight;
    this.gridContainer.appendChild(this.draftedLayer);

    this.draftedLayerCtx = this.draftedLayer.getContext("2d");
    this.draftedLayerCtx.imageSmoothingEnabled = false;


    this.cursorLayer = document.createElement("canvas");
    this.cursorLayer.className = "grid-layer";
    this.cursorLayer.id = "cursor-layer";
    this.cursorLayer.width  = this.gridRenderingWidth;
    this.cursorLayer.height = this.gridRenderingHeight;
    this.gridContainer.appendChild(this.cursorLayer);

    this.cursorLayerCtx = this.cursorLayer.getContext("2d");
    this.cursorLayerCtx.imageSmoothingEnabled = false;
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

  attachEventsToForeground() {
    this.mousePosition = {x: null, y: null, i: null, j: null};
    this.mousedown = false;
    this.lastMousedownButton = null;
    this.lastMousedownInsideGrid = null;

    // `tileHash` to make sure likely adjacent drafted tiles have non-adjacent keys on average
    // to form a well-balanced red-black tree (perhaps not necessary).
    this.draftedTiles = new RBTree((a,b) => { return this.tileHash(a) - this.tileHash(b); });

    this.currentColor = this.defaultColor;

    this.foreground.addEventListener("wheel",       (event) => { this.onWheelOverForeground(event);       });
    this.foreground.addEventListener("mousedown",   (event) => { this.onMousedownOverForeground(event);   });
    this.foreground.addEventListener("mousemove",   (event) => { this.onMousemoveOverForeground(event);   });
    this.foreground.addEventListener("mouseup",     ()      => { this.onMouseupOverForeground();          });
    this.foreground.addEventListener("contextmenu", (event) => { this.onContextMenuOverForeground(event); });
  }

  renderSidebar() {
    this.sidebar = document.createElement("div");
    this.sidebar.id = "sidebar";
    document.body.appendChild(this.sidebar);



    this.undoRedoCategory = document.createElement("div");
    this.undoRedoCategory.className = "button-category";
    this.sidebar.appendChild(this.undoRedoCategory);
    
    this.undoButton = document.createElement("button");
    this.undoButton.title = "Undo";
    this.undoButton.disabled = true;
    this.undoRedoCategory.appendChild(this.undoButton);
    this.undoIcon = document.createElement("i");
    this.undoIcon.className = "fas fa-undo-alt";
    this.undoButton.appendChild(this.undoIcon);

    this.redoButton = document.createElement("button");
    this.redoButton.title = "Undo";
    this.redoButton.disabled = true;
    this.undoRedoCategory.appendChild(this.redoButton);
    this.redoIcon = document.createElement("i");
    this.redoIcon.className = "fas fa-redo-alt";
    this.redoButton.appendChild(this.redoIcon);


    this.colorCategory = document.createElement("div");
    this.colorCategory.className = "button-category";
    this.sidebar.appendChild(this.colorCategory);

    this.colorPreview = document.createElement("div");
    this.colorPreview.id = "color-preview";
    this.colorPreview.style.backgroundColor = this.defaultColor;
    this.colorCategory.append(this.colorPreview);


    this.clearCategory = document.createElement("div");
    this.clearCategory.className = "button-category";
    this.sidebar.appendChild(this.clearCategory);

    this.clearDraftButton = document.createElement("button");
    this.clearDraftButton.title = "Clear Draft";
    this.clearDraftButton.disabled = true;
    this.clearCategory.appendChild(this.clearDraftButton);
    this.clearDraftIcon = document.createElement("i");
    this.clearDraftIcon.className = "fas fa-trash-alt";
    this.clearDraftButton.appendChild(this.clearDraftIcon);
  }

  renderPalette() {
    this.palette = document.createElement("div");
    this.palette.id = "palette";
    this.palette.style.display = "flex";
    document.body.appendChild(this.palette);

    for (const color of this.presetColors) {
      const presetColorOption = document.createElement("div");
      presetColorOption.className = "color-option preset-color-option";
      presetColorOption.style.backgroundColor = color;
      this.palette.appendChild(presetColorOption);

      presetColorOption.onclick = () => {
        this.setCurrentColor(color);
      };
    }

    this.colorPicker = document.createElement("div");
    this.colorPicker.className = "color-option";
    this.colorPicker.id = "color-picker";
    this.palette.appendChild(this.colorPicker);

    this.colorPickerIcon = document.createElement("i");
    this.colorPickerIcon.className = "fas fa-plus";
    this.colorPicker.appendChild(this.colorPickerIcon);

    this.colorPickerInput = document.createElement("input");
    this.colorPickerInput.type = "color";
    this.colorPickerInput.hidden = true;
    this.colorPicker.appendChild(this.colorPickerInput);

    
    this.colorPicker.addEventListener("mouseup", (event) => {
      event.stopPropagation();
      this.colorPickerInput.click();
    });

    this.colorPickerInput.onchange = () => {
      this.setCurrentColor(this.colorPickerInput.value);
    }
  }

  renderSubmitButton() {
    this.submitButton = document.createElement("button");
    this.submitButton.id = "submit-button";
    this.submitButton.title = "Submit Draft";
    document.body.appendChild(this.submitButton);
    this.submitIcon = document.createElement("i");
    this.submitIcon.className = "fas fa-check";
    this.submitButton.appendChild(this.submitIcon);

    this.submitButton.style.left = `${this.foregroundLeft + this.foregroundWidth}px`;
    const submitButtonHeight = window.getComputedStyle(this.submitButton).height;
    this.submitButton.style.top = `calc(${this.foregroundTop + this.foregroundHeight}px - ${submitButtonHeight})`;
    this.submitButton.style.visibility = "hidden";
  }

  attachEventsToButtons() {
    this.attachEventsToUndoButton();
    this.attachEventsToRedoButton();
    this.colorPreview.addEventListener("mouseup", () => { this.onMouseupOverColorPreview(); });
    this.clearDraftButton.addEventListener("mouseup", () => { this.onMouseupOverClearDraftButton(); });

    this.submitButton.addEventListener("mouseup", () => { this.onMouseupOverSubmitButton(); });
  }

  attachEventsToUndoButton() {
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

  attachEventsToRedoButton() {
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

  insertToDraftedTiles(tile) {
    if (this.draftedTiles.size === 0) {
      this.clearDraftButton.disabled = false;
      this.submitButton.style.visibility = "visible";
    }
    this.draftedTiles.insert(tile);
  }

  removeFromDraftedTiles(tile) {
    this.draftedTiles.remove(tile);
    if (this.draftedTiles.size === 0) {
      this.clearDraftButton.disabled = true;
      this.submitButton.style.visibility = "hidden";
    }
  }

  clearDraftedTiles() {
    this.draftedTiles.clear();
    this.clearDraftButton.disabled = true;
    this.submitButton.style.visibility = "hidden";
  }

  stackPush(stack, action) {
    if (stack.length === 0) {
      if      (stack === this.undoStack) { this.undoButton.disabled = false; }
      else if (stack === this.redoStack) { this.redoButton.disabled = false; }
    }
    stack.push(action);
  }

  stackPop(stack) {
    const action = stack.pop();
    if (stack.length === 0) {
      if      (stack === this.undoStack) { this.undoButton.disabled = true; }
      else if (stack === this.redoStack) { this.redoButton.disabled = true; }
    }
    return action;
  }

  clearStack(stack) {
    if      (stack === this.undoStack) { this.undoStack = []; this.undoButton.disabled = true; }
    else if (stack === this.redoStack) { this.redoStack = []; this.redoButton.disabled = true; }
  }

  setCurrentColor(color) {
    this.currentColor = color;
    this.colorPreview.style.backgroundColor = color;
  }

  setScale(zoomFactor) {
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

  setTilesRendering(locatedStateArray) {
    for (const locatedState of locatedStateArray) {
      this.setTileRendering(locatedState);
    }
  }

  setTileRendering(newLocatedState) {
    const {i, j, state} = newLocatedState;

    if (state.drafted) {
      this.drawTile(this.draftedLayerCtx, i, j, state.drafted.color);
      this.drawDraftMark(i, j, state.drafted.color);
    } else {
      this.drawTile(this.draftedLayerCtx, i, j, null);
    }

    if (state.pending) {
      this.drawTile(this.pendingLayerCtx, i, j, state.pending.color);
    } else {
      this.drawTile(this.pendingLayerCtx, i, j, null);
    }

    if (state.confirmed) {
      this.drawTile(this.confirmedLayerCtx, i, j, state.confirmed.color);
    } else {
      this.drawTile(this.confirmedLayerCtx, i, j, null);
    }
  }

  updateMousePosition(event, i, j) {
    if (this.isInsideGrid(this.mousePosition)) {
      this.drawTile(this.cursorLayerCtx, this.mousePosition.i, this.mousePosition.j, null);
    }
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
    if (this.isInsideGrid(this.mousePosition)) {
      this.mousePosition.i = i;
      this.mousePosition.j = j;
      this.drawTile(this.cursorLayerCtx, this.mousePosition.i, this.mousePosition.j, this.currentColor);
    } else {
      this.mousePosition.i = null;
      this.mousePosition.j = null;
    }
  }

  drawTile(ctx, i, j, color) {
    ctx.clearRect(i * this.maxScale, j * this.maxScale, this.maxScale, this.maxScale);
    if (color !== null) {
      ctx.fillStyle = color;
      ctx.fillRect(i * this.maxScale, j * this.maxScale, this.maxScale, this.maxScale);
    }
  }

  onWheelOverForeground(event) {
    if (this.zoomable) {
      event.preventDefault();
      const zoomFactor = this.setScale(
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

  onMouseupOverColorPreview() {
    this.palette.style.display = (this.palette.style.display === "none" ? "flex" : "none");
  }

  onMouseupOverClearDraftButton() {
    this.clearDraft();
  }

  onMouseupOverSubmitButton() {
    if (this.draftedTiles.size !== 0) {
      const tilesToSend = [];
      const it = this.draftedTiles.iterator(); let draftedTile;
      while ((draftedTile = it.next()) !== null) {
        tilesToSend.push(draftedTile);
      }
      this.mod.sendPaintingTransaction(tilesToSend).then((ordinal) => {
        for (const tile of tilesToSend) {
          this.mod.setTile(tile, "pending", ordinal);
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
    const lastAction = this.stackPop(this.undoStack);
    this.stackPush(this.redoStack, lastAction);
    const reversedLastActionType = this.actionType(this.reversedAction(lastAction));
    const tile = {i: lastAction.i, j: lastAction.j};
    if (reversedLastActionType === "undraft" || reversedLastActionType === "redraft") {
      this.removeFromDraftedTiles(tile);
    }
    if (reversedLastActionType === "draft"   || reversedLastActionType === "redraft") {
      tile.color = lastAction.oldDraftColor;
      this.insertToDraftedTiles(tile);
    } else {
      tile.color = null;
    }
    this.mod.setTile(tile, "drafted");
  }

  redo() {
    const lastUndoneAction = this.stackPop(this.redoStack);
    this.stackPush(this.undoStack, lastUndoneAction);
    const lastUndoneActionType = this.actionType(lastUndoneAction);
    const tile = {i: lastUndoneAction.i, j: lastUndoneAction.j};
    if (lastUndoneActionType === "undraft" || lastUndoneActionType === "redraft") {
      this.removeFromDraftedTiles(tile);
    }
    if (lastUndoneActionType === "draft"   || lastUndoneActionType === "redraft") {
      tile.color = lastUndoneAction.newDraftColor;
      this.insertToDraftedTiles(tile);
    } else {
      tile.color = null;
    }
    this.mod.setTile(tile, "drafted");
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
      this.mod.setTile({i: draftedTile.i, j: draftedTile.j, color: null}, "drafted");
    }
    this.clearDraftedTiles();
    this.clearStack(this.undoStack);
    this.clearStack(this.redoStack);
  }

  tryAndDraftTile(i, j) {
    const alreadyDraftedTile = this.draftedTiles.find({i: i, j: j});
    if (alreadyDraftedTile === null) {
      this.draftTile(i, j, null, this.currentColor);
    } else {
      if (this.currentColor !== alreadyDraftedTile.color) {
        this.removeFromDraftedTiles(alreadyDraftedTile);
        this.draftTile(i, j, alreadyDraftedTile.color, this.currentColor);
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
    this.stackPush(this.undoStack, {i: i, j: j, oldDraftColor: oldDraftColor, newDraftColor: newDraftColor});
    this.clearStack(this.redoStack);
    const draftTile = {i: i, j: j, color: newDraftColor};
    this.insertToDraftedTiles(draftTile);
    this.mod.setTile(draftTile, "drafted");
  }

  undraftTile(i, j, oldDraftColor) {
    this.stackPush(this.undoStack, {i: i, j: j, oldDraftColor: oldDraftColor, newDraftColor: null});
    this.clearStack(this.redoStack);
    this.removeFromDraftedTiles({i: i, j: j});
    this.mod.setTile({i: i, j: j, color: null}, "drafted");
  }

  drawDraftMark(i, j, tileColor) {
    this.draftedLayerCtx.fillStyle = this.markColor(tileColor);
    this.draftedLayerCtx.fillRect(
      (i + 0.5 - this.markSizeRatio / 2) * this.maxScale,
      (j + 0.5 - this.markSizeRatio / 2) * this.maxScale,
      this.markSizeRatio * this.maxScale,
      this.markSizeRatio * this.maxScale
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

  tileHash(tile) {
    const id = tile.i * this.gridHeight + tile.j;
    return parseInt(createHash("md5").update(id.toString()).digest("hex"), 16) % (10 ** 15);
  }
}

module.exports = GraffitiUI;