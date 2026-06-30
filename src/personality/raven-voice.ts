export type RavenMode = "plain" | "lore" | "silent";

export type VoiceInput = {
  mode: RavenMode;
  message: string;
};

export function shapeRavenResponse(input: VoiceInput): string | null {
  if (input.mode === "silent") {
    return null;
  }

  if (input.mode === "plain") {
    return input.message;
  }

  return `The realm remembers: ${input.message}`;
}
