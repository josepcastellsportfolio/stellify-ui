import type { Meta, StoryObj } from "@storybook/react-vite"
import { LoadingState } from "@stellify/loading-state"
import { OutreachCard } from "@stellify/outreach-card"

const meta = { title: "Components/Outreach (C3 step 3)", parameters: { layout: "padded" } } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Drafting: Story = {
  render: () => (
    <div className="max-w-3xl">
      <LoadingState
        title="3 · Redactando comunicaciones…"
        description="Estamos escribiendo un mensaje para cada negocio seleccionado. Puedes cambiar de sección: el trabajo continúa."
        progress={{ done: 2, total: 5 }}
      />
    </div>
  ),
}

export const Email: Story = {
  render: () => (
    <div className="max-w-3xl divide-y">
      <OutreachCard
        status="ready"
        name="PádelOn Murcia"
        diagnosis="El volumen de reseñas sugiere una carga de trabajo en reservas que la falta de web amplifica."
        channelLabel="Correo en frío"
        subject="Mejora en la gestión de reservas para PádelOn"
        body={"Vuestra valoración de 4,7 con 219 reseñas indica un gran volumen de actividad en PádelOn. Sin web, cada reserva pasa por el teléfono y consume tiempo del personal. …\n\nSi preferís no recibir más correos, respondedme con un 'no' y listo."}
        onSave={() => {}}
      />
      <OutreachCard status="generating" name="Club Pádel Santa Ana" onSave={() => {}} />
      <OutreachCard status="queued" name="Pádel La Flota" retryLabel="En cola: reintento a las 10:05" onSave={() => {}} />
      <OutreachCard status="failed" name="Pádel Sangonera" error="Sin forma de contacto: ni email ni teléfono." onSave={() => {}} />
    </div>
  ),
}

export const CallScript: Story = {
  render: () => (
    <div className="max-w-3xl">
      <OutreachCard
        status="ready"
        name="Pádel Churra"
        diagnosis="Sin web y con teléfono directo: cada reserva depende de que alguien conteste."
        channelLabel="WhatsApp"
        body={"Apertura:\nHola, soy José de Stellifyit…\n\nPreguntas:\n- ¿Cómo gestionáis hoy las reservas?\n\nCierre:\n¿Os envío un diagnóstico gratuito?"}
        objections={[
          { objecion: "No tenemos presupuesto", respuesta: "El diagnóstico es gratuito y sin compromiso." },
          { objecion: "Ya lo llevamos bien", respuesta: "Perfecto; el diagnóstico os dice cuántas llamadas se pierden." },
        ]}
        onSave={() => {}}
      />
    </div>
  ),
}
