import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import type { APIButtonComponent } from "discord-api-types/v10";
import { type ButtonProps } from "../types.js";
import { type NodeProcessor } from "./types.js";

export const ButtonNode: NodeProcessor<APIButtonComponent, ButtonProps> = {
	process: (element) => {
		const btnProps = element.props;
		const { id, disabled } = btnProps;

		if (btnProps.style === ButtonStyle.Premium) {
			return { type: ComponentType.Button, id, style: ButtonStyle.Premium, sku_id: btnProps.skuId, disabled };
		}

		const label = btnProps.label || (typeof btnProps.children === "string" ? btnProps.children : undefined);

		if (btnProps.style === ButtonStyle.Link) {
			return {
				type: ComponentType.Button,
				id,
				style: ButtonStyle.Link,
				label,
				emoji: btnProps.emoji,
				disabled,
				url: btnProps.url,
			};
		}

		return {
			type: ComponentType.Button,
			id,
			style: btnProps.style,
			label,
			emoji: btnProps.emoji,
			disabled,
			custom_id: btnProps.customId,
		};
	},
};
