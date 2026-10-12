import { type MentionableSelectProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIMentionableSelectComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const MentionableSelectNode: NodeProcessor<APIMentionableSelectComponent, MentionableSelectProps> = {
	process: (element) => {
		const { customId, placeholder, minValues, maxValues, disabled, defaultValues, id } = element.props;

		return {
			type: ComponentType.MentionableSelect,
			id,
			custom_id: customId,
			placeholder,
			min_values: minValues,
			max_values: maxValues,
			disabled,
			default_values: defaultValues,
		};
	},
};
