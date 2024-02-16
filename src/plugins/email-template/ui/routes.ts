import { registerRouteComponent } from "@vendure/admin-ui/core";
import { registerReactRouteComponent } from "@vendure/admin-ui/react";
import EmailTemplateDetail from "./components/email-template-detail";
import { EmailTemplateList } from "./email-templates-list/email-templates-list.component";

export default [
	registerRouteComponent({
		component: EmailTemplateList,
		path: "",
		routeConfig: {
			pathMatch: "full",
		},
		title: "Email Templates",
		breadcrumb: [
			{ label: "Email Templates", link: ["/extensions", "email-templates"] },
		],
	}),
	registerReactRouteComponent({
		path: ":code",
		component: EmailTemplateDetail,
	}),
];
