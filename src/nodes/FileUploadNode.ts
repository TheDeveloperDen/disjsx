import { type FileUploadProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIFileUploadComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const FileUploadNode: NodeProcessor<APIFileUploadComponent, FileUploadProps> = {
	process: (element) => {
		const fileUploadProps = element.props;

		return {
			type: ComponentType.FileUpload,
			id: fileUploadProps.id,
			custom_id: fileUploadProps.customId,
			min_values: fileUploadProps.minValues,
			max_values: fileUploadProps.maxValues,
			required: fileUploadProps.required,
		};
	},
};
