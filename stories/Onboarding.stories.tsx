import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { ChoiceCard, ChoiceCardGroup } from "@stellify/choice-card"
import { NavFooter } from "@stellify/nav-footer"
import { NumberInput } from "@stellify/number-input"
import { OnboardingShell } from "@stellify/onboarding-shell"
import { StepHeading } from "@stellify/step-heading"
import { TextareaField } from "@stellify/textarea-field"

const meta = {
  title: "Components/Onboarding",
  component: OnboardingShell,
  parameters: { layout: "fullscreen" },
  args: { step: 7, totalSteps: 8, children: null },
} satisfies Meta<typeof OnboardingShell>

export default meta
type Story = StoryObj<typeof meta>

export const ChoiceStep: Story = {
  render: (args) => {
    const [value, setValue] = useState("no")
    return (
      <OnboardingShell {...args}>
        <StepHeading
          title="¿Quieres aparecer en cámara?"
          description="Determina si el contenido y los anuncios se plantean con o sin imagen personal."
        />
        <ChoiceCardGroup aria-label="Aparecer en cámara" value={value} onValueChange={setValue} className="mt-6">
          <ChoiceCard value="yes" title="Sí, sin problema" description="Vídeo a cámara, voz y presencia personal." />
          <ChoiceCard value="no" title="Prefiero no aparecer" description="Todo sin imagen personal: pantalla, voz en off y texto." />
        </ChoiceCardGroup>
        <NavFooter onBack={() => {}} onNext={() => {}} />
      </OnboardingShell>
    )
  },
}

export const ChoiceWithDetails: Story = {
  args: { step: 5 },
  render: (args) => {
    const [value, setValue] = useState("yes")
    return (
      <OnboardingShell {...args}>
        <StepHeading
          title="¿Dispones de casos de éxito?"
          description="Si todavía no los tienes, la herramienta lo tiene en cuenta y nunca inventa resultados."
        />
        <ChoiceCardGroup aria-label="Casos de éxito" value={value} onValueChange={setValue} className="mt-6">
          <ChoiceCard value="yes" title="Sí, tengo resultados de clientes" description="Se utilizan como prueba social en mensajes y anuncios." />
          <ChoiceCard value="no" title="Todavía no" description="Se trabajará con una demostración propia y un diagnóstico gratuito como entrada." />
        </ChoiceCardGroup>
        {value === "yes" && (
          <TextareaField
            wrapperClassName="mt-6"
            label="Resúmelos brevemente"
            placeholder="Clínica Dental Sur: +18 citas al mes en 6 semanas"
            autoResize
          />
        )}
        <NavFooter onBack={() => {}} onNext={() => {}} />
      </OnboardingShell>
    )
  },
}

export const LastStep: Story = {
  args: { step: 8 },
  render: (args) => {
    const [goal, setGoal] = useState<number | null>(10)
    return (
      <OnboardingShell {...args}>
        <StepHeading title="Tu objetivo mensual" description="Cuántos clientes o reuniones quieres conseguir cada mes." />
        <div className="mt-6 space-y-6">
          <NumberInput label="Clientes o reuniones al mes" value={goal} onChange={setGoal} min={1} max={500} />
          <TextareaField label="Tono de tu marca" defaultValue="Directo y cercano en el barrio, pero respetuoso y profesional" autoResize />
        </div>
        <NavFooter onBack={() => {}} onNext={() => {}} nextLabel="Ver el modelo" />
      </OnboardingShell>
    )
  },
}
