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

    it('should register a user with the auth service', () => {
        authService.registerUser.and.callThrough();
        component.registrationForm.setValue({ username: 'testuser' });
        component.registerUser();
        expect(component.username).toBe('testuser');
    });

    it('should get the registered user name from the auth service', () => {
        authService.registerUserName.and.returnValue('testuser');
        const result = component.getUser();
        expect(result).toBe('testuser');
    });
});
