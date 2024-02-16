import gql from "graphql-tag";

export const EMAIL_TEMPLATE_FRAGMENT = gql`
	fragment EmailTemplate on EmailTemplate {
		id
		createdAt
		updatedAt
		name
		code
		description
		enabled
		type
		subject
		attachFile
	}
`;

export const TEMPLATE_PHRASE_FRAGMENT = gql`
	fragment TemplatePhrase on TemplatePhrase {
		id
		createdAt
		updatedAt
		key
		value
	}
`;

export const GET_EMAIL_TEMPLATES = gql`
	query GetEmailTemplates {
		emailTemplates {
			...EmailTemplate
		}
	}
`;

export const GET_EMAIL_TEMPLATE = gql`
	query GetEmailTemplate($id: ID!) {
		emailTemplate(id: $id) {
			...EmailTemplate
			template
			phrases {
				...TemplatePhrase
			}
		}
	}
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
	mutation UpdateEmailTemplate($input: UpdateEmailTemplateInput!) {
		updateEmailTemplate(input: $input) {
			...EmailTemplate
			template
			phrases {
				...TemplatePhrase
			}
		}
	}
`;

export const GET_EMAIL_TEMPLATE_BY_CODE = gql`
	query GetEmailTemplateByCode($code: String!) {
		emailTemplateByCode(code: $code) {
			...EmailTemplate
			template
			phrases {
				...TemplatePhrase
			}
		}
	}
`;

export const RESET_DEFAULT = gql`
	mutation ResetDefaultTemplate($code: String!) {
		resetDefaultTemplate(code: $code) {
			...EmailTemplate
			template
			phrases {
				...TemplatePhrase
			}
		}
	}
`;

export const GET_PARTIALS = gql`
	query GetPartials {
		partials {
			...EmailTemplate
			template
		}
	}
`;

export const SEND_TEST_EMAIL = gql`
	mutation SendTestEmail($input: SendTestEmailInput!) {
		sendTestEmail(input: $input)
	}
`;
