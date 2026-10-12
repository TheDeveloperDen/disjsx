import { type ChannelSelectProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIChannelSelectComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const ChannelSelectNode: NodeProcessor<APIChannelSelectComponent, ChannelSelectProps> = {
	process: (element) => {
		const { customId, placeholder, minValues, maxValues, disabled, defaultValues, channelTypes, id } = element.props;

		return {
			type: ComponentType.ChannelSelect,
			id,
			custom_id: customId,
			placeholder,
			min_values: minValues,
			max_values: maxValues,
			disabled,
			default_values: defaultValues,
			channel_types: channelTypes,
		};
	},
};
