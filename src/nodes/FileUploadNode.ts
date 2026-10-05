import { type FileUploadProps, type FileUploadPayload, ComponentType } from "../types.js";
import { type NodeProcessor } from "./types.js";

export const FileUploadNode: NodeProcessor<FileUploadPayload, FileUploadProps> = {
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


