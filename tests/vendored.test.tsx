import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@stellify/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@stellify/table"
import { cn } from "@stellify/utils"

describe("utils", () => {
  it("merges conflicting Tailwind classes, last wins", () => {
    expect(cn("px-2 text-sm", false && "hidden", "px-4")).toBe("text-sm px-4")
  })
})

describe("alert-dialog", () => {
  it("opens, exposes data-slot parts and closes on cancel", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Quitar</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar el lead?</AlertDialogTitle>
            <AlertDialogDescription>No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction>Quitar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Quitar" }))
    const dialog = await screen.findByRole("alertdialog", { name: "¿Quitar el lead?" })
    expect(dialog).toHaveAttribute("data-slot", "alert-dialog-content")
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })
})

describe("table", () => {
  it("renders semantic table parts with data-slot", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Negocio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Club de Pádel Murcia</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table")
    expect(screen.getByRole("columnheader", { name: "Negocio" })).toHaveAttribute("data-slot", "table-head")
    expect(screen.getByRole("cell", { name: "Club de Pádel Murcia" })).toHaveAttribute("data-slot", "table-cell")
  })
})
