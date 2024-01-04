class GridState {
  constructor(mod) {
    this.mod = mod;

    this.gridWidth  = this.mod.gridWidth;
    this.gridHeight = this.mod.gridHeight;
    this.state = new Array(this.gridWidth);
    for (let i = 0; i < this.gridWidth; i++) {
      this.state[i] = new Array(this.gridHeight);
      for (let j = 0; j < this.gridHeight; j++) {
        this.state[i][j] = {confirmed: null, pending: null, drafted: null};
      }
    }
  }

  prettyPrint() {
    const nbColorCharacters = 7;
    const nbOrdinalDigitsToPrint = 8;

    const statusHeaderLength = 2;
    const cellWidth = 1 + statusHeaderLength + 1 + nbColorCharacters + 1 + nbOrdinalDigitsToPrint + 1;
    const cellHorizontalBorder = "-".repeat(cellWidth);
    const gridHorizontalBorder = new Array(this.gridWidth + 1).fill("+").join(cellHorizontalBorder);

    const alignedText = (text, alignementType, width) => {
      const leftRightPaddingLength = width - text.length;
      const leftPaddingLength  = Math.floor(leftRightPaddingLength / 2);
      const rightPaddingLength = leftRightPaddingLength - leftPaddingLength;
      const leftPaddingSpaces  = " ".repeat(leftPaddingLength);
      const rightPaddingSpaces = " ".repeat(rightPaddingLength);
      switch (alignementType) {
        case "centered":
          return leftPaddingSpaces + text + rightPaddingSpaces;
        case "left":
          return text + leftPaddingSpaces + rightPaddingSpaces;
        case "right":
          return leftPaddingSpaces + rightPaddingSpaces + text;
      }
    }

    const colorName = (color) => {
      const names = {
        "#ff7800": "orange",
        "#000000": "black",
        "#e01b24": "red",
        "#ffffff": "white",
      }
      if (names[color] !== undefined) {
        return names[color];
      } else {
        return color;
      }
    }

    const ordinalToPrintedString = (ordinal) => {
      if (ordinal !== null) {
        return ordinal.toString().slice(
          - (nbOrdinalDigitsToPrint + 3 + this.mod.txOrderPrecision),
          - (                         3 + this.mod.txOrderPrecision)
        );
      } else {
        return alignedText("null", "centered", nbOrdinalDigitsToPrint);
      }
    }

    for (let j = 0; j < this.gridHeight; j++) {
      console.log(gridHorizontalBorder);
      for (const status of ["confirmed", "pending", "drafted"]) {
        const statusHeader = status[0] + ":";
        let line = "|";
        for (let i = 0; i < this.gridWidth; i++) {
          line += " " + statusHeader;
          if (this.state[i][j][status] !== null) {
            line += " " + alignedText(colorName(this.state[i][j][status].color), "left", nbColorCharacters)
                  + " " + ordinalToPrintedString(this.state[i][j][status].ordinal)
                  + " ";
          } else {
            line += alignedText("null", "centered", cellWidth - (statusHeaderLength + 1));
          }
          line += "|";
        }
        console.log(line);
      }
    }
    console.log(gridHorizontalBorder);
    console.log(" ");
    console.log(" ");
  }

  getTileColor(i, j) {
    if (this.state[i][j].confirmed !== null) {
      return this.state[i][j].confirmed.color;
    } else {
      return null;
    }
  }

  updateTile(tile, tileStatus, ordinal=null) {
    console.assert(tile !== null);
    const i = tile.i;
    const j = tile.j;
    switch (tileStatus) {
      case "confirmed":
        console.assert(ordinal !== null);
        console.assert(tile.color !== null);
        if (this.state[i][j].confirmed === null) {
          this.state[i][j].confirmed = {color: tile.color, ordinal: ordinal};
        } else {
          if (ordinal > this.state[i][j].confirmed.ordinal) {
            this.state[i][j].confirmed.color   = tile.color;
            this.state[i][j].confirmed.ordinal = ordinal;
          }
        }
        if (this.state[i][j].pending !== null) {
          if (ordinal >= this.state[i][j].pending.ordinal) {
            this.state[i][j].pending = null;
          }
        }
        break;
      case "pending":
        console.assert(ordinal !== null);
        console.assert(tile.color !== null);
        if (this.state[i][j].confirmed === null || ordinal > this.state[i][j].confirmed.ordinal) {
          if (this.state[i][j].pending === null) {
            this.state[i][j].pending = {color: tile.color, ordinal: ordinal};
          } else {
            if (ordinal > this.state[i][j].pending.ordinal) {
              this.state[i][j].pending.color   = tile.color;
              this.state[i][j].pending.ordinal = ordinal;
            }
          }
        }
        break;
      case "drafted":
        console.assert(ordinal === null);
        if (this.state[i][j].drafted === null && tile.color === null) {
          // nothing
        } else if (this.state[i][j].drafted === null && tile.color !== null) {
          this.state[i][j].drafted = {color: tile.color, ordinal: null};
        } else if (this.state[i][j].drafted !== null && tile.color === null) {
          this.state[i][j].drafted = null;
        } else if (this.state[i][j].drafted !== null && tile.color !== null) {
          this.state[i][j].drafted.color = tile.color;
        }
        break;
      default:
        console.error("Unexpected tile status: " + tileStatus);
    }
    return {i: i, j: j, state: this.state[i][j]};
  }
}

module.exports = GridState;