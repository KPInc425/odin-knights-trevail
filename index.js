const knightMoves = (start, end) => {
    // Put together a script that creates a game board and a knight.

    // create game board
    //inputs sizeX, sizeY
    const createGameBoard = (sizeX, sizeY) => {
      let x = sizeX;
      let y = sizeY;
      let boardSlotLocations = [];
      // console.log(`[${x},${y}]`);

      //iteration through sizeX + 1, sizeY
      for (let i = 0; i < x; i++) {
          // console.log(i);
          //nested loop iterates through sizeX, sizeY + 1, pushing to boardSlotLocations
          // let tmpArray = [];
          for (let j = 0; j < y; j++) {
              boardSlotLocations.push([i,j]);
              // tmpArray.push([i,j]);
          }
          // boardSlotLocations.push(tmpArray);
      }
      //Return array with board slot locations
      return boardSlotLocations;
  }

    // create Knight 
    const createKnight = () => {
        // inputs starting location, board
        const possibleMoves = [
            [-2,1],
            [-1,2],
            [1,2],
            [2,1],
            [2,-1],
            [1,-2],
            [-1,-2],
            [-2,-1],
        ];

        return {
            type: "knight",
            start: null,
            end: null,
            directions: possibleMoves,
        }
    } 

    // MovementNode Structure
    const movementNode = (x, y, prev) => {
        return {
            root: [x, y],
            prev: prev || null,
            move0: null,
            move1: null,
            move2: null,
            move3: null,
            move4: null,
            move5: null,
            move6: null,
            move7: null,

        }
    }

    // create MovementTree
    const buildMovementTree = (board, piece) => {
        if (!board) {
            return null;
        }
        // set possible move directions from input piece 
        let moveDirections = piece.directions;
        // console.log(moveDirections);
        // console.log(moveDirections.length);

        // Make head movementNode
        let possibleMoves = movementNode(piece.start[0], piece.start[1]);
        // console.log(possibleMoves);
        
        // initialize x and y based on pieces starting position
        let x = piece.start[0];
        let y = piece.start[1];
        // Initialize max coords based off board size
        let xMax = board[board.length - 1][0];
        let yMax = board[board.length - 1][1];

        // Initialize visited array
        let alreadyVisited = [[x,y]];
        // Initialize Que
        let toVisitQue = queue();


        // recursive function to fill moveOptions for each node
        const recurseTree = (node) => {
            let headNode = node;
            let currentNode = node;
            x = currentNode.root[0];
            y = currentNode.root[1];

            // console.log(`x:${x} y:${y}`);

            for (let i = 0; i < moveDirections.length; i++) {
                // console.log(moveDirections[i]);
                // Calculate new move location
                let tmpMove = [(x + moveDirections[i][0]),(y + moveDirections[i][1])];
                // console.log(tmpMove);

                // Check if coords are out of range;
                if (tmpMove[0] < 0 || tmpMove[1] < 0 || tmpMove[0] > xMax || tmpMove[1] > yMax) {
                    // console.error("Coords are out of range!");
                    currentNode["move"+i] = null;
                } else if (checkVisited(alreadyVisited, tmpMove)) {
                    // Create containsFunction to check if the node has already been visited
                    // console.log("Already Visited");
                    // console.log(tmpMove);
                    currentNode["move"+i] = null;
                } else {
                    //Create new moveNode
                    let newMove = movementNode(tmpMove[0], tmpMove[1], currentNode);
                    // Point to new moveNode
                    currentNode["move"+i] = newMove;
                    // Push newMove to Que
                    toVisitQue.enqueue(newMove);
                }
            }

            // Call recursively while que is populated
            if (!toVisitQue.isEmpty()) {
              // Dequeue and add coords to path 
                let tmp = toVisitQue.dequeue();
                alreadyVisited.push([tmp.root[0], tmp.root[1]]);  
                recurseTree(tmp);
            }

            return headNode;

        }
        possibleMoves = recurseTree(possibleMoves);

        return possibleMoves;

    }

    const bFSearch = (movementTree, coordsToFind) => {
        let discoveredQue = queue();
        let pathToNode = [];
        let level = 0;
        if (!movementTree) {
          return null;
        }

        const recurseBFSearch = (node, level) => {
          // console.log(node);
          if (!node){
            return null;
          }
          let currentNode = node;

          // This populates array with array of path taken 
          if (pathToNode[level]) {
            pathToNode[level].push(currentNode);
          } else {
            pathToNode[level] = currentNode;
          }

          // console.log(coordsToFind);
          if (checkFoundNode(currentNode, coordsToFind)) {
            // console.log("Found Node!");
            // console.log(node);

            return;
          }

          for (let i = 0; i < 8; i++) {
            // Skip iteration if move is null
            if (!currentNode["move"+i]) {
              continue;
            }

            if (currentNode["move"+i]) {

              discoveredQue.enqueue(currentNode["move"+i]);
            }
          }
          // console.log(pathToNode[level]);
          // Iterate to next level of tree
          level++;

          // Recurse if still Queue
          if (!discoveredQue.isEmpty()) {
              let tmp = discoveredQue.dequeue();
              recurseBFSearch(tmp, level);
          } else {
            console.log("Que Empty!");
            console.log("Path Not Found!");
          }
        }

        recurseBFSearch(movementTree, level);
        // console.log(pathToNode);

        return pathToNode;
    }

    // Create Gameboard
    const chessBoard = createGameBoard(8,8);

    // Create Knight piece
    let knight = createKnight();

    // Initialize Start Location
    knight.start = start;
    knight.end = end;

    // build MovementTree based on start position
    let knightMovementTree = buildMovementTree(chessBoard, knight);

    // console.log(knightMovementTree);

    let path = bFSearch(knightMovementTree, knight.end);

    // Print path to node
    printPath(path);

}

const printPath = (pathToNode) => {
  let prettyPath = [];
  let foundNode = pathToNode[pathToNode.length - 1];

  const recursePrint = (node) => {
    if (!node.prev) {
      prettyPath.push(node.root);
      return;
    }
    prettyPath.push(node.root);
    recursePrint(node.prev);
  }
  recursePrint(foundNode);
  console.log(`You made it in ${prettyPath.length} moves! Here is your path:`)
  prettyPath.reverse()
  prettyPath.forEach((coords) => {
    console.log(coords);
  });
}

const checkVisited = (arrayToCheck, newLocation) => {
    // console.log(arrayToCheck);
    // console.log(newLocation);


    for (let i = 0; i < arrayToCheck.length; i++) {
      if (arrayToCheck[i][0] === newLocation[0] && arrayToCheck[i][1] === newLocation[1]) {
        return true;
      }
    }

    return false;
}

const checkFoundNode = (nodeFound, coordsToCheck) => {
  // console.log(nodeFound);
  if (nodeFound.root[0] == coordsToCheck[0] && nodeFound.root[1] == coordsToCheck[1]) {
    return true;
  } else {
    return false;
  }
}

// Queue structure
const queue = () => {
    let que = [];
  
    const enqueue = (quedNode) => {
      que.push(quedNode);
      return que;
    }
  
    const dequeue = () => {
      let dequedNode = que.shift();
      return dequedNode;
    }
  
    const getQue = () => {
      return que;
    }
  
    const isEmpty = () => {
      if (getQue().length === 0) {
        return true;
      } else {
        return false;
      }
    }

    const emptyQue = () => {
      que = [];
      return que;
    }
  
    const front = () => {
      return getQue()[0];
    }
  
    return {
      enqueue,
      dequeue,
      getQue,
      isEmpty,
      front,
      emptyQue,
    }
}

knightMoves([0,0], [7,7]);

