# portfolio

### number space

![Small Sudoku Puzzle](thumbs/hallway_portals.png)

A Sudoku variant that doesn't change anything but the shape of the puzzle.
This [interactive website](https://06tron.github.io/numberspace/) is a work in progress.
So far there are four puzzles that a visitor can play, as long as they have a keyboard and mouse.

These oddly shaped puzzles can be modeled with a graph structure.
Suppose there is a vertex for each cell in the puzzle.
For example a regular Sudoku puzzle would have 81 vertices.
The player traverses this graph by moving their mouse between adjacent cells.

During puzzle navigation there are two components to the player's position:
Where are they in the puzzle? And how is this location placed on the screen?
Where they are is at the current vertex, which represents one of the puzzle's cells.
This cell's placement on the screen is the player's "level".
The level describes the cell's horizontal position, vertical position, and orientation.
There are eight possible orientations in this game, which correspond to the symmetries of a square.

The player's position changes frequently, so these two components must change accordingly.
Each edge in the graph is labeled by a matrix which describes the relationship between its two endpoints.
The level is represented with a similar matrix.
Every time the player moves to a new cell, they follow a single edge in the graph.
The current vertex changes to this edge's endpoint, and the level is multiplied by the matrix which labels this edge.

![A Crow's Head](mpc_crows_head.png)

I put this collage together in November 2021, using material related to books published by the University of Massachusetts Press.

See my [LinkedIn profile](https://www.linkedin.com/in/3mrichardson/).

### about me

![Portrait Photo](thumbs/mt_tom.jpg)

I'm a computer science student at UMass Amherst, working on a bachelor's degree.
My favorite subjects are geometry, abstract algebra, and computer graphics.

Bookmark a link like this one for a simple note in the browser:  
data:text/html,%3Cbody%20contenteditable%20style=%22font-family:Courier,monospace;line-height:1.4;padding:4em;%22%3E
