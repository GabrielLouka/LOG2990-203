<<<<<<< HEAD
// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { RegistrationPageComponent } from './registration-page.component';

// describe('RegistrationPageComponent', () => {
//     let component: RegistrationPageComponent;
//     let fixture: ComponentFixture<RegistrationPageComponent>;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [RegistrationPageComponent],
//         }).compileComponents();
=======
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
        authService = jasmine.createSpyObj("AuthService", ['registerUser', 'registerUserName']);
    });
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegistrationPageComponent],
            providers: [{provide: AuthService, useValue: authService},
                        {provide: ActivatedRoute, useValue: {
                            snapshot: { paramMap: convertToParamMap({id: '123'}) }
                          }}
            ]
        }).compileComponents();
>>>>>>> 5d22934ef17f5069b7ee848a9a0de533f583bb6c

//         fixture = TestBed.createComponent(RegistrationPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

<<<<<<< HEAD
//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
=======

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("component should have registration form as proprety", () => {
        expect(component.registrationForm).toBeInstanceOf(FormGroup);
    });

    it("registerUser should call registerUser method", () => {
        component.registerUser()
        expect(authService.registerUser).toHaveBeenCalled();
    });

    it("getUser should call registerUserName from service", () => {
        component.getUser()
        expect(authService.registerUserName).toHaveBeenCalled();
    });

});

>>>>>>> 5d22934ef17f5069b7ee848a9a0de533f583bb6c
