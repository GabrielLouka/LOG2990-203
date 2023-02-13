import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { RegistrationPageComponent } from './registration-page.component';

describe('RegistrationPageComponent', () => {
    let component: RegistrationPageComponent;
    let fixture: ComponentFixture<RegistrationPageComponent>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registerUserName']);
    });

    beforeEach(() => {
        authService = jasmine.createSpyObj("AuthService", ['registerUser', 'getUser']);
    });
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegistrationPageComponent],
            providers: [
                { provide: AuthService, useValue: authService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RegistrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });    


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('component should have registration form as proprety', () => {
        expect(component.registrationForm).toBeInstanceOf(FormGroup);
    });

    it('registerUser should call registerUser method', () => {
        component.registerUser();
        expect(authService.registerUser).toHaveBeenCalled();
    });

    it('getUser should call registerUserName from service', () => {
        component.getUser();
        expect(authService.registerUserName).toHaveBeenCalled();
    });
});
