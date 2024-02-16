import { gql } from "graphql-tag";

export const commonExtensions = gql`
	type EmailTemplate implements Node {
		id: ID!
		createdAt: DateTime!
		updatedAt: DateTime!
		name: String!
		code: String!
		description: String!
		enabled: Boolean!
		type: String!
		template: String!
		templatePath: String!
		subject: String!
		phrases: [TemplatePhrase!]!
		attachFile: Boolean!
	}

	type TemplatePhrase implements Node {
		id: ID!
		createdAt: DateTime!
		updatedAt: DateTime!
		key: String!
		value: String!
		template: EmailTemplate!
	}
`;

export const adminApiExtensions = gql`
	${commonExtensions}

	extend type Query {
		emailTemplates: [EmailTemplate!]!
		emailTemplate(id: ID!): EmailTemplate!
		emailTemplateByCode(code: String!): EmailTemplate!
		partials: [EmailTemplate!]!
	}

	extend type Mutation {
		updateEmailTemplate(input: UpdateEmailTemplateInput!): EmailTemplate!
		resetDefaultTemplate(code: String!): EmailTemplate!
		sendTestEmail(input: SendTestEmailInput!): Boolean!
	}

	input UpdateEmailTemplateInput {
		id: ID!
		name: String
		description: String
		enabled: Boolean
		template: String
		phrases: [TemplatePhraseInput!]
		attachFile: Boolean
	}

	input SendTestEmailInput {
		template: String!
		to: String!
	}

	input TemplatePhraseInput {
		id: ID
		key: String!
		value: String!
		templateCode: String!
	}
`;
