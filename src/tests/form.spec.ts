import { ComponentFixture, TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

import { MultiselectListModule } from '../app/shared/multiselect-list';
import { ProjectSelectModule } from '../app/shared/project-select';
import { FormComponent } from '../app/wizard/wizard.component';
import { ForgeService } from '../app/shared/forge.service';
import { Config } from '../app/shared/config.component';
import { Gui } from '../app/shared/model';


let comp: FormComponent;
let fixture: ComponentFixture<FormComponent>;

let forgeServiceStub: ForgeService;
let spy: any;

const json = {
  "metadata": {
    "deprecated": false,
    "category": "Project/Generation",
    "name": "Project: New",
    "description": "Createanewproject"
  },
  "state": {
    "valid": false,
    "canExecute": true,
    "wizard": true,
    "canMoveToNextStep": false,
    "canMoveToPreviousStep": false
  },
  "inputs": [
    {
      "name": "named",
      "shortName": " ",
      "valueType": "java.lang.String",
      "inputType": "org.jboss.forge.inputType.DEFAULT",
      "enabled": true,
      "required": true,
      "deprecated": false,
      "label": "name",
      "class": "UIInput"
    }]
};

describe('Dynamic form should be created for json that comes from the server', () => {
  let subscribe: Function = null;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MultiselectListModule, ProjectSelectModule, HttpModule],
      declarations: [FormComponent],
      providers: [
        ForgeService,
        { provide: Config, useValue: { get: (key: string) => { } } },
        {
          provide: ActivatedRoute, useValue: {
            params: {
              subscribe: ((callback: Function) => {
                this.subscribe = callback;
                callback({ command: 'obsidian-new-quickstart', step: '0' });
              })
            }
          }
        },
        {
          provide: Router, useValue: {
            navigate: () => {
              this.subscribe({ command: 'obsidian-new-quickstart', step: 'end' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    forgeServiceStub = fixture.debugElement.injector.get(ForgeService);

    spyOn(forgeServiceStub, 'commandInfo')
      .and.returnValue(Promise.resolve(json));

    spy = spyOn(forgeServiceStub, 'executeCommand').and.returnValue(Promise.resolve({}));

    comp = fixture.componentInstance;
  }));

  it("should create a input type text for specified json", fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(comp.currentGui == null).toBe(false);
    expect(comp.currentGui.inputs == null).toBe(false);
    expect(comp.currentGui.inputs.length).toBe(1);

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.getAttribute('type')).toBe('text');
    const value = "test value";
    input.value = value;
    dispatchEvent(input, 'input');
    comp.finish();


    tick(2000);

    comp.onSubmit();
    expect(forgeServiceStub.executeCommand).toHaveBeenCalledWith('obsidian-new-quickstart', [json], 0)
  }));
});