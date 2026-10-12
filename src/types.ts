/* eslint-disable @typescript-eslint/no-empty-object-type */

import type {
	APIActionRowComponent,
	APIComponentInMessageActionRow,
	APIEmbed,
	APIMessageTopLevelComponent,
	APISelectMenuDefaultValue,
	ButtonStyle,
	ChannelType,
	SelectMenuDefaultValueType,
	TextInputStyle,
} from "discord-api-types/v10";
import type { ReactElement } from "react";

import type { ReactNode } from "react";

/**
 * Some default colors for embeds to help you get started.
 */
export enum Colors {
	/** Hex: #5865F2 */
	Blurple = 0x5865f2,

	/** Hex: #ED4245 */
	Red = 0xed4245,

	/** Hex: #57F287 */
	Green = 0x57f287,

	/** Hex: #FEE75C */
	Yellow = 0xfee75c,

	/** Hex: #9B59B6 */
	Purple = 0x9b59b6,

	/** Hex: #E91E63 */
	Pink = 0xe91e63,

	/** Hex: #E67E22 */
	Orange = 0xe67e22,

	/** Hex: #3498DB */
	Blue = 0x3498db,

	/** Hex: #FFD700 */
	Gold = 0xffd700,

	/** Hex: #1ABC9C */
	Aqua = 0x1abc9c,

	/** Hex: #FFFFFF */
	White = 0xffffff,

	/** Hex: #E0E3FF - Discord's "Light Blurple" */
	LightBlurple = 0xe0e3ff,

	/** Hex: #2C2F33 - Discord's Embed Background (Dark Theme) */
	EmbedDarkBackground = 0x2c2f33,

	/** Hex: #000000 - True Black */
	TrueBlack = 0x000000,
}

/**
 * Represents a partial emoji object.
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
interface EmojiObject {
	/** Emoji ID. */
	id?: string;
	/** Emoji name. */
	name?: string;
	/** Whether this emoji is animated. */
	animated?: boolean;
}

/**
 * Props for the ActionRow component.
 * An Action Row is a top-level layout component used in messages and modals.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-row}
 */
export interface ActionRowProps {
	/**
	 * Child components. Can contain:
	 * - Up to 5 contextually grouped Buttons.
	 * - A single Text Input (for modals).
	 * - A single Select Menu (String, User, Role, Mentionable, or Channel).
	 */
	children: React.ReactNode;
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * Props for the Section component.
 * A Section is a top-level layout component that allows joining text contextually with an accessory.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#section}
 */
export interface SectionProps {
	/**
	 * Child components, typically processed into 1 to 3 TextDisplay components.
	 */
	children: React.ReactNode;
	/** Optional identifier for the component. */
	id?: number;
	// Note: The accessory (Thumbnail or Button) is part of the payload but not explicitly a prop here.
	// It's likely handled by specific child components or an internal mechanism.
}
/**
 * Props for the Container component.
 * A Container is a top-level layout component that visually groups a set of components.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#container}
 */
export interface ContainerProps {
	/**
	 * Child components. Can be Action Rows, Text Displays, Sections, Media Galleries, Separators, or Files.
	 */
	children: React.ReactNode;
	/** Optional color for the accent on the container (RGB integer from `0x000000` to `0xFFFFFF`). */
	accentColor?: number | string; // string for hex representation convenience
	/** Whether the container should be a spoiler (blurred out). Defaults to `false`. */
	spoiler?: boolean;
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * Props for the Separator component.
 * A Separator is a top-level layout component that adds vertical padding and visual division.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#separator}
 */
export interface SeparatorProps {
	/** Whether a visual divider should be displayed. Defaults to `true`. */
	divider?: boolean;
	/** Size of separator padding: `1` for small, `2` for large. Defaults to `1`. */
	spacing?: 1 | 2;
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * Props for the TextDisplay component.
 * A Text Display is a top-level content component for formatted markdown text.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-display}
 */
export interface TextDisplayProps {
	/** The markdown content to be displayed. */
	children: React.ReactNode; // Will be stringified to form the 'content' field
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * Props for the Thumbnail component.
 * A Thumbnail is a small image used as an accessory in a Section.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#thumbnail}
 */
export interface ThumbnailProps {
	/**
	 * URL of the media. Supports arbitrary URLs (http/https) or `attachment://<filename>` references.
	 */
	url: string;
	/** Alt text for the media, max 1024 characters. */
	description?: string;
	/** Whether the thumbnail should be a spoiler. Defaults to `false`. */
	spoiler?: boolean;
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * Props for an item within a MediaGallery.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#media-gallery-item-structure}
 */
export interface MediaGalleryItemProps {
	/**
	 * URL of the media. Supports arbitrary URLs (http/https) or `attachment://<filename>` references.
	 */
	url: string;

	/** Alt text for the media, max 1024 characters. */
	description?: string;
	/** Whether the media should be a spoiler. Defaults to `false`. */
	spoiler?: boolean;
}
/**
 * Props for the MediaGallery component.
 * A Media Gallery displays 1-10 media attachments in an organized format.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#media-gallery}
 */
export interface MediaGalleryProps {
	/** One to ten MediaGalleryItemProps elements. */
	children: React.ReactElement<MediaGalleryItemProps> | React.ReactElement<MediaGalleryItemProps>[];
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * Props for the File component.
 * A File component displays an uploaded file as an attachment.
 * Requires the `IS_COMPONENTS_V2` message flag.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#file}
 */
export interface FileProps {
	/**
	 * URL of the file, must be an attachment reference using `attachment://<filename>` syntax.
	 */
	url: string; // Must be attachment://<filename>
	/** Whether the file should be a spoiler. Defaults to `false`. */
	spoiler?: boolean;
	/** Optional identifier for the component. */
	id?: number;
}
/**
 * The props every button has, whatever its style.
 */
interface ButtonBaseProps {
	/** Whether the button is disabled. Defaults to `false`. */
	disabled?: boolean;
	/** Optional identifier for the component. */
	id?: number;
}

/** The props of buttons that show a label and an emoji (every style except `Premium`). */
interface LabelledButtonProps extends ButtonBaseProps {
	/** Text that appears on the button, max 80 characters. Alternative to `label` prop. */
	children?: string;
	/** Text that appears on the button, max 80 characters. Alternative to `children` prop. */
	label?: string;
	/** Partial emoji object to display on the button. */
	emoji?: EmojiObject;
}

/** A button that sends an interaction when clicked. */
export interface InteractiveButtonProps extends LabelledButtonProps {
	/** The style of the button. */
	style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
	/** Developer-defined identifier, max 100 characters. */
	customId: string;
}

/** A button that opens a URL. */
export interface LinkButtonProps extends LabelledButtonProps {
	/** The style of the button. */
	style: ButtonStyle.Link;
	/** URL to open. */
	url: string;
}

/** A purchase button. Premium buttons cannot have a label or an emoji. */
export interface PremiumButtonProps extends ButtonBaseProps {
	/** The style of the button. */
	style: ButtonStyle.Premium;
	/** Identifier for the purchasable SKU. */
	skuId: string;
}

/**
 * Props for the Button component.
 * A Button is an interactive component used in messages.
 * Must be placed inside an Action Row or a Section's accessory field.
 *
 * What is required depends on the `style`: `Link` needs a `url`, `Premium` needs a `skuId`,
 * and every other style needs a `customId`.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button}
 */
export type ButtonProps = InteractiveButtonProps | LinkButtonProps | PremiumButtonProps;

/**
 * Every prop a button can carry, all optional. Validation uses this to report combinations the
 * {@link ButtonProps} type forbids (for example a Link button with a `customId`), which can still
 * happen in plain JavaScript or when validation is the only safeguard.
 */
export interface AnyButtonProps {
	children?: string;
	label?: string;
	style: ButtonStyle;
	customId?: string;
	url?: string;
	skuId?: string;
	emoji?: EmojiObject;
	disabled?: boolean;
	id?: number;
}
/**
 * Props for an option in a StringSelect menu.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#string-select-menu-select-option-structure}
 */
export interface SelectOptionProps {
	/** User-facing name of the option, max 100 characters. */
	label: string;
	/** Developer-defined value of the option, max 100 characters. */
	value: string;
	/** Additional description of the option, max 100 characters. */
	description?: string;
	/** Partial emoji object to display with the option. */
	emoji?: EmojiObject;
	/** Whether this option is selected by default. */
	isDefault?: boolean;
	/** User-facing name of the option, max 100 characters. Alternative to `label` prop. */
	children?: string; // Alternative for label
}
/**
 * Base props for all select menu components.
 */
interface BaseSelectProps {
	/** Developer-defined ID for the select menu, max 100 characters. */
	customId: string;
	/** Placeholder text if nothing is selected, max 150 characters. */
	placeholder?: string;
	/** Minimum number of items that must be chosen (0-25). Defaults to 1. */
	minValues?: number;
	/** Maximum number of items that can be chosen (1-25). Defaults to 1. */
	maxValues?: number;
	/** Whether the select menu is disabled in messages. Defaults to `false`. */
	disabled?: boolean;
	/** Whether the select menu is required in modals. Defaults to `true`. Only available in modals. */
	required?: boolean;
	/** Optional identifier for the component. */
	id?: number;
}

/**
 * Props for the StringSelect component.
 * Allows users to select from developer-defined text options.
 * Must be placed inside an Action Row.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#string-select-menu}
 */
export interface StringSelectProps extends BaseSelectProps {
	/** Array of SelectOptionProps elements, max 25 options. */
	children: React.ReactElement<SelectOptionProps> | React.ReactElement<SelectOptionProps>[];
}
/**
 * Base props for auto-populated select menus (User, Role, Mentionable, Channel).
 */
export interface AutoPopulatedSelectProps<TValue extends SelectMenuDefaultValueType = SelectMenuDefaultValueType>
	extends BaseSelectProps {
	/** List of default values. Number of values must be between `minValues` and `maxValues`. */
	defaultValues?: APISelectMenuDefaultValue<TValue>[];
}

/**
 * Props for the UserSelect component.
 * Allows users to select one or more users.
 * Must be placed inside an Action Row.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#user-select-menu}
 */
export interface UserSelectProps extends AutoPopulatedSelectProps<SelectMenuDefaultValueType.User> {}
/**
 * Props for the RoleSelect component.
 * Allows users to select one or more roles.
 * Must be placed inside an Action Row.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#role-select-menu}
 */
export interface RoleSelectProps extends AutoPopulatedSelectProps<SelectMenuDefaultValueType.Role> {}
/**
 * Props for the MentionableSelect component.
 * Allows users to select one or more mentionables (users and roles).
 * Must be placed inside an Action Row.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#mentionable-select-menu}
 */
export interface MentionableSelectProps
	extends AutoPopulatedSelectProps<SelectMenuDefaultValueType.User | SelectMenuDefaultValueType.Role> {}
/**
 * Props for the ChannelSelect component.
 * Allows users to select one or more channels.
 * Must be placed inside an Action Row.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#channel-select-menu}
 */
export interface ChannelSelectProps extends AutoPopulatedSelectProps<SelectMenuDefaultValueType.Channel> {
	/** List of channel types to include in the select menu. */
	channelTypes?: ChannelType[]; // Array of channel type integers
}
/** Props for a text input component (used in modals). */
export interface TextInputProps {
	/** Developer-defined identifier for the input, max 100 characters. */
	customId: string;
	/** The Text Input Style. */
	style: TextInputStyle;
	/** Label for this component, max 45 characters. @deprecated Use Label component's label prop instead */
	label?: string;
	/** Minimum input length for a text input; min 0, max 4000. */
	minLength?: number;
	/** Maximum input length for a text input; min 1, max 4000. */
	maxLength?: number;
	/** Whether this component is required to be filled. Defaults to `true`. */
	required?: boolean;
	/** Pre-filled value for this component, max 4000 characters. */
	value?: string;
	/** Custom placeholder text if the input is empty, max 100 characters. */
	placeholder?: string;
	/** Optional identifier for the component. */
	id?: number;
}

/**
 * Props for the Label component (used in modals).
 * A Label wraps modal components with text as a label and optional description.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#label}
 */
export interface LabelProps {
	/** The label text, max 45 characters. */
	label: string;
	/** Optional description text for the label, max 100 characters. */
	description?: string;
	/**
	 * The component within the label. Can be TextInput, StringSelect, UserSelect,
	 * RoleSelect, MentionableSelect, or ChannelSelect.
	 */
	children: React.ReactNode;
	/** Optional identifier for the component. */
	id?: number;
}

/**
 * Props for the FileUpload component (used in modals).
 * Allows users to upload files in modals.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#file-upload}
 */
export interface FileUploadProps {
	/** Developer-defined identifier, max 100 characters. */
	customId: string;
	/** Minimum number of files that must be uploaded (0-10). Defaults to 1. */
	minValues?: number;
	/** Maximum number of files that can be uploaded (1-10). Defaults to 1. */
	maxValues?: number;
	/** Whether the file upload is required to be filled in a modal. Defaults to `true`. */
	required?: boolean;
	/** Optional identifier for the component. */
	id?: number;
}

/** Props for the author section of an embed. */
export interface EmbedAuthorProps {
	/** Name of the author. */
	name: string;
	/** URL of the author. */
	url?: string;
	/** URL of the author icon. */
	iconUrl?: string;
}
/** Props for the footer section of an embed. */
export interface EmbedFooterProps {
	/** Text content of the footer. Alternative to `text` prop. */
	children?: string;
	/** URL of the footer icon. */
	iconUrl?: string;
	/** Text content of the footer. Alternative to `children` prop. */
	text?: string;
}
/** Props for the image section of an embed. */
export interface EmbedImageProps {
	/** URL of the image. */
	url: string;
}
/** Props for the thumbnail section of an embed. */
export interface EmbedThumbnailProps {
	/** URL of the thumbnail. */
	url: string;
}
/** Props for the title of an embed field. */
export interface EmbedFieldTitleProps {
	/** Content for the field title. */
	children: React.ReactNode;
}
/** Props for the value of an embed field. */
export interface EmbedFieldValueProps {
	/** Content for the field value. */
	children: React.ReactNode;
}

/** Props for a field in an embed. */
export interface EmbedFieldProps {
	/** Title of the field. */
	title?: string; // Maps to 'name' in payload
	/** Value of the field. */
	value?: string; // Maps to 'value' in payload
	/** Whether the field should be displayed inline. */
	inline?: boolean;
	/**
	 * Children can be used to structure title and value,
	 * e.g., <EmbedFieldTitle>Title</EmbedFieldTitle><EmbedFieldValue>Value</EmbedFieldValue>.
	 * Alternatively, `title` and `value` props can be used directly.
	 */
	children?: React.ReactNode;
}
/** Props for a collection of embed fields. */
export interface EmbedFieldsProps {
	/** One or more EmbedFieldProps elements. */
	children: React.ReactElement<EmbedFieldProps> | React.ReactElement<EmbedFieldProps>[];
}

/** Props for the description of an embed. */
export interface EmbedDescriptionProps {
	/** Content for the embed description. */
	children: React.ReactNode;
}
/** Props for the title of an embed. */
export interface EmbedTitleProps {
	/** Content for the embed title. */
	children: React.ReactNode;
}

/**
 * Props for an embed object.
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object}
 */
export interface EmbedProps {
	/** Title of the embed. */
	title?: string;
	/** Description of the embed. */
	description?: string;
	/** URL of the embed. */
	url?: string;
	/** Timestamp of the embed content (ISO8601 format or Date object). */
	timestamp?: string | Date;
	/** Color code of the embed. Can be an integer or a hex string. */
	color?: number | string;
	/**
	 * Children can include EmbedAuthor, EmbedFooter, EmbedImage, EmbedThumbnail, EmbedFields,
	 * EmbedTitle, EmbedDescription to structure the embed.
	 */
	children?: React.ReactNode;
}
/**
 * Props for the main text content of a legacy message.
 */
export interface ContentProps {
	/** The text content. */
	children: React.ReactNode; // Will be stringified
}

/**
 * Props for a modal.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal}
 */
export interface ModalProps {
	/** The title of the popup modal, max 45 characters. */
	title: string;
	/** Developer-defined identifier for the modal, max 100 characters. */
	customId: string;
	/**
	 * Child components. Can contain Label (recommended), TextDisplay, or ActionRow (deprecated) components.
	 */
	children: React.ReactNode;
}

/**
 * Props for a message.
 */
export interface MessageProps {
	/**
	 * If true, enables the V2 components system.
	 * This changes how `content` and `embeds` work and allows new component types.
	 * If true, the `flags` field will include `1 << 15`.
	 * @see {@link https://discord.com/developers/docs/interactions/message-components#customizing-messages-message-flags}
	 */
	isV2?: boolean;
	/**
	 * Child components.
	 * For V2: Can be TextDisplay, Section, Container, MediaGallery, File, Separator, ActionRow.
	 * For Legacy: Can be Content, Embed, ActionRow.
	 */
	children: React.ReactNode;
	/** Override the default username of the webhook/bot. */
	username?: string;
	/** Override the default avatar of the webhook/bot. */
	avatarUrl?: string;
	/** Whether this is a TTS message. */
	tts?: boolean;
	/** Message flags combined as a bitfield. `1 << 15` is automatically added if `isV2` is true. */
	flags?: number;
}

export type ReactNodeType<T = unknown> = ReactElement<T> | ReactNode;

/** Base payload for a message. */
interface BaseMessagePayload {
	username?: string;
	avatar_url?: string;
	tts?: boolean;
}

/**
 * Payload for a legacy message (when `IS_COMPONENTS_V2` flag is not set).
 * @see {@link https://discord.com/developers/docs/interactions/message-components#legacy-message-component-behavior}
 */
interface LegacyMessagePayload extends BaseMessagePayload {
	/** The message contents (up to 2000 characters). */
	content?: string;
	/** Array of up to 10 embed objects. */
	embeds?: APIEmbed[];
	/** Array of up to 5 Action Row components. */
	components?: APIActionRowComponent<APIComponentInMessageActionRow>[];
	/** Message flags. */
	flags?: number;
}

/**
 * Payload for a V2 message (when `IS_COMPONENTS_V2` flag is set).
 * `content` and `embeds` fields will not work. Use TextDisplay and Container instead.
 * Attachments must be exposed through components.
 * `poll` and `stickers` fields are disabled.
 * Allows up to 40 total components.
 */
interface V2MessagePayload extends BaseMessagePayload {
	/** Array of components. Max 40 total components. */
	components: APIMessageTopLevelComponent[];
	/** Message flags. Must include `1 << 15` (IS_COMPONENTS_V2). */
	flags?: number;
}

export type { EmojiObject, BaseSelectProps, BaseMessagePayload, LegacyMessagePayload, V2MessagePayload };

/**
 * Props that DISJSX reads from plain HTML tags when turning children into markdown
 * (see `processChildrenToString`), declared so JSX accepts them.
 */
declare module "react" {
	interface HTMLAttributes<T> {
		/** The language of a code block, used for the syntax highlighting after the opening fence. Only valid on `<pre>`. */
		language?: T extends HTMLPreElement ? string : never;
	}

	// `T` must match the type parameter of the interface being merged, even though it is unused here.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface AnchorHTMLAttributes<T> {
		/** Wraps the link in `<>` so Discord does not embed it. */
		isEscaped?: boolean;
	}
}
