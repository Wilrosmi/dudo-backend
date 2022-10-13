import { IGameState } from "../types";
import getUsersGameState from "./getUsersGameState";

const fakeState: IGameState = {
  dice: {
    abc: [3, 4, 2, 5],
    def: [1, 6],
    ghi: [3, 1, 5],
  },
  turn: 1,
  order: ["abc", "def", "ghi"],
  bid: [1, 2],
  players: {
    abc: "notTarget",
    def: "notTargetTwo",
    ghi: "target",
  },
};

test("gets correct user state", () => {
  expect(getUsersGameState(fakeState, "ghi")).toStrictEqual({
    dice: {
      target: [3, 1, 5],
      notTarget: [4],
      notTargetTwo: [2],
    },
    bid: [1, 2],
    turn: "notTargetTwo",
  });
});
