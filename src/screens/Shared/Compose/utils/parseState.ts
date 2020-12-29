import { getLocalAccountPreferences } from '@root/utils/slices/instancesSlice'
import { store } from '@root/store'
import composeInitialState from './initialState'
import { ComposeState } from './types'

const composeParseState = ({
  type,
  incomingStatus,
  visibilityLock
}: {
  type: 'reply' | 'conversation' | 'edit'
  incomingStatus: Mastodon.Status
  visibilityLock?: boolean
}): ComposeState => {
  switch (type) {
    case 'edit':
      return {
        ...composeInitialState,
        ...(incomingStatus.spoiler_text?.length && {
          spoiler: {
            active: true,
            count: incomingStatus.spoiler_text.length,
            raw: incomingStatus.spoiler_text,
            formatted: incomingStatus.spoiler_text,
            selection: { start: 0, end: 0 }
          }
        }),
        text: {
          count: incomingStatus.text!.length,
          raw: incomingStatus.text!,
          formatted: undefined,
          selection: { start: 0, end: 0 }
        },
        ...(incomingStatus.poll && {
          poll: {
            active: true,
            total: incomingStatus.poll.options.length,
            options: {
              '0': incomingStatus.poll.options[0]?.title || undefined,
              '1': incomingStatus.poll.options[1]?.title || undefined,
              '2': incomingStatus.poll.options[2]?.title || undefined,
              '3': incomingStatus.poll.options[3]?.title || undefined
            },
            multiple: incomingStatus.poll.multiple,
            expire: '86400' // !!!
          }
        }),
        ...(incomingStatus.media_attachments && {
          attachments: {
            sensitive: incomingStatus.sensitive,
            uploads: incomingStatus.media_attachments.map(media => ({
              remote: media
            }))
          }
        }),
        visibility:
          incomingStatus.visibility ||
          getLocalAccountPreferences(store.getState())[
            'posting:default:visibility'
          ],
        ...(incomingStatus.visibility === 'direct' && { visibilityLock: true })
      }
    case 'reply':
      const actualStatus = incomingStatus.reblog || incomingStatus
      const allMentions = Array.isArray(actualStatus.mentions)
        ? actualStatus.mentions.map(mention => `@${mention.acct}`)
        : []
      let replyPlaceholder = allMentions.join(' ')

      if (replyPlaceholder.length === 0) {
        replyPlaceholder = `@${actualStatus.account.acct} `
      } else {
        replyPlaceholder = replyPlaceholder + ' '
      }
      return {
        ...composeInitialState,
        text: {
          count: replyPlaceholder.length,
          raw: replyPlaceholder,
          formatted: undefined,
          selection: { start: 0, end: 0 }
        },
        ...(visibilityLock && {
          visibility: 'direct',
          visibilityLock: true
        }),
        replyToStatus: actualStatus
      }
    case 'conversation':
      return {
        ...composeInitialState,
        text: {
          count: incomingStatus.account.acct.length + 2,
          raw: `@${incomingStatus.account.acct} `,
          formatted: undefined,
          selection: { start: 0, end: 0 }
        },
        visibility: 'direct',
        visibilityLock: true
      }
  }
}

export default composeParseState