import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import path from 'path';
import { ProductType } from './entities/product-type.entitiy';
import { ProductTypeResolver } from './api/products-admin.resolver';
import { productAdminApiExtensions } from './api/api-extension';
import { ProductAdditionalDetailsService } from './service/productType.service';
import './types.ts'


@VendurePlugin({
    compatibility: "^2.1.0",
    imports: [PluginCommonModule],
    entities : [ProductType],
    providers: [ProductAdditionalDetailsService],
    adminApiExtensions: {
        schema: productAdminApiExtensions ,
        resolvers: [ProductTypeResolver]
    },
    shopApiExtensions: {
        // schema: path.join(__dirname, 'api/schema.graphql'),
        // resolvers: [path.join(__dirname, 'api/resolvers/shop.ts')]
    },
})

export class ProductTypesPlugin {
    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, "ui"),
		providers: ["providers.ts"],
    }
}