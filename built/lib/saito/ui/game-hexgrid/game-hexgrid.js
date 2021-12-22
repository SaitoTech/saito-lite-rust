var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var GameHexGridTemplate = require('./game-hexgrid.template');
var GameHexGrid = /** @class */ (function () {
    function GameHexGrid(app, data) {
        if (data === void 0) { data = null; }
        this.app = app;
        if (data) {
            this.height = data.height;
            this.width = data.width;
            this.hexmode = data.hexmode;
        }
        else {
            this.height = 5;
            this.width = 5;
            this.hexmode = [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0];
            this.hexes = ['1_1', '1_2', '1_3', '2_1', '2_2', '2_3', '2_4', '3_1', '3_2', '3_3', '3_4', '3_5', '4_2', '4_3', '4_4', '4_5', '5_3', '5_4', '5_5'];
        }
        /*
          Index as follows:
                  (1,1) (1,2) (1,3)
                (2,1) (2,2) (2,3) (2,4)
            (3,1) (3,2) (3,3) (3,4) (3,5)
                (4,2) (4,3) (4,4) (4,5)
                  (5,3) (5,4) (5,5)
            This way neighboring hexes differ by +/- r, +/-c, or +/- r&c

            Vertices:        Edges:
                 1           6    1
              6    2        5      2
              5    3         4    3
                 4

          Vertices and edges are not duplicated.
          3_1_1 and 6_2_2 are the same edge, but we only reference 3_1_1
          4_1_1, 2_2_1, and 6_2_2 are the same vertex, but 6_2_2 is the top reference
          Assigning vertices and edges moves left to right, top down.
          Every hexagon has visible vertices 6 and 1 and visible edges 5, 6, 1
          
          Vertex: 6 > 2 > 4
                  1 > 5 > 3

        */
    }
    GameHexGrid.prototype.render = function (app, mod) {
        if (!document.querySelector(".game-hexgrid-container")) {
            app.browser.addElementToDom(GameHexGridTemplate(this.height, this.width, this.hexmode));
        }
    };
    GameHexGrid.prototype.attachEvents = function (app, game_mod) {
    };
    GameHexGrid.prototype.addToEdge = function (hexid, elementHtml) {
    };
    GameHexGrid.prototype.addToCorner = function (hexid, elementHtml) {
    };
    /*
      hexid is a string of the pattern X_Y_Z
      X is the verteX number, Y row, Z column
    */
    //Returns a list of edge ids adjacent to the vertex id
    GameHexGrid.prototype.edgesFromVertex = function (hexid) {
        var coord = hexid.split("_");
        var vid = parseInt(coord[0]);
        var rid = parseInt(coord[1]);
        var cid = parseInt(coord[2]);
        var edges = [];
        switch (vid) {
            case 1:
                edges.push(this.verifyEdge(1, rid, cid), this.verifyEdge(6, rid, cid), this.verifyEdge(2, rid - 1, cid - 1));
                break;
            case 2:
                edges.push(this.verifyEdge(1, rid, cid), this.verifyEdge(2, rid, cid), this.verifyEdge(3, rid - 1, cid));
                break;
            case 3:
                edges.push(this.verifyEdge(2, rid, cid), this.verifyEdge(3, rid, cid), this.verifyEdge(4, rid, cid + 1));
                break;
            case 4:
                edges.push(this.verifyEdge(3, rid, cid), this.verifyEdge(4, rid, cid), this.verifyEdge(2, rid + 1, cid));
                break;
            case 5:
                edges.push(this.verifyEdge(4, rid, cid), this.verifyEdge(5, rid, cid), this.verifyEdge(3, rid, cid - 1));
                break;
            case 6:
                edges.push(this.verifyEdge(5, rid, cid), this.verifyEdge(6, rid, cid), this.verifyEdge(4, rid - 1, cid - 1));
                break;
        }
        return edges.filter(function (edge) { return edge; });
    };
    GameHexGrid.prototype.verifyEdge = function (eid, r, c) {
        //Check if there is a neighboring hexagon that would be the right name
        switch (eid) {
            case 2:
                if (this.exists(r, c + 1))
                    return "5_".concat(r, "_").concat(c + 1);
                break;
            case 3:
                if (this.exists(r + 1, c + 1))
                    return "6_".concat(r + 1, "_").concat(c + 1);
                break;
            case 4:
                if (this.exists(r + 1, c))
                    return "1_".concat(r + 1, "_").concat(c);
                break;
            default: /*edges 5,6,1 are the default acceptable nomenclature*/
        }
        if (!this.exists(r, c))
            return false;
        return eid + "_" + r + "_" + c;
    };
    GameHexGrid.prototype.verticesFromEdge = function (hexid) {
        var coord = hexid.split("_");
        var eid = parseInt(coord[0]);
        var rid = parseInt(coord[1]);
        var cid = parseInt(coord[2]);
        var vertices = [];
        vertices.push(this.verifyVertex(eid, rid, cid));
        vertices.push(this.verifyVertex(eid + 1, rid, cid));
        return vertices.filter(function (vertex) { return vertex; }); //Does it need a filter?
    };
    /*
     Imposes a directionality on the edges to return only one of the connecting vertices
    */
    GameHexGrid.prototype.directedEdge = function (hexid1, hexid2) {
        var e_1, _a;
        if (hexid2 === void 0) { hexid2 = null; }
        var coord = hexid1.split("_");
        var eid = parseInt(coord[0]);
        var rid = parseInt(coord[1]);
        var cid = parseInt(coord[2]);
        if (hexid2 == null)
            return this.verifyVertex(eid, rid, cid);
        //Otherwise
        var v1 = this.verticesFromEdge(hexid1);
        var v2 = this.verticesFromEdge(hexid2);
        try {
            for (var v2_1 = __values(v2), v2_1_1 = v2_1.next(); !v2_1_1.done; v2_1_1 = v2_1.next()) {
                var vertex = v2_1_1.value;
                if (!v1.includes(vertex))
                    return vertex;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (v2_1_1 && !v2_1_1.done && (_a = v2_1.return)) _a.call(v2_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    GameHexGrid.prototype.verifyVertex = function (vid, r, c) {
        if (vid > 6) {
            vid -= 6;
        }
        switch (vid) {
            case 2:
                if (this.exists(r, c + 1))
                    return "6_".concat(r, "_").concat(c + 1);
                break;
            case 4:
                if (this.exists(r + 1, c + 1))
                    return "6_".concat(r + 1, "_").concat(c + 1);
                if (this.exists(r + 1, c))
                    return "2_".concat(r, "_").concat(c + 1);
                break;
            case 5:
                if (this.exists(r + 1, c))
                    return "1_".concat(r + 1, "_").concat(c);
                break;
            case 3:
                if (this.exists(r + 1, c + 1))
                    return "1_".concat(r + 1, "_").concat(c + 1);
                if (this.exists(r, c + 1))
                    return "5_".concat(r, "_").concat(c + 1);
                break;
        }
        return vid + "_" + r + "_" + c;
    };
    GameHexGrid.prototype.adjacentEdges = function (eid) {
        var e_2, _a, e_3, _b;
        var edges = [];
        try {
            for (var _c = __values(this.verticesFromEdge(eid)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var vertex = _d.value;
                try {
                    for (var _e = (e_3 = void 0, __values(this.edgesFromVertex(vertex))), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var edge = _f.value;
                        if (edge != eid)
                            edges.push(edge);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return edges;
    };
    GameHexGrid.prototype.adjacentVertices = function (vid) {
        var e_4, _a, e_5, _b;
        var vertices = [];
        try {
            for (var _c = __values(this.edgesFromVertex(vid)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var edge = _d.value;
                try {
                    for (var _e = (e_5 = void 0, __values(this.verticesFromEdge(edge))), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var vertex = _f.value;
                        if (vertex != vid)
                            vertices.push(vertex);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return vertices;
    };
    GameHexGrid.prototype.exists = function (r, c) {
        return this.hexes.includes(r + "_" + c);
    };
    GameHexGrid.prototype.hexesFromVertex = function (hexid) {
        var coord = hexid.split("_");
        var vid = parseInt(coord[0]);
        var r = parseInt(coord[1]);
        var c = parseInt(coord[2]);
        var hexes = [r + "_" + c];
        switch (vid) {
            case 1:
                if (this.exists(r - 1, c - 1))
                    hexes.push("".concat(r - 1, "_").concat(c - 1));
                if (this.exists(r - 1, c))
                    hexes.push("".concat(r - 1, "_").concat(c));
                break;
            case 2:
                if (this.exists(r - 1, c))
                    hexes.push("".concat(r - 1, "_").concat(c));
                if (this.exists(r, c + 1))
                    hexes.push("".concat(r, "_").concat(c + 1));
                break;
            case 3:
                if (this.exists(r, c + 1))
                    hexes.push("".concat(r, "_").concat(c + 1));
                if (this.exists(r + 1, c + 1))
                    hexes.push("".concat(r + 1, "_").concat(c + 1));
                break;
            case 4:
                if (this.exists(r + 1, c + 1))
                    hexes.push("".concat(r + 1, "_").concat(c + 1));
                if (this.exists(r + 1, c))
                    hexes.push("".concat(r + 1, "_").concat(c));
                break;
            case 5:
                if (this.exists(r + 1, c))
                    hexes.push("".concat(r + 1, "_").concat(c));
                if (this.exists(r, c - 1))
                    hexes.push("".concat(r, "_").concat(c - 1));
                break;
            case 6:
                if (this.exists(r, c - 1))
                    hexes.push("".concat(r, "_").concat(c - 1));
                if (this.exists(r - 1, c - 1))
                    hexes.push("".concat(r - 1, "_").concat(c - 1));
                break;
        }
        return hexes;
    };
    return GameHexGrid;
}());
module.exports = GameHexGrid;
//# sourceMappingURL=game-hexgrid.js.map