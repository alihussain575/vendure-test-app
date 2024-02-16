import { registerFormInputComponent } from "@vendure/admin-ui/core";
import { RadioFormInputComponent } from "./radio-form-input/radio-form-input.component";

export default [
	registerFormInputComponent("radio-form-input", RadioFormInputComponent),
];
