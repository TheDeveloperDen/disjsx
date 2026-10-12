import { Children } from "react";
import { type ActionRowProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIActionRowComponent, APIComponentInActionRow } from "discord-api-types/v10";
import { flattenProcessed, type NodeProcessor } from "./types.js";

export const ActionRowNode: NodeProcessor<
	APIActionRowComponent<APIComponentInActionRow>,
	ActionRowProps,
	APIComponentInActionRow
> = {
	process: (element, processChildNode) => {
		const actionRowProps = element.props;
		const components: APIComponentInActionRow[] = [];

		for (const child of Children.toArray(actionRowProps.children)) {
			components.push(...flattenProcessed(processChildNode(child)));
		}

		return {
			type: ComponentType.ActionRow,
			id: actionRowProps.id,
			components,
		};
	},
};
