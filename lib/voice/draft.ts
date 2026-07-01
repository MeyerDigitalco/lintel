/**
 * Tenant message draft templates. The assistant only ever DRAFTS, the landlord
 * copies the text and sends it themselves. Nothing is sent automatically.
 */

export function draftTenantMessage(topic: string): string {
  const t = topic.toLowerCase();

  if (/gas|boiler|heating/.test(t)) {
    return `Hi,\n\nWe need to arrange access for the annual gas safety check / boiler service. Could you let me know a few dates and times that work for you over the next two weeks?\n\nThanks.`;
  }
  if (/inspect|visit/.test(t)) {
    return `Hi,\n\nI'd like to arrange a routine inspection of the property. I'll give the required notice, could you suggest some convenient times?\n\nThanks.`;
  }
  if (/rent|arrears|payment/.test(t)) {
    return `Hi,\n\nJust a friendly reminder about this month's rent. Please let me know if there's anything you'd like to discuss.\n\nThanks.`;
  }
  if (/repair|maintenance|fix/.test(t)) {
    return `Hi,\n\nThanks for flagging the repair. I'm arranging a contractor and will confirm a visit time shortly. Please let me know if anything changes in the meantime.\n\nThanks.`;
  }

  return `Hi,\n\nI wanted to get in touch regarding ${topic}. Please let me know if you have any questions.\n\nThanks.`;
}
