/**
 * intelUI — shared presentational types.
 *
 * These describe the data the intelUI UI pieces render. They are i18n-agnostic
 * and engine-agnostic: the host app owns the assistant engine (registry,
 * client, conversation state) and feeds these plain shapes + labels in as
 * props. The library never imports the app's context or i18n.
 */

export type InteluiChatRole = "user" | "assistant"

export interface InteluiChatMessage {
  id: string
  role: InteluiChatRole
  text: string
  /** True while a reply is in flight (renders the "thinking" placeholder). */
  pending?: boolean
}

export interface InteluiTab {
  id: string
  title: string
}

export interface InteluiConversation {
  id: string
  title: string
}

/** A predefined quick action / suggestion the assistant can run in a module. */
export interface InteluiAction {
  /** Stable key (the host maps it back to a real action / message). */
  id: string
  /** Already-localized label to display. */
  label: string
}
