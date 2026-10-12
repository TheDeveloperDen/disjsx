import { type ReactElement, Children, isValidElement, Fragment } from "react";
import { type LegacyMessagePayload, type V2MessagePayload } from "./types.js";
import { MessageFlags } from "discord-api-types/v10";
import type {
	APIActionRowComponent,
	APIComponentInMessageActionRow,
	APIEmbed,
	APIMessageTopLevelComponent,
	APIModalInteractionResponseCallbackComponent,
	APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";

import { DISJSX, isDISJSXElement } from "./disjsxTypes.js";
import { getChildren, getProp } from "./children.js";
import { processNode } from "./utils.js";
import { flattenProcessed } from "./nodes/types.js";
import { getDISJSXType, getProcessedElement } from "./utils.js";
import { processChildrenToString } from "./processChildrenToString.js";
import {
	DisJSXValidationError,
	type ValidationError,
	validateComponent,
	validateUniqueCustomIds,
} from "./validation.js";

// Exporting all these in the off chance someone wants to use them directly (idk why you would tho)
export * from "./disjsxTypes.js";
export * from "./types.js";
export * from "./utils.js";
export * from "./processChildrenToString.js";
export * from "./nodes/index.js";
export * from "./validation.js";

export type RenderOptions = {
	/** Whether to validate the tree before rendering. Defaults to `true`. */
	validate?: boolean;
	/** Called once per non-fatal validation warning. Warnings are ignored when this is not set. */
	onWarning?: (warning: ValidationError) => void;
};

/**
 * Renders a DISJSX `<Message>` element and its children into a Discord message payload object.
 * This is the main entry point for converting a DISJSX tree into a usable payload.
 *
 * It differentiates between V2 component-based messages and legacy messages (which can include
 * content, embeds, and components). The `isV2` prop on the `<Message>` component
 * dictates the output structure.
 *
 * For V2 messages, it primarily processes children into a `components` array.
 * For legacy messages, it populates `content`, `embeds`, and `components` fields
 * based on the DISJSX children (`<Content>`, `<Embed>`, `<ActionRow>`).
 *
 * @param messageElement The root `<Message>` React element or a component that renders to a Message element.
 * @param options See {@link RenderOptions}.
 * @returns A `LegacyMessagePayload` or `V2MessagePayload` object. Unset webhook fields (`username`, `avatar_url`, `tts`) and `flags` are omitted.
 * @throws {DisJSXValidationError} If validation finds errors. Use `validate: false` to skip validation.
 * @throws {TypeError} If the root is not a `<Message>`, or a custom component returns something other than an element.
 * @throws {RangeError} If custom components are nested too deeply.
 */
export const renderDiscordMessage = (
	messageElement: ReactElement,
	options: RenderOptions = {},
): LegacyMessagePayload | V2MessagePayload => {
	const { validate = true, onWarning } = options;

	const processedMessageElement = getProcessedElement(messageElement);

	if (!processedMessageElement || !isDISJSXElement(processedMessageElement, DISJSX.Message)) {
		throw new TypeError(
			`renderDiscordMessage expects a root <Message> element or a component that renders to one. Got: <${getDISJSXType(processedMessageElement) ?? "something else"}>`,
		);
	}

	const { props } = processedMessageElement;
	const { isV2 = false, username, avatarUrl, tts, flags } = props;

	if (validate) {
		const validationResult = validateComponent(processedMessageElement, isV2, "message");
		const customIdErrors = validateUniqueCustomIds(processedMessageElement);

		const allErrors = [...validationResult.errors, ...customIdErrors];
		const allWarnings = validationResult.warnings;

		if (allErrors.length > 0) {
			throw new DisJSXValidationError(allErrors);
		}

		allWarnings.forEach((warning) => onWarning?.(warning));
	}

	const childrenArray = Children.toArray(props.children);

	// Webhook-only fields are left out entirely when unset, not set to undefined.
	const webhookFields = {
		...(username !== undefined && { username }),
		...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
		...(tts !== undefined && { tts }),
	};

	if (isV2) {
		const v2Components: APIMessageTopLevelComponent[] = [];

		for (const child of childrenArray) {
			if (isValidElement(child) && child.type === Fragment) {
				// Handle React Fragments by processing their children
				const fragmentChildren = getChildren(child);

				for (const fragmentChild of fragmentChildren) {
					v2Components.push(...flattenProcessed(processNode<APIMessageTopLevelComponent>(fragmentChild)));
				}
			} else {
				v2Components.push(...flattenProcessed(processNode<APIMessageTopLevelComponent>(child)));
			}
		}
		const v2Payload: V2MessagePayload = {
			...webhookFields,
			components: v2Components,
			flags: MessageFlags.IsComponentsV2 | (flags || 0),
		};

		return v2Payload;
	}

	const legacyPayload: LegacyMessagePayload = {
		...webhookFields,
		embeds: [],
		components: [],
		...(flags !== undefined && { flags }),
	};

	for (const rawChildNode of childrenArray) {
		if (!isValidElement(rawChildNode)) {
			if (
				typeof rawChildNode === "string" &&
				!legacyPayload.content // Only use first string child as content if no <Content> used
			) {
				legacyPayload.content = (legacyPayload.content || "") + rawChildNode;
			}
			continue;
		}

		// Handle React Fragments by processing their children
		if (rawChildNode.type === Fragment) {
			const fragmentChildren = getChildren(rawChildNode);

			for (const fragmentChild of fragmentChildren) {
				if (!isValidElement(fragmentChild)) {
					if (typeof fragmentChild === "string" && !legacyPayload.content) {
						legacyPayload.content = (legacyPayload.content || "") + fragmentChild;
					}
					continue;
				}

				const childNode = getProcessedElement(fragmentChild);
				const childDISJSXType = getDISJSXType(childNode);

				if (childDISJSXType === DISJSX.Content) {
					legacyPayload.content =
						(legacyPayload.content || "") + processChildrenToString(getProp(childNode, "children"));
				} else if (childDISJSXType === DISJSX.Embed) {
					legacyPayload.embeds?.push(...flattenProcessed(processNode<APIEmbed>(childNode)));
				} else if (childDISJSXType === DISJSX.ActionRow) {
					legacyPayload.components?.push(
						...flattenProcessed(processNode<APIActionRowComponent<APIComponentInMessageActionRow>>(childNode)),
					);
				}
			}
			continue;
		}

		const childNode = getProcessedElement(rawChildNode);
		const childDISJSXType = getDISJSXType(childNode);

		if (childDISJSXType === DISJSX.Content) {
			legacyPayload.content = (legacyPayload.content || "") + processChildrenToString(getProp(childNode, "children"));
		} else if (childDISJSXType === DISJSX.Embed) {
			legacyPayload.embeds?.push(...flattenProcessed(processNode<APIEmbed>(childNode)));
		} else if (childDISJSXType === DISJSX.ActionRow) {
			legacyPayload.components?.push(
				...flattenProcessed(processNode<APIActionRowComponent<APIComponentInMessageActionRow>>(childNode)),
			);
		}
	}

	if (legacyPayload.components?.length === 0) {
		delete legacyPayload.components;
	}
	if (legacyPayload.embeds?.length === 0) {
		delete legacyPayload.embeds;
	}

	return legacyPayload;
};

/**
 * Renders a DISJSX `<Modal>` element and its children into a Discord modal payload object.
 * This function is specifically for converting modal DISJSX trees into usable modal payloads.
 *
 * Modals can contain Label (recommended), TextDisplay, or ActionRow (deprecated for Text Inputs) components.
 *
 * @param modalElement The root `<Modal>` React element or a component that renders to a Modal element.
 * @param options See {@link RenderOptions}.
 * @returns The modal data (`title`, `custom_id`, `components`), ready to pass to `interaction.showModal()`.
 * @throws {DisJSXValidationError} If validation finds errors. Use `validate: false` to skip validation.
 * @throws {TypeError} If the root is not a `<Modal>`, a `<Label>` has no child, or a custom component returns something other than an element.
 * @throws {RangeError} If custom components are nested too deeply.
 */
export const renderDiscordModal = (
	modalElement: ReactElement,
	options: RenderOptions = {},
): APIModalInteractionResponseCallbackData => {
	const { validate = true, onWarning } = options;

	const processedModalElement = getProcessedElement(modalElement);

	if (!processedModalElement || !isDISJSXElement(processedModalElement, DISJSX.Modal)) {
		throw new TypeError(
			`renderDiscordModal expects a root <Modal> element or a component that renders to one. Got: <${getDISJSXType(processedModalElement) ?? "something else"}>`,
		);
	}

	const { props } = processedModalElement;
	const { title, customId } = props;

	if (validate) {
		const validationResult = validateComponent(processedModalElement, false, "modal");
		const customIdErrors = validateUniqueCustomIds(processedModalElement);

		const allErrors = [...validationResult.errors, ...customIdErrors];
		const allWarnings = validationResult.warnings;

		if (allErrors.length > 0) {
			throw new DisJSXValidationError(allErrors);
		}

		allWarnings.forEach((warning) => onWarning?.(warning));
	}

	const childrenArray = Children.toArray(props.children);
	const components: APIModalInteractionResponseCallbackComponent[] = [];

	for (const child of childrenArray) {
		components.push(...flattenProcessed(processNode<APIModalInteractionResponseCallbackComponent>(child)));
	}

	return {
		title,
		custom_id: customId,
		components,
	};
};
