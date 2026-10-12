import { type RoleSelectProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIRoleSelectComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const RoleSelectNode: NodeProcessor<APIRoleSelectComponent, RoleSelectProps> = {
	process: (element) => {
		const { customId, placeholder, minValues, maxValues, disabled, defaultValues, id } = element.props;

		return {
			type: ComponentType.RoleSelect,
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
