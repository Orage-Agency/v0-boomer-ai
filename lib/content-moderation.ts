// Content moderation utility for App Store compliance (Guideline 2.1.0)
// This file contains prohibited terms and safety filters

export const PROHIBITED_TERMS = [
  // Explicit content
  "nude",
  "nudity",
  "naked",
  "nsfw",
  "porn",
  "pornography",
  "xxx",
  "explicit",
  "sexual",
  "erotic",
  "adult content",
  "18+",
  // Violence
  "gore",
  "violence",
  "blood",
  "murder",
  "kill",
  "death",
  "torture",
  "weapon",
  "gun",
  "knife",
  "bomb",
  "terrorist",
  "terrorism",
  // Hate speech
  "hate",
  "racist",
  "racism",
  "nazi",
  "slur",
  // Drugs
  "drugs",
  "cocaine",
  "heroin",
  "meth",
  "marijuana",
  // Self-harm
  "suicide",
  "self-harm",
  "cutting",
  // Other prohibited
  "illegal",
  "underage",
  "child abuse",
]

export function containsProhibitedContent(text: string): { isProhibited: boolean; reason: string } {
  const normalizedText = text.toLowerCase().trim()

  for (const term of PROHIBITED_TERMS) {
    if (normalizedText.includes(term.toLowerCase())) {
      return {
        isProhibited: true,
        reason: "content_safety",
      }
    }
  }

  return {
    isProhibited: false,
    reason: "",
  }
}

export const SAFETY_MESSAGE =
  "This request could not be fulfilled due to our safety guidelines. Please try describing something else, like a beautiful landscape, a cute animal, or a peaceful scene."

export const TECHNICAL_ERROR_MESSAGE =
  "This request could not be completed at this time due to technical limitations. Please try again or describe something different."
