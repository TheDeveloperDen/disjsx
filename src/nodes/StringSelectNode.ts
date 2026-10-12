import { Children, isValidElement } from "react";
import { type StringSelectProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import { DISJSX, isDISJSXElement } from "../disjsxTypes.js";
import type { APISelectMenuOption, APIStringSelectComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const StringSelectNode: NodeProcessor<APIStringSelectComponent, StringSelectProps> = {
	process: (element, _, __, ___, getProcessedElement) => {
		const selProps = element.props;
		const options: APISelectMenuOption[] = [];

		for (const rawChildNode of Children.toArray(selProps.children)) {
			if (!isValidElement(rawChildNode)) {
				continue;
			}

			const childNode = getProcessedElement(rawChildNode);

			if (!isDISJSXElement(childNode, DISJSX.SelectOption)) {
				continue;
			}
			const optProps = childNode.props;

			options.push({
				label: optProps.label || (typeof optProps.children === "string" ? optProps.children : "Option"),
				value: optProps.value,
				description: optProps.description,
				emoji: optProps.emoji,
				default: optProps.isDefault,
			});
		}

		return {
			type: ComponentType.StringSelect,
			id: selProps.id,
			custom_id: selProps.customId,
			placeholder: selProps.placeholder,
			min_values: selProps.minValues,
			max_values: selProps.maxValues,
			disabled: selProps.disabled,
			options,
		};
	},
};
