class BoardState {
  constructor(mod) {
    this.mod = mod;

    this.boardWidth  = this.mod.boardWidth;
    this.boardHeight = this.mod.boardHeight;

    this.tileStateGrid = this.mod.newGrid((i, j) => ({confirmed: null, pending: null}));
  }

  prettyPrint(nbColumns, nbRows) {
    const nbHexaColorCharacters = 9;
    const nbOrdinalDigitsToPrint = 8;

    const statusHeaderLength = 2;
    const cellWidth = 1 + statusHeaderLength + 1 + nbHexaColorCharacters + 1 + nbOrdinalDigitsToPrint + 1;
    const cellHorizontalBorder = "-".repeat(cellWidth);
    const gridHorizontalBorder = new Array(nbColumns + 1).fill("+").join(cellHorizontalBorder);

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
    };

    const nameFromRgbaColor = (rgbaColor) => {
      const names = Object.fromEntries(
        [
          [  0,   0,   0, "black" ],
          [224,  27,  36, "red"   ],
          [255, 120,   0, "orange"],
          [255, 255, 255, "white" ],
        ].map(([r, g, b, name]) => [`${r} ${g} ${b}`, name])
      );
      return names[`${rgbaColor.red} ${rgbaColor.green} ${rgbaColor.blue}`] ?? "unnamed";
    };


    const printedStringFromOrdinal = (ordinal) => {
      if (ordinal !== null) {
        return ordinal.toString().slice(
            - (nbOrdinalDigitsToPrint + 3 + this.mod.txOrderPrecision),
            - (                         3 + this.mod.txOrderPrecision)
        );
      } else {
        return alignedText("null", "centered", nbOrdinalDigitsToPrint);
      }
    };

    for (let j = 0; j < nbRows; j++) {
      console.log(gridHorizontalBorder);
      for (const status of ["confirmed", "pending"]) {
        const statusHeader = status[0] + ":";
        let line = "|";
        for (let i = 0; i < nbColumns; i++) {
          line += " " + statusHeader;
          if (this.state[i][j][status] !== null) {
            line += " " + alignedText(nameFromRgbaColor(this.tileStateGrid[i][j][status].rgbaColor), "left", nbHexaColorCharacters)
                  + " " + printedStringFromOrdinal(this.tileStateGrid[i][j][status].ordinal)
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

  getTileRgbaColor(i, j, status="confirmed") {
    return this.tileStateGrid[i][j][status]?.rgbaColor ?? null;
  }

  getTileOrdinal(i, j, status="confirmed") {
    return this.tileStateGrid[i][j][status]?.ordinal ?? null;
  }

  getConfirmedBoard(width=undefined, height=undefined) {
    return this.mod.newGrid((i, j) => this.tileStateGrid[i][j].confirmed, width, height);
  }

  setTiles(tileArray, ordinal=undefined) {
    if (ordinal !== undefined) {
      for (const tile of tileArray) {
        tile.ordinal = ordinal;
      }
    }

    const effectiveTileArray = [];
    for (const tile of tileArray) {
      if (!this.mod.isValidOrdinal(tile.ordinal)) {
        console.error("Invalid ordinal:", tile.ordinal);
        console.trace();
      } else {
        const effectiveTile = this.setTile(tile, "confirmed");
        effectiveTileArray.push(effectiveTile);
      }
    }

    return effectiveTileArray;
  }

  setTile(tile, status, ordinal=undefined) {
    const {i, j, rgbaColor} = tile;
    if (ordinal === undefined) {
      ordinal = tile.ordinal;
    }
    
    switch (status) {
      case "confirmed":
        if (this.tileStateGrid[i][j].confirmed === null) {
          this.tileStateGrid[i][j].confirmed = {rgbaColor, ordinal};
        } else {
          if (ordinal > this.tileStateGrid[i][j].confirmed.ordinal) {
            this.tileStateGrid[i][j].confirmed.rgbaColor = this.mod.roundedMixedRgbaColor(
              this.tileStateGrid[i][j].confirmed.rgbaColor,
              rgbaColor
            );
            this.tileStateGrid[i][j].confirmed.ordinal = ordinal;
          }
        }
        if (this.tileStateGrid[i][j].pending !== null) {
          if (ordinal >= this.tileStateGrid[i][j].pending.ordinal) {
            this.tileStateGrid[i][j].pending = null;
          }
        }
        break;
      case "pending":
        if (this.tileStateGrid[i][j].confirmed === null || ordinal > this.tileStateGrid[i][j].confirmed.ordinal) {
          if (this.tileStateGrid[i][j].pending === null) {
            this.tileStateGrid[i][j].pending = {rgbaColor, ordinal};
          } else {
            if (ordinal > this.tileStateGrid[i][j].pending.ordinal) {
              this.tileStateGrid[i][j].pending.rgbaColor = this.mod.roundedMixedRgbaColor(
                this.tileStateGrid[i][j].pending.rgbaColor,
                rgbaColor
              );
              this.tileStateGrid[i][j].pending.ordinal = ordinal;
            }
          }
        }
        break;
      default:
        console.error("Unexpected status: " + status);
    }

    return {
      i: i, j: j,
      rgbaColor: this.getTileRgbaColor(i, j, status),
      pendingExists: this.tileStateGrid[i][j].pending !== null,
      ordinal: ordinal
    };
  }
}

export default BoardState;