import { bootstrap, runMigrations } from "@vendure/core";
import { config } from "./vendure-config";
// import { SortOrder } from './generated-admin-types';

runMigrations(config)
	.then(() => bootstrap(config))
	.catch((err) => {
		console.log(err);
	});
