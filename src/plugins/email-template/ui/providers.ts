import { addNavMenuSection} from '@vendure/admin-ui/core'

export default [
	addNavMenuSection(
		{
			id: "notifications",
			label: "Notifications",
			items: [
				{
					id: "email-template",
					label: "Email Template",
					routerLink: ["/extensions/email-templates"],
					// Icon can be any of https://core.clarity.design/foundation/icons/shapes/
					icon: "cursor-hand-open",
				},
			],
		},
		// Add this section before the "settings" section
		"marketing"
	),
];
