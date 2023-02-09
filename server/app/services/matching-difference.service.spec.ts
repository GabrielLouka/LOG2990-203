import { GAME_CONST } from "@app/utils/env";
import { GameData } from "@common/game-data";
import { Vector2 } from "@common/vector2";
import { expect } from "chai";
import { assert } from "console";
import { MatchingDifferencesService } from "./matching-differences.service";
import Sinon = require("sinon");


describe("MatchingDifferences service", () => {
    let differenceService: MatchingDifferencesService;
    let gameData: GameData;
    let click: Vector2;

    beforeEach(async() =>{
        differenceService = new MatchingDifferencesService();
        gameData = {
            id: 0, 
            name: "myGame",
            isEasy: true,
            nbrDifferences: 7,
            differences: [
                [{ x: 1, y: 2 }, { x: 3, y: 4 }],
                [{ x: 5, y: 6 }, { x: 7, y: 8 }]
              ],
            ranking: []
        }
        click = { x: 3, y: 4 };
    });

    it("getDifference should be called with a game and a vector of clicks", () => {
        const methodSpy = Sinon.spy(differenceService, "getDifferenceIndex");
        assert(methodSpy.calledWith(gameData, click));        
    });

    it("should return the index of the difference that matches the click position", () => {
        const result = differenceService.getDifferenceIndex(gameData, click);
        expect(result).to.deep.equal(0);
    });

    it("getDIfference should return -1 if none have been found", () => {
        click = {x: 0, y:0};
        const result = differenceService.getDifferenceIndex(gameData, click);
        expect(result).to.deep.equal(GAME_CONST.notFound);
    });

});