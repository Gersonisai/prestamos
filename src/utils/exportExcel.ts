
import * as XLSX from 'xlsx'
export function exportExcel(loans: any[]) {
  const loansSheetData = loans.map(l => ({
    ID: l.id,
    Cliente: l.clientName,
    Telefono: l.phone || '',
    Direccion: l.address || '',
    MetodoPrestamo: l.loanMethod || '',
    TasaMensual_Pct: Number(l.monthlyRate||0),
    InteresMensual: Number(l.originalAmount||0) * Number(l.monthlyRate||0)/100,
    CapitalOriginal: Number(l.originalAmount||0),
    CapitalPendiente: Number(l.remainingCapital||0),
    TotalOriginal: Number(l.total||0),
    FechaPrestamo: l.loanDate || '',
    Vencimiento: l.dueDate || '',
    Estado: l.status === 'paid' ? 'Pagado' : 'Activo',
  }))
  const wsLoans = XLSX.utils.json_to_sheet(loansSheetData)

  const payments: any[] = []
  loans.forEach(l => (l.payments||[]).forEach((p: any) => payments.push({
    loanId: l.id,
    Cliente: l.clientName,
    FechaPago: p.date,
    Tipo: p.type,
    Metodo: p.method || 'EFECTIVO',
    Monto: Number(p.amount||0)
  })))
  const wsPayments = XLSX.utils.json_to_sheet(payments)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsLoans, 'Prestamos')
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Pagos')
  XLSX.writeFile(wb, `prestamos_zenit_${new Date().toISOString().slice(0,10)}.xlsx`)
}
