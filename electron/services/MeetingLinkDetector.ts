export class MeetingLinkDetector {
  private patterns = [
    // Zoom
    { name: 'Zoom', regex: /https?:\/\/([\w-]+\.)?zoom\.us\/(j|my)\/[\w?=&-]+/gi },

    // Google Meet
    { name: 'Google Meet', regex: /https?:\/\/meet\.google\.com\/[\w-]+/gi },

    // Microsoft Teams
    { name: 'Microsoft Teams', regex: /https?:\/\/teams\.microsoft\.com\/l\/meetup-join\/[\w%.\-_]+/gi },
    { name: 'Microsoft Teams', regex: /https?:\/\/teams\.live\.com\/meet\/[\w]+/gi },

    // Webex
    { name: 'Webex', regex: /https?:\/\/([\w-]+\.)?webex\.com\/(meet|join)\/[\w.-]+/gi },

    // GoToMeeting
    { name: 'GoToMeeting', regex: /https?:\/\/(www\.)?gotomeeting\.com\/join\/[\w]+/gi },
    { name: 'GoToMeeting', regex: /https?:\/\/(www\.)?gotomeet\.me\/[\w]+/gi },

    // BlueJeans
    { name: 'BlueJeans', regex: /https?:\/\/(www\.)?bluejeans\.com\/[\w]+/gi },

    // Whereby
    { name: 'Whereby', regex: /https?:\/\/whereby\.com\/[\w-]+/gi },

    // Skype
    { name: 'Skype', regex: /https?:\/\/join\.skype\.com\/[\w]+/gi },

    // Slack
    { name: 'Slack', regex: /https?:\/\/([\w-]+)\.slack\.com\/huddle\/[\w-]+/gi },
    { name: 'Slack', regex: /https?:\/\/([\w-]+)\.slack\.com\/call\/[\w-]+/gi },

    // Discord
    { name: 'Discord', regex: /https?:\/\/discord\.(gg|com\/invite)\/[\w-]+/gi },

    // Amazon Chime
    { name: 'Amazon Chime', regex: /https?:\/\/chime\.aws\/[\w]+/gi },

    // RingCentral
    { name: 'RingCentral', regex: /https?:\/\/meetings\.ringcentral\.com\/j\/[\w]+/gi },

    // 8x8
    { name: '8x8', regex: /https?:\/\/8x8\.vc\/[\w-]+/gi },

    // Jitsi
    { name: 'Jitsi', regex: /https?:\/\/meet\.jit\.si\/[\w-]+/gi },

    // Around
    { name: 'Around', regex: /https?:\/\/meet\.around\.co\/[\w-]+/gi },

    // Duo
    { name: 'Google Duo', regex: /https?:\/\/duo\.google\.com\/join\/[\w-]+/gi },

    // FaceTime (Apple)
    { name: 'FaceTime', regex: /https?:\/\/facetime\.apple\.com\/join#[\w-]+/gi },

    // Cisco Meeting
    { name: 'Cisco', regex: /https?:\/\/([\w-]+)\.ciscowebex\.com\/[\w-]+/gi },

    // Zoho Meeting
    { name: 'Zoho Meeting', regex: /https?:\/\/meeting\.zoho\.(com|eu)\/[\w-]+/gi },

    // ClickMeeting
    { name: 'ClickMeeting', regex: /https?:\/\/(www\.)?clickmeeting\.com\/[\w-]+/gi },

    // Join.me
    { name: 'Join.me', regex: /https?:\/\/join\.me\/[\w-]+/gi },

    // Lifesize
    { name: 'Lifesize', regex: /https?:\/\/call\.lifesizecloud\.com\/[\w]+/gi },

    // StarLeaf
    { name: 'StarLeaf', regex: /https?:\/\/meet\.starleaf\.com\/[\w]+/gi },

    // Nextiva
    { name: 'Nextiva', regex: /https?:\/\/meet\.nextiva\.com\/[\w-]+/gi },

    // Dialpad
    { name: 'Dialpad', regex: /https?:\/\/dialpad\.com\/join\/[\w-]+/gi },

    // Intermedia AnyMeeting
    { name: 'AnyMeeting', regex: /https?:\/\/(www\.)?anymeeting\.com\/[\w-]+/gi },
  ]

  detectLink(description: string, location: string = ''): string | null {
    const combinedText = `${description} ${location}`

    for (const pattern of this.patterns) {
      const match = combinedText.match(pattern.regex)
      if (match && match[0]) {
        return match[0]
      }
    }

    // Fallback: look for any URL in the text as a last resort
    const genericUrlMatch = combinedText.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi)
    if (genericUrlMatch && genericUrlMatch[0]) {
      // Only return if it looks like it might be a meeting link
      const url = genericUrlMatch[0]
      if (
        url.includes('meet') ||
        url.includes('join') ||
        url.includes('call') ||
        url.includes('conference')
      ) {
        return url
      }
    }

    return null
  }

  extractAllLinks(description: string, location: string = ''): string[] {
    const combinedText = `${description} ${location}`
    const links: string[] = []

    for (const pattern of this.patterns) {
      const matches = combinedText.matchAll(pattern.regex)
      for (const match of matches) {
        if (match[0]) {
          links.push(match[0])
        }
      }
    }

    return [...new Set(links)] // Remove duplicates
  }

  getPlatformName(url: string): string {
    for (const pattern of this.patterns) {
      if (pattern.regex.test(url)) {
        return pattern.name
      }
    }
    return 'Unknown Platform'
  }
}
