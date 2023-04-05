import { ElementRef, Injectable } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameData } from '@common/interfaces/game-data';
import { MILLISECOND_TO_SECONDS, NUMBER_HINTS } from '@common/utils/env';
import { Buffer } from 'buffer';
import { BehaviorSubject } from 'rxjs';
import { ImageManipulationService } from '../image-manipulation-service/image-manipulation.service';

@Injectable({
    providedIn: 'root',
})
export class HintService {
    maxGivenHints = new BehaviorSubject<number>(NUMBER_HINTS);
    counter$ = this.maxGivenHints.asObservable();

    constructor(private imageManipulationService: ImageManipulationService) {}


    reset() {
        this.maxGivenHints.next(NUMBER_HINTS);
    }

    decrement() {
        const currentValue = this.maxGivenHints.value;
        this.maxGivenHints.next(currentValue - 1);
    }

    handleHint(chat: ChatComponent, time: number) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }) + ' - Indice utilisé';
        chat.sendSystemMessage(formattedTime);
        return time + 10; // will be a constant, and will recall same method for LT but negation
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
        gameInfo: { gameData: GameData; hints: number; diffs: boolean[] },
    ) {
        if (gameInfo.hints === 3) {
            this.imageManipulationService.showFirstHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
            );
        } else if (gameInfo.hints === 2) {
            this.imageManipulationService.showSecondHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
            );
        } else {
            this.imageManipulationService.showThirdHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
            );
        }
    }
}
