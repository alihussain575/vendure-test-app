import type { CodegenConfig } from "@graphql-codegen/cli";

const typescriptPlugins = [
	{
		add: {
			// Use the "add" plugin to add the eslint-disable comment to the top of the generated file.
			content: "/* eslint-disable */",
		},
	},
	"typescript",
];
const typescriptClientPlugins = [
	"typescript-operations",
	"typed-document-node",
];
const clientScalars = {
	scalars: {
		ID: "string",
		Money: "number",
	},
};

const config: CodegenConfig = {
	overwrite: true,
	config: {
		strict: true,
		namingConvention: {
			typeNames: "change-case-all#pascalCase",
			enumValues: "keep",
		},
		scalars: {
			ID: "string | number",
		},
		maybeValue: "T",
	},
	generates: {
		"src/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			plugins: typescriptPlugins,
		},
		"src/plugins/upsale/ui/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			documents: "src/plugins/upsale/fragments.graphql.ts",
			plugins: [...typescriptPlugins, ...typescriptClientPlugins],
			config: clientScalars,
		},
		"src/plugins/campaign/ui/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			documents: "src/plugins/campaign/fragments.graphql.ts",
			plugins: [...typescriptPlugins, ...typescriptClientPlugins],
			config: clientScalars,
		},
		"src/plugins/order-message/ui/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			documents: "src/plugins/order-message/fragments.graphql.ts",
			plugins: [...typescriptPlugins, ...typescriptClientPlugins],
			config: clientScalars,
		},
		"src/plugins/email-template/ui/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			documents: "src/plugins/email-template/fragments.graphql.ts",
			plugins: [...typescriptPlugins, ...typescriptClientPlugins],
			config: clientScalars,
		},
		"src/plugins/cms/ui/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			documents: "src/plugins/cms/fragments.graphql.ts",
			plugins: [...typescriptPlugins, ...typescriptClientPlugins],
			config: clientScalars,
		},
		"src/plugins/product-types/ui/generated-admin-types.ts": {
			schema: "http://localhost:3000/admin-api",
			documents: "src/plugins/product-types/fragments.graphql.ts",
			plugins: [...typescriptPlugins, ...typescriptClientPlugins],
			config: clientScalars,
		},
	},
};
export default config;
