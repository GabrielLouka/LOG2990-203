import { ElementRef, Injectable } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game-data';
import { CANVAS_HEIGHT, MILLISECOND_TO_SECONDS, NUMBER_HINTS } from '@common/utils/env';
import { QUADRANTS, SUB_QUADRANTS } from '@common/utils/env.quadrants';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';


@Injectable({
    providedIn: 'root',
})
export class HintService {
    maxGivenHints = new BehaviorSubject<number>(NUMBER_HINTS);
    counter$ = this.maxGivenHints.asObservable();    

    randomQuadrant: {x: number; y: number; width: number; height: number;};
    randomSubQuadrant: {x: number; y: number; width: number; height: number;};
    randomCircle: Vector2;

    constructor(private imageManipulationService: ImageManipulationService) {
    
    }

    initialzeGame(gameInfo: { game: GameData, foundDifferences: boolean[] }, ){
        this.randomQuadrant = this.generateRandomQuadrant(gameInfo, QUADRANTS);
        this.randomSubQuadrant = this.generateRandomQuadrant(gameInfo, SUB_QUADRANTS);
        this.randomCircle = this.generateRandomDifference(gameInfo);
        console.log(this.randomQuadrant);

    }


    reset() {
        this.maxGivenHints.next(NUMBER_HINTS);
    }

    decrement() {
        const currentValue = this.maxGivenHints.value;
        this.maxGivenHints.next(currentValue - 1);
    }

    handleHint(chat: ChatComponent, time: number, isLimited: boolean) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }) + ' - Indice utilisé';
        chat.sendSystemMessage(formattedTime);
        return isLimited ? time - 10 : time + 10; // will be a constant for penalty 
    }

    showMessage(penaltyMessage: ElementRef) {
        penaltyMessage.nativeElement.style.display = this.returnDisplay('block');
        setTimeout(() => {
            if (penaltyMessage.nativeElement.style.display !== 'none') {
                penaltyMessage.nativeElement.style.display = this.returnDisplay('none');
            }
        }, MILLISECOND_TO_SECONDS);
    }

    returnDisplay(display: string) {
        return display;
    }

    showHint(
        canvas: ElementRef<HTMLCanvasElement>,
        context: CanvasRenderingContext2D,
        image: Buffer,
        otherImage: Buffer,
        gameInfo: { gameData: GameData; hints: number; diffs: boolean[]},
    ) {
        if (gameInfo.hints === 3) {
            this.imageManipulationService.showFirstHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
                this.randomQuadrant
            );
        } else if (gameInfo.hints === 2) {
            this.imageManipulationService.showSecondHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
                this.randomSubQuadrant
            );
        } else {
            this.imageManipulationService.showThirdHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
                this.randomCircle
            );
        }
    }

    generateRandomDifference(gameInfo:{game: GameData, foundDifferences: boolean[]}){
        let randomIndex;
        let randomDifference;
        let randomVector;     
        let diffFound;
        do {
            randomIndex = Math.floor(Math.random() * gameInfo.game.differences.length);
            diffFound = gameInfo.foundDifferences[randomIndex];
            
        } while(diffFound);
        randomDifference = gameInfo.game.differences[randomIndex];
        randomVector = randomDifference[Math.floor(Math.random() * randomDifference.length)];
        return randomVector;
    }

    generateRandomQuadrant(gameInfo:{game: GameData, foundDifferences: boolean[]}, quadrants: any[]){
        const randomVector = this.generateRandomDifference(gameInfo);
        let rect;
        do {
            let randomSection = Math.floor(Math.random() * quadrants.length);

            rect = quadrants[randomSection];            

        } while(
            !((randomVector.x >= rect.x && randomVector.x < rect.x  + rect.width) &&
                ((CANVAS_HEIGHT - randomVector.y >= rect.y) && 
                (CANVAS_HEIGHT - randomVector.y < rect.y + rect.height)))
        );
        return rect;
    }
    
}
