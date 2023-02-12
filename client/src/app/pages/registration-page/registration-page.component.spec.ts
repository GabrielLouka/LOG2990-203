import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { of } from 'rxjs';
import { RegistrationPageComponent } from './registration-page.component';

describe('RegistrationPageComponent', () => {
    let component: RegistrationPageComponent;
    let fixture: ComponentFixture<RegistrationPageComponent>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        authService = jasmine.createSpyObj("AuthService", ['registerUser', 'getUser']);
    });
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegistrationPageComponent],
            providers: [{provide: AuthService, useValue: authService},
                        {provide: ActivatedRoute, useValue: {
                            params: of({ id: 'test' })
                          }}
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegistrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });    


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("component should have registration form as proprety", () => {
        expect(component.registrationForm).toBeInstanceOf(FormGroup);
    });

    it("component should have authservice and route in constructor", () => {
        expect(component['auth']).toBeInstanceOf(AuthService);
        expect(component['route']).toBeInstanceOf(ActivatedRoute);
    });

    it("getUser should call registerUserName", () => {
        const registSpy = spyOn(authService, "registerUserName");
        component.getUser();
        expect(registSpy).toEqual(authService.registerUserName);
    });

    it("registerUser should call registerUser with form value for the username", () => {
        const registSpy = spyOn(authService, "registerUser");
        component.registerUser();
        expect(registSpy).toHaveBeenCalled();
    });

    
});
