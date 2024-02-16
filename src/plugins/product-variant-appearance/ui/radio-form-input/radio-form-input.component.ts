import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
	BooleanCustomFieldConfig,
	FormInputComponent,
	SharedModule,
} from "@vendure/admin-ui/core";

@Component({
	template: ` <input type="radio" [formControl]="formControl" /> `,
	standalone: true,
	imports: [SharedModule],
})
export class RadioFormInputComponent
	implements FormInputComponent<BooleanCustomFieldConfig>
{
	readonly: boolean;
	config: BooleanCustomFieldConfig;
	formControl: FormControl;
}
