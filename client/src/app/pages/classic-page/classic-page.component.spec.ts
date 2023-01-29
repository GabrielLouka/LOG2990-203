import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackButtonComponent } from '@app/components/back-button/back-button.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { InfoIconComponent } from '@app/components/info-icon/info-icon.component';
import { ClassicPageComponent } from './classic-page.component';

describe('ClassicPageComponent', () => {
    let component: ClassicPageComponent;
    let fixture: ComponentFixture<ClassicPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClassicPageComponent, HintComponent, BackButtonComponent, InfoIconComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ClassicPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
