
import { TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface ISetpperInterface {
    title: string;
    template: TemplateRef<unknown>;
    formGroup: FormGroup
}