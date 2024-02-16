import { registerCustomDetailComponent } from "@vendure/admin-ui/core";
import { ProductTypeComponent } from "./product-type/product-type.component";



export default [
    registerCustomDetailComponent({
        locationId: 'product-detail',
        component: ProductTypeComponent,
    })
]