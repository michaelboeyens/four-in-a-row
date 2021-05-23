// @ts-check

// @ts-ignore
const app = new Vue({
  el: "#app",
  data() {
    return {
      player1: { id: 1, color: "red", score: 0 },
      player2: { id: 2, color: "yellow", score: 0 },
      firstPlayer: true,
      result: null,
      resultArr: null,
      board: [],
      colCount: 7,
      rowCount: 6,
    };
  },
  created() {
    this.board = this.initBoard();
  },
  computed: {
    currentPlayer: function () {
      if (this.firstPlayer) {
        return this.player1;
      } else {
        return this.player2;
      }
    },
    currentPlayerName: function () {
      if (this.firstPlayer) {
        return "Player 1";
      } else {
        return "Player 2";
      }
    },
    winner() {
      if (this.result === "red") {
        return "Player 1";
      } else if (this.result === "yellow") {
        return "Player 2";
      } else if (this.result === "tie") {
        return this.result;
      }
    },
  },
  methods: {
    initBoard() {
      const board = [];
      for (let x = 0; x < this.colCount; x++) {
        const row = [];
        for (let y = 0; y < this.rowCount; y++) {
          row.push(0);
        }
        board.push(row);
      }
      return board;
    },
    addToken(columnId) {
      if (!this.result) {
        let rowId = this.checkColumn(columnId);
        if (rowId === null) {
          return;
        }
        this.board[columnId][rowId] = this.currentPlayer.id;

        let columnWin = [{ name: "column", arr: this.filterColumns(columnId) }];
        let rowWin = [{ name: "row", arr: this.filterRows(rowId) }];
        let diagUpWin = [
          {
            name: "diagUp",
            arr: this.filterArr(this.filterDiagUp(rowId, columnId)),
          },
        ];
        let diagDownWin = [
          {
            name: "diagDown",
            arr: this.filterArr(this.filterDiagDown(rowId, columnId)),
          },
        ];

        let resultArr = columnWin.concat(rowWin, diagUpWin, diagDownWin);
        let resultObj = resultArr.filter((val) => val.arr.length > 0);

        if (resultObj.length) {
          this.result = this.currentPlayer.color;
          this.currentPlayer.score++;
          this.showWinningTokens(rowId, columnId, resultObj);
        }
        if (this.boardFull() && this.result === null) {
          this.result = "tie";
        }
        this.firstPlayer = !this.firstPlayer;
      }
    },
    showWinningTokens(rowId, columnId, resultObj) {
      for (let k = 0; k < resultObj.length; k++) {
        switch (resultObj[k].name) {
          case "column":
            for (let i = 0; i < resultObj[k].arr[0].count; i++) {
              this.board[columnId][resultObj[k].arr[0].id + i] = 3;
            }
            break;
          case "row":
            for (let i = 0; i < resultObj[k].arr[0].count; i++) {
              this.board[resultObj[k].arr[0].id + i][rowId] = 3;
            }
            break;
          case "diagUp":
            this.board[columnId][rowId] = 3;
            this.showDiagArr(columnId, rowId, -1, 1);
            this.showDiagArr(columnId, rowId, 1, -1);
            break;
          case "diagDown":
            this.board[columnId][rowId] = 3;
            this.showDiagArr(columnId, rowId, 1, 1);
            this.showDiagArr(columnId, rowId, -1, -1);
            break;
        }
      }
    },
    showDiagArr(columnId, rowId, rowStop, colStop) {
      while (
        this.getRowDir(rowStop, rowId) &&
        this.getColDir(colStop, columnId)
      ) {
        rowId += rowStop;
        columnId += colStop;
        if (this.board[columnId][rowId] === this.currentPlayer.id) {
          this.board[columnId][rowId] = 3;
        } else {
          return;
        }
      }
    },
    checkColumn(columnId) {
      for (let i = this.rowCount - 1; i >= 0; i--) {
        if (this.board[columnId][i] === 0) {
          return i;
        }
      }
      return null;
    },
    checkColor(rowId, columnId) {
      let boardVal = this.board[columnId][rowId];
      if (boardVal === 1) {
        return "game__cell--red";
      } else if (boardVal === 2) {
        return "game__cell--yellow";
      } else if (boardVal === 3) {
        return "game__cell--green";
      }
    },
    filterRows(rowId) {
      let rowArr = this.board.map((val) => val[rowId]);
      return this.filterArr(rowArr);
    },
    filterColumns(columnId) {
      return this.filterArr(this.board[columnId]);
    },
    filterDiagUp(rowId, columnId) {
      let diagArr = [this.board[columnId][rowId]];
      diagArr = this.getDiagArr(rowId, columnId, -1, 1, diagArr);
      diagArr = this.getDiagArr(rowId, columnId, 1, -1, diagArr);
      return diagArr;
    },
    filterDiagDown(rowId, columnId) {
      let diagArr = [this.board[columnId][rowId]];
      diagArr = this.getDiagArr(rowId, columnId, 1, 1, diagArr);
      diagArr = this.getDiagArr(rowId, columnId, -1, -1, diagArr);
      return diagArr;
    },
    getDiagArr(rowId, columnId, rowStop, colStop, diagArr) {
      while (
        this.getRowDir(rowStop, rowId) &&
        this.getColDir(colStop, columnId)
      ) {
        rowId += rowStop;
        columnId += colStop;

        if (colStop === 1) {
          diagArr.push(this.board[columnId][rowId]);
        } else if (colStop === -1) {
          diagArr.unshift(this.board[columnId][rowId]);
        }
      }
      return diagArr;
    },
    getRowDir(rowStop, rowId) {
      if (rowStop === 1) {
        return rowId < this.rowCount - 1;
      } else if (rowStop === -1) {
        return rowId > 0;
      }
    },
    getColDir(colStop, columnId) {
      if (colStop === 1) {
        return columnId < this.colCount - 1;
      } else if (colStop === -1) {
        return columnId > 0;
      }
    },
    filterArr(tokenArr) {
      let countArr = [];
      countArr.push(
        tokenArr.reduce(
          (acc, val, id) => {
            if (acc.color !== val) {
              countArr.push(acc);
              return { color: val, id: id, count: 1 };
            } else {
              return { color: val, id: acc.id, count: acc.count + 1 };
            }
          },
          { color: -1, id: -1, count: 0 }
        )
      );
      return countArr
        .filter((val) => val.color === 1 || val.color === 2)
        .filter((val) => val.count > 3);
    },
    restartGame() {
      this.firstPlayer = true;
      this.result = null;
      this.board = this.initBoard();
      this.resultArr = null;
    },
    boardFull() {
      return this.board.reduce((acc, val) => {
        if (acc === false) {
          return acc;
        }
        return val.reduce((acc2, val2) => {
          if (acc2 === false) {
            return acc2;
          }
          if (val2 === 0) {
            return false;
          } else {
            return true;
          }
        }, true);
      }, true);
    },
  },
});
