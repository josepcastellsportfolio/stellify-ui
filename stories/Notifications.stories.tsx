import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { NotificationBell } from "@stellify/notification-bell"
import { NotificationItem } from "@stellify/notification-item"
import { TimerControl } from "@stellify/timer-control"

const meta = { title: "App/NotificationBell", component: NotificationBell } satisfies Meta<typeof NotificationBell>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 1, severity: "critica", title: "100 % del tope de octubre", time: "hace 5 min", unread: true },
  { id: 2, severity: "aviso", title: "Cobro vencido: Peluquería Rosa", body: "Hito de 500,00 € vencido el 28/09.", time: "hace 2 h", unread: true },
  { id: 3, severity: "info", title: "Comunicaciones listas: Peluquerías · Tortosa", body: "18 borradores listos.", time: "ayer", unread: false },
] as const

export const Open: Story = {
  args: { count: 2, open: true, onOpenChange: () => {}, children: null },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return (
      <div className="flex justify-end p-4 pb-80">
        <NotificationBell
          {...args}
          open={open}
          onOpenChange={setOpen}
          actions={<button className="text-xs text-primary">Marcar todas como leídas</button>}
          footer={<a className="text-xs text-primary" href="#">Ver todas</a>}
        >
          {items.map(({ id, ...n }) => (
            <NotificationItem key={id} {...n} />
          ))}
        </NotificationBell>
      </div>
    )
  },
}

export const ManyUnread: Story = { args: { count: 14, open: false, onOpenChange: () => {}, children: null } }

export const Timer: Story = {
  args: { count: 0, open: false, onOpenChange: () => {}, children: null },
  render: () => {
    const [startedAt, setStartedAt] = useState<string | undefined>()
    const [type, setType] = useState("captacion")
    return (
      <div className="w-60">
        <TimerControl
          startedAt={startedAt}
          type={type}
          types={[
            { value: "captacion", label: "Captación" },
            { value: "entrega", label: "Entrega" },
          ]}
          onTypeChange={setType}
          onStart={() => setStartedAt(new Date().toISOString())}
          onStop={() => setStartedAt(undefined)}
        />
      </div>
    )
  },
}
