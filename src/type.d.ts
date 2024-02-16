import "@vendure/core/dist/entity/custom-entity-fields";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
	interface CustomGlobalSettingsFields {
		sendGridToken: string;
		sendGridFrom: string;
		shopUrl: string;
	}
}
