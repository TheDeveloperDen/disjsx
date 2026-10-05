import { type UserSelectProps, type UserSelectPayload, ComponentType } from "../types.js";
import { type NodeProcessor } from "./types.js";

export const UserSelectNode: NodeProcessor<UserSelectPayload, UserSelectProps> = {
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
