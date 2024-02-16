import gql from "graphql-tag";

export const adminApiExtensions = gql`
	extend type Mutation {
		reportCheckList(input: ReportCheckListInput!): Boolean!
		reportCash: Boolean!
		reportTransfer: Boolean!
	}

	input ReportCheckListInput {
		stockLocation: [ID!]
	}

	extend type Query {
		availableOrderExportStrategies: [String!]!
	}
`;
