import { NgModule } from "@angular/core";
import {
	SharedModule,
	registerCustomDetailComponent,
} from "@vendure/admin-ui/core";
import { UpsaleProductComponent } from "./upsale-product-component/upsale-product.component";

@NgModule({
	imports: [SharedModule],
	providers: [
		// registerCustomDetailComponent({
		// 	locationId: "product-variant-detail",
		// 	component: UpsaleProductComponent,
		// }),
	],
	declarations: [UpsaleProductComponent],
})
export class UpsaleSharedModule {}
