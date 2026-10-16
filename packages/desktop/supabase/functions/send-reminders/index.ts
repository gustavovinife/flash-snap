// Web push reminders. pg_cron calls this every 15 minutes with CRON_SECRET to send:
// - the daily reminder at each user's chosen local time, when they have cards due
// - an evening nudge when their streak would end at midnight
// A signed-in user can also call it to get a test notification on their devices.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'
import { computeStreak, type DayString, dayInTimeZone } from '../../../../shared/src/streaks.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@flashsnap.com.br',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

const STREAK_NUDGE_HOUR = 20
// Late cron runs still deliver the daily reminder within this window, but never hours later
const DAILY_WINDOW_MINUTES = 60
const HISTORY_DAYS = 400

interface Messages {
  dailyTitle: string
  dailyBody: (due: number) => string
  streakTitle: (days: number) => string
  streakBody: string
  testTitle: string
  testBody: string
}

const MESSAGES: Record<string, Messages> = {
  'en-US': {
    dailyTitle: 'Time to review',
    dailyBody: (due) =>
      due === 1 ? '1 card is waiting for you. A few minutes keeps it fresh.' : `${due} cards are waiting for you. A few minutes keeps them fresh.`,
    streakTitle: (days) => `Your ${days}-day streak ends tonight`,
    streakBody: 'Review a few cards to keep it going.',
    testTitle: 'Reminders are on',
    testBody: 'This is how Flash Snap will remind you to review.'
  },
  'pt-BR': {
    dailyTitle: 'Hora de revisar',
    dailyBody: (due) =>
      due === 1
        ? '1 cartão está esperando por você. Poucos minutos mantêm tudo fresco.'
        : `${due} cartões estão esperando por você. Poucos minutos mantêm tudo fresco.`,
    streakTitle: (days) => `Sua sequência de ${days} ${days === 1 ? 'dia' : 'dias'} termina hoje`,
    streakBody: 'Revise alguns cartões para manter a sequência.',
    testTitle: 'Lembretes ativados',
    testBody: 'É assim que o Flash Snap vai lembrar você de revisar.'
  }
}

interface ReminderSettings {
  user_id: string
  hour: number
  minute: number
  timezone: string
  language: string
  streak_nudge: boolean
  last_daily_sent: string | null
  last_streak_sent: string | null
}

interface PushPayload {
  title: string
  body: string
  url: string
  tag: string
}

function messagesFor(language: string | null | undefined): Messages {
  return MESSAGES[language ?? ''] ?? MESSAGES['en-US']
}

/** The user's local date and minutes since midnight; unknown time zones fall back to UTC */
function localTime(now: Date, timeZone: string): { day: DayString; minutes: number } {
  const zone = (() => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone })
      return timeZone
    } catch {
      return 'UTC'
    }
  })()
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  return { day: dayInTimeZone(now, zone), minutes: value('hour') * 60 + value('minute') }
}

/** Sends to every browser the user enabled; drops subscriptions the push service says are gone */
async function sendToUser(admin: SupabaseClient, userId: string, payload: PushPayload): Promise<number> {
  const { data: subscriptions } = await admin.from('push_subscriptions').select('endpoint, p256dh, auth').eq('user_id', userId)
  let sent = 0
  for (const subscription of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify(payload),
        { TTL: 6 * 60 * 60 }
      )
      sent += 1
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
      } else {
        console.error(`Push failed for user ${userId}:`, status, (error as Error).message)
      }
    }
  }
  return sent
}

async function countDueCards(admin: SupabaseClient, userId: string, now: Date): Promise<number> {
  const { count } = await admin
    .from('cards')
    .select('id, decks!inner(user_id)', { count: 'exact', head: true })
    .eq('decks.user_id', userId)
    .or(`next_review.is.null,next_review.lte.${now.toISOString()}`)
  return count ?? 0
}

async function currentStreak(admin: SupabaseClient, userId: string, today: DayString) {
  const since = new Date(Date.parse(`${today}T00:00:00Z`) - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data } = await admin.from('review_days').select('day').eq('user_id', userId).gte('day', since)
  return computeStreak((data ?? []).map((row) => row.day as DayString), today)
}

async function runSchedule(admin: SupabaseClient) {
  const now = new Date()
  const { data: rows, error } = await admin.from('reminder_settings').select('*').eq('enabled', true)
  if (error) throw new Error(error.message)

  const summary = { checked: 0, daily: 0, streak: 0 }
  for (const settings of (rows ?? []) as ReminderSettings[]) {
    summary.checked += 1
    const { day, minutes } = localTime(now, settings.timezone)
    const messages = messagesFor(settings.language)
    const updates: Partial<ReminderSettings> = {}

    const inStreakWindow = minutes >= STREAK_NUDGE_HOUR * 60 && minutes < (STREAK_NUDGE_HOUR + 1) * 60
    let nudged = false
    if (settings.streak_nudge && inStreakWindow && settings.last_streak_sent !== day) {
      updates.last_streak_sent = day
      const streak = await currentStreak(admin, settings.user_id, day)
      if (streak.current > 0 && !streak.reviewedToday) {
        const sent = await sendToUser(admin, settings.user_id, {
          title: messages.streakTitle(streak.current),
          body: messages.streakBody,
          url: '/app/review/all?from=push',
          tag: 'streak'
        })
        nudged = sent > 0
        if (nudged) summary.streak += 1
      }
    }

    const target = settings.hour * 60 + settings.minute
    const inDailyWindow = minutes >= target && minutes < target + DAILY_WINDOW_MINUTES
    if (inDailyWindow && settings.last_daily_sent !== day) {
      updates.last_daily_sent = day
      // One notification per run is enough; the streak nudge already asks them to review
      const due = nudged ? 0 : await countDueCards(admin, settings.user_id, now)
      if (due > 0) {
        const sent = await sendToUser(admin, settings.user_id, {
          title: messages.dailyTitle,
          body: messages.dailyBody(due),
          url: '/app/review/all?from=push',
          tag: 'daily'
        })
        if (sent > 0) summary.daily += 1
      }
    }

    if (Object.keys(updates).length > 0) {
      await admin.from('reminder_settings').update(updates).eq('user_id', settings.user_id)
    }
  }
  return summary
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const cronSecret = Deno.env.get('CRON_SECRET')

  if (cronSecret && token === cronSecret) {
    try {
      return json(await runSchedule(admin))
    } catch (error) {
      console.error('Reminder run failed:', error)
      return json({ error: 'Reminder run failed' }, 500)
    }
  }

  // Otherwise: a signed-in user asking for a test notification
  const {
    data: { user }
  } = await admin.auth.getUser(token)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const { data: settings } = await admin.from('reminder_settings').select('language').eq('user_id', user.id).maybeSingle()
  const messages = messagesFor(settings?.language)
  const sent = await sendToUser(admin, user.id, { title: messages.testTitle, body: messages.testBody, url: '/app/settings', tag: 'test' })
  return json({ sent })
})
