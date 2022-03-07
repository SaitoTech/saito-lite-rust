const GameHexGridTemplate = require("./game-hexgrid.template");

/**
 *   A Utility for making a hexagon game board, it is up to the game module to handle
 *   the logic of associating pieces with vertices or edges of hexes,
 *   but this tool facilitates the indexing system
 *
 *   Individual hexes are indexed as follows:
 *                 (1,1) (1,2) (1,3)
 *               (2,1) (2,2) (2,3) (2,4)
 *           (3,1) (3,2) (3,3) (3,4) (3,5)
 *               (4,2) (4,3) (4,4) (4,5)
 *                 (5,3) (5,4) (5,5)
 *   This way neighboring hexes differ by +/- r, +/-c, or +/- r&c
 *   Each hex has six vertices and six edges, indexed as follows:
 *           Vertices:        Edges:
 *               1            6    1
 *             6    2        5      2
 *             5    3         4    3
 *               4
 *
 *  Vertices and edges are not duplicated. 3_1_1 and 6_2_2 are the same edge, but we only store 3_1_1.
 *  GameHexGrid includes functions to resolve the indexing system.
 *  4_1_1, 2_2_1, and 6_2_2 are the same vertex, but 6_2_2 is the top reference
 *  Assigning vertices and edges moves left to right, top down.
 *  Every hexagon has visible vertices 6 and 1 and visible edges 5, 6, 1
 *         Vertex: 6 > 2 > 4
 *                 1 > 5 > 3
 **/
class GameHexGrid {
  constructor(app, data = null) {
    this.app = app;
    if (data) {
      this.height = data.height;
      this.width = data.width;
      this.hexmode = data.hexmode;
    } else {
      this.height = 5;
      this.width = 5;
      this.hexmode = [
        0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0,
      ]; //Defines hexagonal shape, 0s are empty placeholders to make things align properly
      this.hexes = [
        "1_1",
        "1_2",
        "1_3",
        "2_1",
        "2_2",
        "2_3",
        "2_4",
        "3_1",
        "3_2",
        "3_3",
        "3_4",
        "3_5",
        "4_2",
        "4_3",
        "4_4",
        "4_5",
        "5_3",
        "5_4",
        "5_5",
      ];
    }
  }

  /**
   * Add hexGrid to DOM
   * @param app - Saito application
   * @param mod - game module
   */
  render(app, mod) {
    if (!document.querySelector("#game-hexgrid")) {
      app.browser.addElementToDom(
        GameHexGridTemplate(this.height, this.width, this.hexmode)
      );
    }
  }

  /**
   * No DOM-level functionality attached to hexGrid.
   * Included for consistency with other UI tools.
   * @param app - Saito application
   * @param mod - game module
   */
  attachEvents(app, mod) {
    return;
  }

  /**
   *  Returns a list of edge ids adjacent to the given vertex id
   *   @param hexid is a string of the pattern X_Y_Z where X is the vertex number, Y row, Z column
   */
  edgesFromVertex(hexid) {
    let coord = hexid.split("_");
    let vid = parseInt(coord[0]);
    let rid = parseInt(coord[1]);
    let cid = parseInt(coord[2]);
    let edges = [];
    switch (vid) {
      case 1:
        edges.push(
          this.verifyEdge(1, rid, cid),
          this.verifyEdge(6, rid, cid),
          this.verifyEdge(2, rid - 1, cid - 1)
        );
        break;
      case 2:
        edges.push(
          this.verifyEdge(1, rid, cid),
          this.verifyEdge(2, rid, cid),
          this.verifyEdge(3, rid - 1, cid)
        );
        break;
      case 3:
        edges.push(
          this.verifyEdge(2, rid, cid),
          this.verifyEdge(3, rid, cid),
          this.verifyEdge(4, rid, cid + 1)
        );
        break;
      case 4:
        edges.push(
          this.verifyEdge(3, rid, cid),
          this.verifyEdge(4, rid, cid),
          this.verifyEdge(2, rid + 1, cid)
        );
        break;
      case 5:
        edges.push(
          this.verifyEdge(4, rid, cid),
          this.verifyEdge(5, rid, cid),
          this.verifyEdge(3, rid, cid - 1)
        );
        break;
      case 6:
        edges.push(
          this.verifyEdge(5, rid, cid),
          this.verifyEdge(6, rid, cid),
          this.verifyEdge(4, rid - 1, cid - 1)
        );
        break;
    }

    return edges.filter((edge) => edge);
  }

  /**
   * Returns properly formatted index for a particular edge in the hexGrid
   * @param eid - edge number
   * @param r - row of hex
   * @param c - column of hex
   */
  verifyEdge(eid, r, c) {
    //Check if there is a neighboring hexagon that would be the right name
    switch (eid) {
      case 2:
        if (this.exists(r, c + 1)) return `5_${r}_${c + 1}`;
        break;
      case 3:
        if (this.exists(r + 1, c + 1)) return `6_${r + 1}_${c + 1}`;
        break;
      case 4:
        if (this.exists(r + 1, c)) return `1_${r + 1}_${c}`;
        break;
      default: /*edges 5,6,1 are the default acceptable nomenclature*/
    }
    if (!this.exists(r, c)) return false;
    return eid + "_" + r + "_" + c;
  }

  /**
   *  Returns a list of vertex ids adjacent to the given edge
   *   @param hexid is a string of the pattern X_Y_Z where X is the edge number, Y row, Z column
   */
  verticesFromEdge(hexid) {
    let coord = hexid.split("_");
    let eid = parseInt(coord[0]);
    let rid = parseInt(coord[1]);
    let cid = parseInt(coord[2]);
    let vertices = [];
    vertices.push(this.verifyVertex(eid, rid, cid));
    vertices.push(this.verifyVertex(eid + 1, rid, cid));
    return vertices.filter((vertex) => vertex); //Does it need a filter?
  }

  /**
   * Treats all edges as having a direction to provide a singular vertex adjacent to any given edge
   * and finds the vertex of hexid2 (an edge) that is not shared by hexid1 (also an edge)
   * @param hexid1 -- full edge index (edge_row_column)
   * @param hexid2 -- full edge index (edge_row_column) 
   *
   */
  directedEdge(hexid1, hexid2 = null) {
    let coord = hexid1.split("_");
    let eid = parseInt(coord[0]);
    let rid = parseInt(coord[1]);
    let cid = parseInt(coord[2]);

    if (hexid2 === null) return this.verifyVertex(eid, rid, cid); //Don't remember why I wanted this

    //Otherwise
    let v1 = this.verticesFromEdge(hexid1);
    let v2 = this.verticesFromEdge(hexid2);
    for (let vertex of v2) if (!v1.includes(vertex)) return vertex;
  }

   /**
   * Returns properly formatted index for a particular vertex in the hexGrid
   * @param vid - vertex number
   * @param r - row of hex
   * @param c - column of hex
   */
  verifyVertex(vid, r, c) {
    if (vid > 6) {
      vid -= 6;
    }
    switch (vid) {
      case 2:
        if (this.exists(r, c + 1)) return `6_${r}_${c + 1}`;
        break;
      case 4:
        if (this.exists(r + 1, c + 1)) return `6_${r + 1}_${c + 1}`;
        if (this.exists(r + 1, c)) return `2_${r + 1}_${c}`;
        break;
      case 5:
        if (this.exists(r + 1, c)) return `1_${r + 1}_${c}`;
        break;
      case 3:
        if (this.exists(r + 1, c + 1)) return `1_${r + 1}_${c + 1}`;
        if (this.exists(r, c + 1)) return `5_${r}_${c + 1}`;
        break;
    }
    return vid + "_" + r + "_" + c;
  }

 /**
   * Returns an array of edges that are adjacent to the provided edge (share a vertex)
   * @param eid - full edge id (edge_row_column)
   */
  adjacentEdges(eid) {
    let edges = [];
    for (let vertex of this.verticesFromEdge(eid))
      for (let edge of this.edgesFromVertex(vertex))
        if (edge != eid) edges.push(edge);

    return edges;
  }

 /**
   * Returns an array of vertices that are adjacent to the provided vertex (share an edge)
   * @param vid - full vertex id (vertex_row_column)
   */
  adjacentVertices(vid) {
    let vertices = [];
    for (let edge of this.edgesFromVertex(vid))
      for (let vertex of this.verticesFromEdge(edge))
        if (vertex != vid) vertices.push(vertex);

    return vertices;
  }

  /**
   * Tests whether hexGrid contains a hex in position r, c
   * @param r - row of hex to test
   * @param c - column of hex to test
   */
  exists(r, c) {
    return this.hexes.includes(r + "_" + c);
  }


  /**
   * Returns an array of hexes adjacent to a given vertex
   * @param hexid - full vertex id (vertex_row_column)
   */ 
  hexesFromVertex(hexid) {
    let coord = hexid.split("_");
    let vid = parseInt(coord[0]);
    let r = parseInt(coord[1]);
    let c = parseInt(coord[2]);
    let hexes = [r + "_" + c];
    switch (vid) {
      case 1:
        if (this.exists(r - 1, c - 1)) hexes.push(`${r - 1}_${c - 1}`);
        if (this.exists(r - 1, c)) hexes.push(`${r - 1}_${c}`);
        break;
      case 2:
        if (this.exists(r - 1, c)) hexes.push(`${r - 1}_${c}`);
        if (this.exists(r, c + 1)) hexes.push(`${r}_${c + 1}`);
        break;
      case 3:
        if (this.exists(r, c + 1)) hexes.push(`${r}_${c + 1}`);
        if (this.exists(r + 1, c + 1)) hexes.push(`${r + 1}_${c + 1}`);
        break;
      case 4:
        if (this.exists(r + 1, c + 1)) hexes.push(`${r + 1}_${c + 1}`);
        if (this.exists(r + 1, c)) hexes.push(`${r + 1}_${c}`);
        break;
      case 5:
        if (this.exists(r + 1, c)) hexes.push(`${r + 1}_${c}`);
        if (this.exists(r, c - 1)) hexes.push(`${r}_${c - 1}`);
        break;
      case 6:
        if (this.exists(r, c - 1)) hexes.push(`${r}_${c - 1}`);
        if (this.exists(r - 1, c - 1)) hexes.push(`${r - 1}_${c - 1}`);
        break;
    }
    return hexes;
  }
}

module.exports = GameHexGrid;
