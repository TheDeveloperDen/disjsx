// ! I name this file the "horror" file because it's a horror show :3
// ! I would say "lets split it up like we did with the nodes" but honestly... I'm not sure how to do that.

import { ButtonStyle } from "discord-api-types/v10";
import { DISJSX, isDISJSXElement, resolveElement, type ResolvedElement } from "./disjsxTypes.js";
import { getChildren } from "./children.js";
import {
	type MessageProps,
	type ModalProps,
	type ActionRowProps,
	type AnyButtonProps,
	type ButtonProps,
	type ChannelSelectProps,
	type ContainerProps,
	type EmbedProps,
	type MediaGalleryProps,
	type MentionableSelectProps,
	type RoleSelectProps,
	type SectionProps,
	type StringSelectProps,
	type TextInputProps,
	type UserSelectProps,
	type LabelProps,
	type FileUploadProps,
	type TextDisplayProps,
	type EmbedFieldProps,
} from "./types.js";
import type { ReactElement } from "react";
import { Children, isValidElement, Fragment } from "react";
import { getProcessedElement } from "./utils.js";
import { processChildrenToString } from "./processChildrenToString.js";

/**
 * Represents a validation error or warning found during component validation.
 */
export interface ValidationError {
	/** The severity level of the validation issue */
	type: "error" | "warning";
	/** Human-readable description of the validation issue */
	message: string;
	/** The DISJSX component type where the issue occurred, if applicable */
	component?: string;
	/** Internal component ID for tracking, if applicable */
	componentId?: number;
	/** Path through the component tree where the issue was found */
	path?: string[];
}

/**
 * Result object returned from component validation operations.
 */
/** Thrown by the render functions when `throwOnValidationError` is set. Carries every error for reporting. */
export class DisJSXValidationError extends Error {
	constructor(public readonly errors: ValidationError[]) {
		super(
			`DisJSX validation failed with ${errors.length} error(s):\n${errors
				.map((e) => `  - ${e.message}${e.path ? ` (at ${e.path.join(" > ")})` : ""}`)
				.join("\n")}`,
		);
		this.name = "DisJSXValidationError";
	}
}

export interface ValidationResult {
	/** Whether the component tree passed validation without errors */
	isValid: boolean;
	/** Array of validation errors that must be fixed */
	errors: ValidationError[];
	/** Array of validation warnings that should be addressed */
	warnings: ValidationError[];
}

/**
 * Helper function to expand React Fragments into their children.
 * This allows the validation system to handle <> and </> transparently.
 * @param children Array of React nodes that may contain Fragments
 * @returns Flattened array with Fragment children expanded
 */
const expandFragments = (children: unknown[]): unknown[] => {
	const expanded: unknown[] = [];

	for (const child of children) {
		if (isValidElement(child)) {
			const element = getProcessedElement(child);

			if (element.type === Fragment) {
				expanded.push(...expandFragments(getChildren(element)));
				continue;
			}

			expanded.push(element);
		} else {
			expanded.push(child);
		}
	}

	return expanded;
};

/**
 * Component placement rules based on Discord documentation.
 */
export const COMPONENT_PLACEMENT_RULES = Object.freeze({
	// Top-level components allowed in V2 messages
	V2_MESSAGE_ALLOWED: new Set([
		DISJSX.ActionRow,
		DISJSX.Section,
		DISJSX.TextDisplay,
		DISJSX.Container,
		DISJSX.MediaGallery,
		DISJSX.File,
		DISJSX.Separator,
	]),

	// Top-level components allowed in Legacy messages
	LEGACY_MESSAGE_ALLOWED: new Set([DISJSX.Content, DISJSX.Embed, DISJSX.ActionRow]),

	// Components allowed in Action Rows
	ACTION_ROW_ALLOWED: new Set([
		DISJSX.Button,
		DISJSX.StringSelect,
		DISJSX.UserSelect,
		DISJSX.RoleSelect,
		DISJSX.MentionableSelect,
		DISJSX.ChannelSelect,
	]),

	// Components allowed in Sections (text components)
	SECTION_TEXT_ALLOWED: new Set([DISJSX.TextDisplay]),

	// Components allowed as Section accessories
	SECTION_ACCESSORY_ALLOWED: new Set([DISJSX.Thumbnail, DISJSX.Button]),

	// Components allowed in Containers
	CONTAINER_ALLOWED: new Set([
		DISJSX.ActionRow,
		DISJSX.TextDisplay,
		DISJSX.Section,
		DISJSX.MediaGallery,
		DISJSX.Separator,
		DISJSX.File,
	]),

	// Components allowed in Embeds
	EMBED_ALLOWED: new Set([
		DISJSX.EmbedAuthor,
		DISJSX.EmbedTitle,
		DISJSX.EmbedDescription,
		DISJSX.EmbedFooter,
		DISJSX.EmbedImage,
		DISJSX.EmbedThumbnail,
		DISJSX.EmbedFields,
	]),

	// Components that can only appear once in an embed (singular components)
	EMBED_SINGULAR_COMPONENTS: new Set([
		DISJSX.EmbedAuthor,
		DISJSX.EmbedTitle,
		DISJSX.EmbedFooter,
		DISJSX.EmbedImage,
		DISJSX.EmbedThumbnail,
		DISJSX.EmbedFields,
	]),
});

/**
 * Validation limits based on Discord documentation
 *
 * I think we generally should have a way to easily modify the limits via like a config or something in case you are stuck on an old version
 * but womp womp
 */
export const VALIDATION_LIMITS = Object.freeze({
	MESSAGE_V2_MAX_COMPONENTS: 40,
	MESSAGE_LEGACY_MAX_ACTION_ROWS: 5,
	ACTION_ROW_MAX_BUTTONS: 5,
	ACTION_ROW_MAX_SELECTS: 1,
	STRING_SELECT_MAX_OPTIONS: 25,
	SELECT_MIN_VALUES_MIN: 0,
	SELECT_MIN_VALUES_MAX: 25,
	SELECT_MAX_VALUES_MIN: 1,
	SELECT_MAX_VALUES_MAX: 25,
	MEDIA_GALLERY_MIN_ITEMS: 1,
	MEDIA_GALLERY_MAX_ITEMS: 10,
	SECTION_MIN_TEXT_COMPONENTS: 1,
	SECTION_MAX_TEXT_COMPONENTS: 3,
	EMBED_MAX_FIELDS: 25,
	BUTTON_LABEL_MAX_LENGTH: 80,
	SELECT_PLACEHOLDER_MAX_LENGTH: 150,
	TEXT_INPUT_MAX_LENGTH: 4000,
	CUSTOM_ID_MAX_LENGTH: 100,
	EMBED_TITLE_MAX_LENGTH: 256,
	EMBED_DESCRIPTION_MAX_LENGTH: 4096,
	EMBED_FIELD_NAME_MAX_LENGTH: 256,
	EMBED_FIELD_VALUE_MAX_LENGTH: 1024,
	EMBED_AUTHOR_NAME_MAX_LENGTH: 256,
	EMBED_FOOTER_TEXT_MAX_LENGTH: 2048,
	EMBED_TOTAL_CHARACTERS_MAX: 6000,
	THUMBNAIL_DESCRIPTION_MAX_LENGTH: 1024,
	MEDIA_DESCRIPTION_MAX_LENGTH: 1024,
	MODAL_TITLE_MAX_LENGTH: 45,
	MESSAGE_CONTENT_MAX_LENGTH: 2000,
	MESSAGE_MAX_EMBEDS: 10,
	ATTACHMENT_DESCRIPTION_MAX_LENGTH: 1024,
});

/**
 * Validates DISJSX component trees against Discord API requirements.
 */
export class ComponentValidator {
	private errors: ValidationError[] = [];
	private warnings: ValidationError[] = [];
	private componentCount = 0;
	private path: string[] = [];

	/**
	 * Validates a DISJSX component tree for messages or modals.
	 * @param element The root React element to validate (Message or Modal)
	 * @param isV2 Whether to validate as a V2 message format
	 * @param context The validation context - "message" or "modal"
	 * @returns ValidationResult containing validation status, errors, and warnings
	 */
	public validate(
		element: ReactElement<MessageProps | ModalProps>,
		isV2: boolean = false,
		context: "message" | "modal" = "message",
	): ValidationResult {
		const processedElement = getProcessedElement(element);

		if (context === "modal") {
			if (!isDISJSXElement(processedElement, DISJSX.Modal)) {
				this.addError("Root element must be a Modal component for modal context");

				return this.getResult();
			}

			this.validateModal(processedElement);
		} else {
			if (!isDISJSXElement(processedElement, DISJSX.Message)) {
				this.addError("Root element must be a Message component");
				return this.getResult();
			}

			this.validateMessage(processedElement, isV2, context);
		}

		return this.getResult();
	}

	/**
	 * Validates a Modal component and its children.
	 * @param element The Modal component to validate
	 */
	private validateModal(element: ReactElement<ModalProps>) {
		this.path.push("Modal");
		const props = element.props;

		if (!props.title) {
			this.addError("Modal must have a title property");
		} else if (props.title.length > VALIDATION_LIMITS.MODAL_TITLE_MAX_LENGTH) {
			this.addError(`Modal title cannot exceed ${VALIDATION_LIMITS.MODAL_TITLE_MAX_LENGTH} characters`);
		}

		if (!props.customId) {
			this.addError("Modal must have a customId property");
		} else if (props.customId.length > VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH) {
			this.addError(`Modal customId cannot exceed ${VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH} characters`);
		}

		const children = Children.toArray(props.children);

		this.validateModalComponents(children);

		this.path.pop();
	}

	/**
	 * Validates a Message component for V2 or legacy format.
	 * @param element The Message component to validate
	 * @param isV2 Whether to validate as V2 format
	 * @param context The validation context
	 */
	private validateMessage(element: ReactElement<MessageProps>, isV2: boolean, context: "message" | "modal") {
		this.path.push("Message");
		const children = Children.toArray(element.props.children);

		const embeds: ReactElement<EmbedProps>[] = [];

		for (const child of children) {
			if (isValidElement(child)) {
				const processedChild = getProcessedElement(child);

				if (isDISJSXElement(processedChild, DISJSX.Embed)) {
					embeds.push(processedChild);
				}
			}
		}

		if (embeds.length > VALIDATION_LIMITS.MESSAGE_MAX_EMBEDS) {
			this.addError(`Message cannot have more than ${VALIDATION_LIMITS.MESSAGE_MAX_EMBEDS} embeds`);
		}

		if (embeds.length > 0) {
			this.validateEmbedTotalCharacterCount(embeds);
		}

		if (context === "modal") {
			this.validateModalComponents(children);
		} else {
			if (isV2) {
				this.validateV2MessageComponents(children);
			} else {
				this.validateLegacyMessageComponents(children);
			}
		}

		this.path.pop();
	}

	/**
	 * Validates components within a modal (Label, TextDisplay, ActionRow, or FileUpload).
	 * @param children The modal's child components
	 */
	private validateModalComponents(children: unknown[]) {
		const expandedChildren = expandFragments(children);

		for (const child of expandedChildren) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));

			switch (resolved?.kind) {
				case DISJSX.ActionRow: {
					// Legacy ActionRow support (deprecated for new modals)
					this.validateActionRowForModal(resolved.element);
					break;
				}

				case DISJSX.Label: {
					this.validateLabel(resolved.element);
					break;
				}

				case DISJSX.TextDisplay: {
					this.validateTextDisplay(resolved.element);
					break;
				}

				case DISJSX.FileUpload: {
					this.validateFileUpload(resolved.element);
					break;
				}

				default: {
					this.addError(
						"Modals can only contain Label, TextDisplay, FileUpload, or ActionRow (deprecated) components",
						resolved?.kind,
					);
				}
			}
		}
	}

	/**
	 * Validates ActionRow components specifically for modal context.
	 * @param element The ActionRow component to validate
	 */
	private validateActionRowForModal(element: ReactElement<ActionRowProps>) {
		this.path.push("ActionRow");
		const children = Children.toArray(element.props.children);

		if (children.length !== 1) {
			this.addError("Action Rows in modals must contain exactly one Text Input component");
		}

		for (const child of children) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));

			if (resolved?.kind !== DISJSX.TextInput) {
				this.addError("Action Rows in modals can only contain Text Input components", resolved?.kind);
			} else {
				this.validateTextInput(resolved.element);
			}
		}

		this.path.pop();
	}

	/**
	 * Validates components for V2 message format.
	 * @param children The message's child components
	 */
	private validateV2MessageComponents(children: unknown[]) {
		let contentLength = 0;
		const expandedChildren = expandFragments(children);

		for (const child of expandedChildren) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));
			const childType = resolved?.kind;

			if (resolved?.kind === DISJSX.TextDisplay) {
				const content = typeof resolved.element.props.children === "string" ? resolved.element.props.children : "";

				contentLength += content.length;
			}

			if (!resolved || !COMPONENT_PLACEMENT_RULES.V2_MESSAGE_ALLOWED.has(resolved.kind)) {
				this.addError(`Component type ${childType} is not allowed in V2 messages`, childType);
				continue;
			}

			this.componentCount++;

			if (this.componentCount > VALIDATION_LIMITS.MESSAGE_V2_MAX_COMPONENTS) {
				this.addError(`V2 messages can have at most ${VALIDATION_LIMITS.MESSAGE_V2_MAX_COMPONENTS} components`);
				break;
			}

			this.validateComponent(resolved);
		}

		if (contentLength > VALIDATION_LIMITS.MESSAGE_CONTENT_MAX_LENGTH) {
			this.addError(`Message content cannot exceed ${VALIDATION_LIMITS.MESSAGE_CONTENT_MAX_LENGTH} characters`);
		}
	}

	/**
	 * Validates components for legacy message format.
	 * @param children The message's child components
	 */
	private validateLegacyMessageComponents(children: unknown[]) {
		let actionRowCount = 0;
		let contentLength = 0;
		const expandedChildren = expandFragments(children);

		for (const child of expandedChildren) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));
			const childType = resolved?.kind;

			if (resolved?.kind === DISJSX.Content) {
				const content = typeof resolved.element.props.children === "string" ? resolved.element.props.children : "";

				contentLength += content.length;
			}

			if (!resolved || !COMPONENT_PLACEMENT_RULES.LEGACY_MESSAGE_ALLOWED.has(resolved.kind)) {
				this.addError(`Component type ${childType} is not allowed in Legacy messages`, childType);
				continue;
			}

			if (resolved.kind === DISJSX.ActionRow) {
				actionRowCount++;
				if (actionRowCount > VALIDATION_LIMITS.MESSAGE_LEGACY_MAX_ACTION_ROWS) {
					this.addError(
						`Legacy messages can have at most ${VALIDATION_LIMITS.MESSAGE_LEGACY_MAX_ACTION_ROWS} Action Rows`,
					);
					break;
				}
			}

			this.validateComponent(resolved);
		}

		if (contentLength > VALIDATION_LIMITS.MESSAGE_CONTENT_MAX_LENGTH) {
			this.addError(`Message content cannot exceed ${VALIDATION_LIMITS.MESSAGE_CONTENT_MAX_LENGTH} characters`);
		}
	}

	/**
	 * Dispatches validation to the appropriate method based on component type.
	 * @param element The component to validate
	 * @param disjsxType The DISJSX component type
	 */
	private validateComponent(resolved: ResolvedElement) {
		switch (resolved.kind) {
			case DISJSX.ActionRow: {
				this.validateActionRow(resolved.element);
				break;
			}

			case DISJSX.Button: {
				this.validateButton(resolved.element);
				break;
			}

			case DISJSX.StringSelect: {
				this.validateStringSelect(resolved.element);
				break;
			}

			case DISJSX.UserSelect:
			case DISJSX.RoleSelect:
			case DISJSX.MentionableSelect:
			case DISJSX.ChannelSelect: {
				this.validateAutoPopulatedSelect(resolved.element, resolved.kind);
				break;
			}

			case DISJSX.Section: {
				this.validateSection(resolved.element);
				break;
			}

			case DISJSX.Container: {
				this.validateContainer(resolved.element);
				break;
			}

			case DISJSX.MediaGallery: {
				this.validateMediaGallery(resolved.element);
				break;
			}

			case DISJSX.Embed: {
				this.validateEmbed(resolved.element);
				break;
			}

			case DISJSX.TextInput: {
				this.validateTextInput(resolved.element);
				break;
			}
		}
	}

	/**
	 * Validates ActionRow components and their children.
	 * @param element The ActionRow component to validate
	 */
	private validateActionRow(element: ReactElement<ActionRowProps>) {
		this.path.push("ActionRow");
		const children = Children.toArray(element.props.children);
		const expandedChildren = expandFragments(children);

		if (expandedChildren.length === 0) {
			this.addError("Action Row cannot be empty");
			this.path.pop();
			return;
		}

		const childTypes: DISJSX[] = [];
		let buttonCount = 0;
		let selectCount = 0;

		for (const child of expandedChildren) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));
			const childType = resolved?.kind;

			if (!resolved || !COMPONENT_PLACEMENT_RULES.ACTION_ROW_ALLOWED.has(resolved.kind)) {
				this.addError(`Component type ${childType} is not allowed in Action Rows`, childType);
				continue;
			}

			childTypes.push(resolved.kind);

			if (resolved.kind === DISJSX.Button) {
				buttonCount++;
			} else if (
				[
					DISJSX.StringSelect,
					DISJSX.UserSelect,
					DISJSX.RoleSelect,
					DISJSX.MentionableSelect,
					DISJSX.ChannelSelect,
				].includes(resolved.kind)
			) {
				selectCount++;
			}

			this.validateComponent(resolved);
		}

		if (buttonCount > VALIDATION_LIMITS.ACTION_ROW_MAX_BUTTONS) {
			this.addError(`Action Row can contain at most ${VALIDATION_LIMITS.ACTION_ROW_MAX_BUTTONS} buttons`);
		}

		if (selectCount > VALIDATION_LIMITS.ACTION_ROW_MAX_SELECTS) {
			this.addError(`Action Row can contain at most ${VALIDATION_LIMITS.ACTION_ROW_MAX_SELECTS} select menu`);
		}

		if (buttonCount > 0 && selectCount > 0) {
			this.addError("Action Row cannot contain both buttons and select menus");
		}

		this.path.pop();
	}

	/**
	 * Validates Button components based on their style and properties.
	 * @param element The Button component to validate
	 */
	private validateButton(element: ReactElement<ButtonProps>) {
		this.path.push("Button");
		const props: AnyButtonProps = element.props;

		switch (props.style) {
			case ButtonStyle.Link: {
				if (!props.url) {
					this.addError("Link buttons must have a url property");
				}
				if (props.customId) {
					this.addWarning("Link buttons should not have customId (it will be ignored)");
				}
				break;
			}

			case ButtonStyle.Premium: {
				if (!props.skuId) {
					this.addError("Premium buttons must have a skuId property");
				}

				if (props.customId || props.label || props.url || props.emoji) {
					this.addWarning("Premium buttons should not have customId, label, url, or emoji properties");
				}

				break;
			}

			case ButtonStyle.Primary:
			case ButtonStyle.Secondary:
			case ButtonStyle.Success:
			case ButtonStyle.Danger: {
				if (!props.customId) {
					this.addError("Interactive buttons must have a customId property");
				}

				if (props.url) {
					this.addWarning("Interactive buttons should not have url property");
				}

				if (props.skuId) {
					this.addWarning("Interactive buttons should not have skuId property");
				}

				break;
			}
		}

		const label = props.label || (typeof props.children === "string" ? props.children : "");

		if (label && label.length > VALIDATION_LIMITS.BUTTON_LABEL_MAX_LENGTH) {
			this.addError(`Button label cannot exceed ${VALIDATION_LIMITS.BUTTON_LABEL_MAX_LENGTH} characters`);
		}

		if (props.customId && props.customId.length > VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH) {
			this.addError(`Button customId cannot exceed ${VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH} characters`);
		}

		this.path.pop();
	}

	/**
	 * Validates StringSelect components and their options.
	 * @param element The StringSelect component to validate
	 */
	private validateStringSelect(element: ReactElement<StringSelectProps>) {
		this.path.push("StringSelect");
		const props = element.props;
		const children = Children.toArray(props.children);

		if (!props.customId) {
			this.addError("String Select must have a customId property");
		} else if (props.customId.length > VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH) {
			this.addError(`String Select customId cannot exceed ${VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH} characters`);
		}

		if (children.length === 0) {
			this.addError("String Select must have at least one option");
		} else if (children.length > VALIDATION_LIMITS.STRING_SELECT_MAX_OPTIONS) {
			this.addError(`String Select cannot have more than ${VALIDATION_LIMITS.STRING_SELECT_MAX_OPTIONS} options`);
		}

		this.validateSelectValues(props.minValues, props.maxValues, children.length);

		if (props.placeholder && props.placeholder.length > VALIDATION_LIMITS.SELECT_PLACEHOLDER_MAX_LENGTH) {
			this.addError(
				`String Select placeholder cannot exceed ${VALIDATION_LIMITS.SELECT_PLACEHOLDER_MAX_LENGTH} characters`,
			);
		}

		this.path.pop();
	}

	/**
	 * Validates auto-populated select components (User, Role, Mentionable, Channel).
	 * @param element The select component to validate
	 * @param selectType The type of select component
	 */
	private validateAutoPopulatedSelect(
		element: ReactElement<UserSelectProps | RoleSelectProps | MentionableSelectProps | ChannelSelectProps>,
		selectType: DISJSX,
	) {
		this.path.push(selectType);
		const props = element.props;

		if (!props.customId) {
			this.addError(`${selectType} must have a customId property`);
		} else if (props.customId.length > VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH) {
			this.addError(`${selectType} customId cannot exceed ${VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH} characters`);
		}

		this.validateSelectValues(props.minValues, props.maxValues);

		if (props.placeholder && props.placeholder.length > VALIDATION_LIMITS.SELECT_PLACEHOLDER_MAX_LENGTH) {
			this.addError(
				`${selectType} placeholder cannot exceed ${VALIDATION_LIMITS.SELECT_PLACEHOLDER_MAX_LENGTH} characters`,
			);
		}

		this.path.pop();
	}

	/**
	 * Validates minValues and maxValues for select components.
	 * @param minValues The minimum number of selections
	 * @param maxValues The maximum number of selections
	 * @param optionCount The total number of available options
	 */
	private validateSelectValues(minValues?: number, maxValues?: number, optionCount?: number) {
		if (minValues !== undefined) {
			if (minValues < VALIDATION_LIMITS.SELECT_MIN_VALUES_MIN || minValues > VALIDATION_LIMITS.SELECT_MIN_VALUES_MAX) {
				this.addError(
					`minValues must be between ${VALIDATION_LIMITS.SELECT_MIN_VALUES_MIN} and ${VALIDATION_LIMITS.SELECT_MIN_VALUES_MAX}`,
				);
			}
		}

		if (maxValues !== undefined) {
			if (maxValues < VALIDATION_LIMITS.SELECT_MAX_VALUES_MIN || maxValues > VALIDATION_LIMITS.SELECT_MAX_VALUES_MAX) {
				this.addError(
					`maxValues must be between ${VALIDATION_LIMITS.SELECT_MAX_VALUES_MIN} and ${VALIDATION_LIMITS.SELECT_MAX_VALUES_MAX}`,
				);
			}
		}

		if (minValues !== undefined && maxValues !== undefined) {
			if (minValues > maxValues) {
				this.addError("minValues cannot be greater than maxValues");
			}
		}

		if (optionCount !== undefined && maxValues !== undefined && maxValues > optionCount) {
			this.addError("maxValues cannot be greater than the number of available options");
		}
	}

	/**
	 * Validates Section components and their text/accessory children.
	 * @param element The Section component to validate
	 */
	private validateSection(element: ReactElement<SectionProps>) {
		this.path.push("Section");
		const children = Children.toArray(element.props.children);
		const expandedChildren = expandFragments(children);

		const textComponents: ResolvedElement[] = [];
		let accessoryComponent: ResolvedElement | null = null;

		for (const child of expandedChildren) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));

			if (resolved && COMPONENT_PLACEMENT_RULES.SECTION_TEXT_ALLOWED.has(resolved.kind)) {
				textComponents.push(resolved);
			} else if (resolved && COMPONENT_PLACEMENT_RULES.SECTION_ACCESSORY_ALLOWED.has(resolved.kind)) {
				if (accessoryComponent) {
					this.addError("Section can have only one accessory component");
				} else {
					accessoryComponent = resolved;
				}
			} else {
				this.addError(`Component type ${resolved?.kind} is not allowed in Sections`, resolved?.kind);
			}
		}

		if (textComponents.length < VALIDATION_LIMITS.SECTION_MIN_TEXT_COMPONENTS) {
			this.addError(`Section must have at least ${VALIDATION_LIMITS.SECTION_MIN_TEXT_COMPONENTS} text component`);
		} else if (textComponents.length > VALIDATION_LIMITS.SECTION_MAX_TEXT_COMPONENTS) {
			this.addError(`Section cannot have more than ${VALIDATION_LIMITS.SECTION_MAX_TEXT_COMPONENTS} text components`);
		}

		for (const textComponent of textComponents) {
			this.validateComponent(textComponent);
		}

		if (accessoryComponent) {
			this.validateComponent(accessoryComponent);
		} else {
			this.addError("Section must have an accessory component (Thumbnail or Button)");
		}

		this.path.pop();
	}

	/**
	 * Validates Container components and their children.
	 * @param element The Container component to validate
	 */
	private validateContainer(element: ReactElement<ContainerProps>) {
		this.path.push("Container");
		const children = Children.toArray(element.props.children);
		const expandedChildren = expandFragments(children);

		for (const child of expandedChildren) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));

			if (!resolved || !COMPONENT_PLACEMENT_RULES.CONTAINER_ALLOWED.has(resolved.kind)) {
				this.addError(`Component type ${resolved?.kind} is not allowed in Containers`, resolved?.kind);
				continue;
			}

			this.validateComponent(resolved);
		}

		this.path.pop();
	}

	/**
	 * Validates MediaGallery components and item count limits.
	 * @param element The MediaGallery component to validate
	 */
	private validateMediaGallery(element: ReactElement<MediaGalleryProps>) {
		this.path.push("MediaGallery");
		const children = Children.toArray(element.props.children);

		if (children.length < VALIDATION_LIMITS.MEDIA_GALLERY_MIN_ITEMS) {
			this.addError(`Media Gallery must have at least ${VALIDATION_LIMITS.MEDIA_GALLERY_MIN_ITEMS} item`);
		} else if (children.length > VALIDATION_LIMITS.MEDIA_GALLERY_MAX_ITEMS) {
			this.addError(`Media Gallery cannot have more than ${VALIDATION_LIMITS.MEDIA_GALLERY_MAX_ITEMS} items`);
		}

		this.path.pop();
	}

	/**
	 * Validates Embed components and their properties.
	 * @param element The Embed component to validate
	 */
	private validateEmbed(element: ReactElement<EmbedProps>) {
		this.path.push("Embed");
		const props = element.props;

		if (props.title && props.title.length > VALIDATION_LIMITS.EMBED_TITLE_MAX_LENGTH) {
			this.addError(`Embed title cannot exceed ${VALIDATION_LIMITS.EMBED_TITLE_MAX_LENGTH} characters`);
		}

		if (props.description && props.description.length > VALIDATION_LIMITS.EMBED_DESCRIPTION_MAX_LENGTH) {
			this.addError(`Embed description cannot exceed ${VALIDATION_LIMITS.EMBED_DESCRIPTION_MAX_LENGTH} characters`);
		}

		this.validateEmbedChildren(element);

		this.path.pop();
	}

	/**
	 * Validates Embed children and enforces singular component rules.
	 * @param element The Embed component whose children to validate
	 */
	private validateEmbedChildren(element: ReactElement<EmbedProps>) {
		const children = Children.toArray(element.props.children);
		let fieldCount = 0;

		const singularComponentCounts = new Map<DISJSX, number>();

		for (const child of children) {
			if (!isValidElement(child)) {
				continue;
			}

			const resolved = resolveElement(getProcessedElement(child));

			if (!resolved || !COMPONENT_PLACEMENT_RULES.EMBED_ALLOWED.has(resolved.kind)) {
				this.addError(`Component type ${resolved?.kind} is not allowed in Embeds`, resolved?.kind);
				continue;
			}

			if (COMPONENT_PLACEMENT_RULES.EMBED_SINGULAR_COMPONENTS.has(resolved.kind)) {
				const currentCount = singularComponentCounts.get(resolved.kind) || 0;

				singularComponentCounts.set(resolved.kind, currentCount + 1);

				if (currentCount >= 1) {
					this.addError(`Embed can only contain one ${resolved.kind} component`, resolved.kind);
				}
			}

			switch (resolved.kind) {
				case DISJSX.EmbedAuthor: {
					const authorProps = resolved.element.props;

					if (authorProps.name && authorProps.name.length > VALIDATION_LIMITS.EMBED_AUTHOR_NAME_MAX_LENGTH) {
						this.addError(
							`Embed author name cannot exceed ${VALIDATION_LIMITS.EMBED_AUTHOR_NAME_MAX_LENGTH} characters`,
						);
					}
					break;
				}
				case DISJSX.EmbedFooter: {
					const footerProps = resolved.element.props;
					const footerText = footerProps.text || (typeof footerProps.children === "string" ? footerProps.children : "");

					if (footerText && footerText.length > VALIDATION_LIMITS.EMBED_FOOTER_TEXT_MAX_LENGTH) {
						this.addError(
							`Embed footer text cannot exceed ${VALIDATION_LIMITS.EMBED_FOOTER_TEXT_MAX_LENGTH} characters`,
						);
					}
					break;
				}
				case DISJSX.EmbedFields: {
					const fieldsChildren = Children.toArray(resolved.element.props.children);

					for (const fieldChild of fieldsChildren) {
						if (isValidElement(fieldChild)) {
							const processedFieldChild = getProcessedElement(fieldChild);

							if (isDISJSXElement(processedFieldChild, DISJSX.EmbedField)) {
								fieldCount++;
								this.validateEmbedField(processedFieldChild);
							}
						}
					}
					break;
				}
			}
		}

		if (fieldCount > VALIDATION_LIMITS.EMBED_MAX_FIELDS) {
			this.addError(`Embed cannot have more than ${VALIDATION_LIMITS.EMBED_MAX_FIELDS} fields`);
		}
	}

	/**
	 * Validates individual embed field name and value lengths.
	 * @param element The EmbedField component to validate
	 */
	private validateEmbedField(element: ReactElement<EmbedFieldProps>) {
		const fieldProps = element.props;

		let fieldName = fieldProps.title || "";
		let fieldValue = fieldProps.value || "";

		const children = Children.toArray(fieldProps.children);

		for (const child of children) {
			if (isValidElement(child)) {
				const resolved = resolveElement(getProcessedElement(child));

				if (resolved?.kind === DISJSX.EmbedFieldTitle && !fieldName) {
					fieldName = typeof resolved.element.props.children === "string" ? resolved.element.props.children : "";
				} else if (resolved?.kind === DISJSX.EmbedFieldValue && !fieldValue) {
					fieldValue = typeof resolved.element.props.children === "string" ? resolved.element.props.children : "";
				}
			}
		}

		if (fieldName && fieldName.length > VALIDATION_LIMITS.EMBED_FIELD_NAME_MAX_LENGTH) {
			this.addError(`Embed field name cannot exceed ${VALIDATION_LIMITS.EMBED_FIELD_NAME_MAX_LENGTH} characters`);
		}

		if (fieldValue && fieldValue.length > VALIDATION_LIMITS.EMBED_FIELD_VALUE_MAX_LENGTH) {
			this.addError(`Embed field value cannot exceed ${VALIDATION_LIMITS.EMBED_FIELD_VALUE_MAX_LENGTH} characters`);
		}
	}

	/**
	 * Validates TextInput components for modals.
	 * @param element The TextInput component to validate
	 */
	private validateTextInput(element: ReactElement<TextInputProps>) {
		this.path.push("TextInput");
		const props = element.props;

		if (!props.customId) {
			this.addError("Text Input must have a customId property");
		} else if (props.customId.length > VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH) {
			this.addError(`Text Input customId cannot exceed ${VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH} characters`);
		}

		if (props.minLength !== undefined && props.maxLength !== undefined) {
			if (props.minLength > props.maxLength) {
				this.addError("Text Input minLength cannot be greater than maxLength");
			}
		}

		if (props.maxLength !== undefined && props.maxLength > VALIDATION_LIMITS.TEXT_INPUT_MAX_LENGTH) {
			this.addError(`Text Input maxLength cannot exceed ${VALIDATION_LIMITS.TEXT_INPUT_MAX_LENGTH} characters`);
		}

		if (props.value && props.value.length > VALIDATION_LIMITS.TEXT_INPUT_MAX_LENGTH) {
			this.addError(`Text Input value cannot exceed ${VALIDATION_LIMITS.TEXT_INPUT_MAX_LENGTH} characters`);
		}

		this.path.pop();
	}

	/**
	 * Validates Label components for modals.
	 * @param element The Label component to validate
	 */
	private validateLabel(element: ReactElement<LabelProps>) {
		this.path.push("Label");
		const props = element.props;

		if (!props.label) {
			this.addError("Label must have a label property");
		} else if (props.label.length > 45) {
			this.addError("Label label cannot exceed 45 characters");
		}

		if (props.description && props.description.length > 100) {
			this.addError("Label description cannot exceed 100 characters");
		}

		// Validate the child component
		const children = Children.toArray(props.children);

		if (children.length === 0) {
			this.addError("Label must contain a child component (TextInput, Select, or FileUpload)");
		} else {
			for (const child of children) {
				if (!isValidElement(child)) {
					continue;
				}

				const resolved = resolveElement(getProcessedElement(child));

				switch (resolved?.kind) {
					case DISJSX.TextInput: {
						this.validateTextInput(resolved.element);
						break;
					}

					case DISJSX.StringSelect: {
						this.validateStringSelect(resolved.element);
						break;
					}

					case DISJSX.UserSelect:
					case DISJSX.RoleSelect:
					case DISJSX.MentionableSelect:
					case DISJSX.ChannelSelect: {
						this.validateAutoPopulatedSelect(resolved.element, resolved.kind);
						break;
					}

					case DISJSX.FileUpload: {
						this.validateFileUpload(resolved.element);
						break;
					}

					default: {
						this.addError("Label can only contain TextInput, Select, or FileUpload components", resolved?.kind);
					}
				}
			}
		}

		this.path.pop();
	}

	/**
	 * Validates FileUpload components for modals.
	 * @param element The FileUpload component to validate
	 */
	private validateFileUpload(element: ReactElement<FileUploadProps>) {
		this.path.push("FileUpload");
		const props = element.props;

		if (!props.customId) {
			this.addError("FileUpload must have a customId property");
		} else if (props.customId.length > VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH) {
			this.addError(`FileUpload customId cannot exceed ${VALIDATION_LIMITS.CUSTOM_ID_MAX_LENGTH} characters`);
		}

		if (props.minValues !== undefined && (props.minValues < 0 || props.minValues > 10)) {
			this.addError("FileUpload minValues must be between 0 and 10");
		}

		if (props.maxValues !== undefined && (props.maxValues < 1 || props.maxValues > 10)) {
			this.addError("FileUpload maxValues must be between 1 and 10");
		}

		if (props.minValues !== undefined && props.maxValues !== undefined && props.minValues > props.maxValues) {
			this.addError("FileUpload minValues cannot be greater than maxValues");
		}

		this.path.pop();
	}

	/**
	 * Validates TextDisplay components.
	 * @param element The TextDisplay component to validate
	 */
	private validateTextDisplay(element: ReactElement<TextDisplayProps>) {
		this.path.push("TextDisplay");
		const props = element.props;

		if (props.children) {
			const content = processChildrenToString(props.children);

			if (content.length > VALIDATION_LIMITS.MESSAGE_CONTENT_MAX_LENGTH) {
				this.addError(`TextDisplay content cannot exceed ${VALIDATION_LIMITS.MESSAGE_CONTENT_MAX_LENGTH} characters`);
			}
		}

		this.path.pop();
	}

	/**
	 * Validates total character count across all embeds in a message.
	 * @param embeds Array of embed components to validate
	 */
	private validateEmbedTotalCharacterCount(embeds: ReactElement<EmbedProps>[]) {
		let totalCharacters = 0;

		for (const embed of embeds) {
			const props = embed.props;

			if (props.title) {
				totalCharacters += props.title.length;
			}

			if (props.description) {
				totalCharacters += props.description.length;
			}

			const children = Children.toArray(props.children);

			for (const child of children) {
				if (!isValidElement(child)) {
					continue;
				}

				const resolved = resolveElement(getProcessedElement(child));

				switch (resolved?.kind) {
					case DISJSX.EmbedAuthor: {
						const authorProps = resolved.element.props;

						if (authorProps.name) {
							totalCharacters += authorProps.name.length;
						}
						break;
					}
					case DISJSX.EmbedFooter: {
						const footerProps = resolved.element.props;
						const footerText =
							footerProps.text || (typeof footerProps.children === "string" ? footerProps.children : "");

						if (footerText) {
							totalCharacters += footerText.length;
						}
						break;
					}
					case DISJSX.EmbedFields: {
						const fieldsChildren = Children.toArray(resolved.element.props.children);

						for (const fieldChild of fieldsChildren) {
							if (isValidElement(fieldChild)) {
								const processedFieldChild = getProcessedElement(fieldChild);

								if (isDISJSXElement(processedFieldChild, DISJSX.EmbedField)) {
									const fieldProps = processedFieldChild.props;

									let fieldName = fieldProps.title || "";
									let fieldValue = fieldProps.value || "";

									const fieldChildren = Children.toArray(fieldProps.children);

									for (const subChild of fieldChildren) {
										if (isValidElement(subChild)) {
											const resolvedSub = resolveElement(getProcessedElement(subChild));

											if (resolvedSub?.kind === DISJSX.EmbedFieldTitle && !fieldName) {
												fieldName =
													typeof resolvedSub.element.props.children === "string"
														? resolvedSub.element.props.children
														: "";
											} else if (resolvedSub?.kind === DISJSX.EmbedFieldValue && !fieldValue) {
												fieldValue =
													typeof resolvedSub.element.props.children === "string"
														? resolvedSub.element.props.children
														: "";
											}
										}
									}

									if (fieldName) {
										totalCharacters += fieldName.length;
									}
									if (fieldValue) {
										totalCharacters += fieldValue.length;
									}
								}
							}
						}
						break;
					}
				}
			}
		}

		if (totalCharacters > VALIDATION_LIMITS.EMBED_TOTAL_CHARACTERS_MAX) {
			this.addError(
				`Total character count across all embeds cannot exceed ${VALIDATION_LIMITS.EMBED_TOTAL_CHARACTERS_MAX} characters`,
			);
		}
	}

	/**
	 * Adds a validation error to the results.
	 * @param message The error message
	 * @param component The component type where the error occurred
	 */
	private addError(message: string, component?: string) {
		this.errors.push({
			type: "error",
			message,
			component,
			path: [...this.path],
		});
	}

	/**
	 * Adds a validation warning to the results.
	 * @param message The warning message
	 * @param component The component type where the warning occurred
	 */
	private addWarning(message: string, component?: string) {
		this.warnings.push({
			type: "warning",
			message,
			component,
			path: [...this.path],
		});
	}

	/**
	 * Returns the final validation result.
	 * @returns The complete validation result with errors and warnings
	 */
	private getResult(): ValidationResult {
		return {
			isValid: this.errors.length === 0,
			errors: this.errors,
			warnings: this.warnings,
		};
	}
}

/**
 * Validates a DISJSX component tree before rendering.
 * @param element The root React element to validate (Message or Modal component)
 * @param isV2 Whether to validate as a V2 message format
 * @param context The validation context - "message" or "modal"
 * @returns ValidationResult containing validation status, errors, and warnings
 */
export const validateComponent = (
	element: ReactElement<MessageProps | ModalProps>,
	isV2: boolean = false,
	context: "message" | "modal" = "message",
): ValidationResult => {
	const validator = new ComponentValidator();

	return validator.validate(element, isV2, context);
};

/**
 * Validates that all customId properties within a component tree are unique.
 * @param element The root React element to check for duplicate customIds
 * @returns Array of validation errors for any duplicate customIds found
 */
export const validateUniqueCustomIds = (element: ReactElement): ValidationError[] => {
	const customIds = new Set<string | undefined>();
	const errors: ValidationError[] = [];

	const checkElement = (node: unknown, path: string[] = []) => {
		if (!isValidElement(node)) {
			return;
		}

		const processedNode = getProcessedElement(node);
		const resolved = resolveElement(processedNode);
		const disjsxType = resolved?.kind;

		if (resolved && "customId" in resolved.element.props) {
			const { customId } = resolved.element.props;

			if (customIds.has(customId)) {
				errors.push({
					type: "error",
					message: `Duplicate customId "${customId}" found. Custom IDs must be unique within a message.`,
					component: disjsxType,
					path: [...path],
				});
			} else {
				customIds.add(customId);
			}
		}

		getChildren(processedNode).forEach((child, index) => {
			checkElement(child, [...path, disjsxType || "Unknown", index.toString()]);
		});
	};

	checkElement(element);

	return errors;
};
