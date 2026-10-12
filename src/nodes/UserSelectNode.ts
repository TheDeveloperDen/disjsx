import { type UserSelectProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIUserSelectComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const UserSelectNode: NodeProcessor<APIUserSelectComponent, UserSelectProps> = {
	process: (element) => {
		const { customId, placeholder, minValues, maxValues, disabled, defaultValues, id } = element.props;

		return {
			type: ComponentType.UserSelect,
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
