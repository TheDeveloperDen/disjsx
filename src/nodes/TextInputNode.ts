import { type TextInputProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APITextInputComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const TextInputNode: NodeProcessor<APITextInputComponent, TextInputProps> = {
	process: (element) => {
		const textInputProps = element.props;

		return {
			type: ComponentType.TextInput,
			id: textInputProps.id,
			custom_id: textInputProps.customId,
			style: textInputProps.style,
			label: textInputProps.label,
			min_length: textInputProps.minLength,
			max_length: textInputProps.maxLength,
			required: textInputProps.required,
			value: textInputProps.value,
			placeholder: textInputProps.placeholder,
		};
	},
};
