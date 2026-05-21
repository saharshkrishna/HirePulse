import { Building, ShieldAlert, Sparkles } from 'lucide-react'
import { Badge, LogoMark, Panel } from '../components/ui'

const ALERTS = [
  {
    title: 'Strong match found',
    text: 'React Native Engineer at Meta scored 97% and was posted in the last 48 hours.',
    Icon: Sparkles,
  },
  {
    title: 'Company activity spike',
    text: 'Stripe opened 4 engineering roles this week across platform and payments teams.',
    Icon: Building,
  },
  {
    title: 'Connector attention needed',
    text: 'Ashby extraction confidence dropped below threshold for two company pages.',
    Icon: ShieldAlert,
  },
]

/** Recent AI notifications and watchlist events. */
export function AlertsSection() {
  return (
    <Panel className="p-5" id="alerts">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Alert center</h2>
          <p className="text-sm text-textmuted">Recent AI notifications and watchlist events.</p>
        </div>
        <Badge>6 unread</Badge>
      </div>

      <div className="space-y-3">
        {ALERTS.map(({ title, text, Icon }) => (
          <article key={title} className="surface-sub rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <LogoMark className="!w-10 !h-10"><Icon size={18} /></LogoMark>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-textmuted">{text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}
