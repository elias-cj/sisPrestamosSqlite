<?php

namespace App\Http\Controllers;

use App\Models\Prestamo;
use App\Models\Pago;
use App\Models\Gasto;
use App\Models\Socio;
use App\Models\Ganancia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReporteController extends Controller
{
    public function index(Request $request)
    {
        $data = $this->getReportData($request);
        return Inertia::render('Reports/Index', $data);
    }

    public function exportExcel(Request $request)
    {
        $data = $this->getReportData($request);
        $spreadsheet = new Spreadsheet();
        
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Resumen');
        
        $sheet->setCellValue('A1', 'REPORTE FINANCIERO CONSOLIDADO');
        $sheet->mergeCells('A1:B1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        
        $sheet->setCellValue('A3', 'Periodo:');
        $sheet->setCellValue('B3', $data['filters']['start_date'] . ' al ' . $data['filters']['end_date']);
        
        $sheet->setCellValue('A5', 'Estadística');
        $sheet->setCellValue('B5', 'Monto (Bs)');
        $sheet->getStyle('A5:B5')->getFont()->setBold(true);
        
        $sheet->setCellValue('A6', 'Total Prestado');
        $sheet->setCellValue('B6', $data['stats']['total_lent']);
        $sheet->setCellValue('A7', 'Número de Préstamos');
        $sheet->setCellValue('B7', $data['stats']['loans_count']);
        $sheet->setCellValue('A8', 'Total Cobrado');
        $sheet->setCellValue('B8', $data['stats']['total_collected']);
        $sheet->setCellValue('A9', 'Gastos Ejecutados');
        $sheet->setCellValue('B9', $data['stats']['total_expenses']);
        $sheet->setCellValue('A10', 'Flujo de Caja Neto');
        $sheet->setCellValue('B10', $data['stats']['net_flow']);
        
        $sheet->getStyle('B6:B10')->getNumberFormat()->setFormatCode('#,##0.00 "Bs"');
        $sheet->getColumnDimension('A')->setAutoSize(true);
        $sheet->getColumnDimension('B')->setAutoSize(true);

        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Balance de Socios');
        
        $header = ['Socio', 'Documento', 'Capital Inicial', 'Disponible', 'En Calle', 'Ganancia Periodo'];
        $sheet2->fromArray($header, NULL, 'A1');
        $sheet2->getStyle('A1:F1')->getFont()->setBold(true);
        
        $row = 2;
        foreach ($data['sociosBalance'] as $s) {
            $sheet2->setCellValue('A' . $row, $s['nombre']);
            $sheet2->setCellValue('B' . $row, $s['documento']);
            $sheet2->setCellValue('C' . $row, $s['capital_inicial']);
            $sheet2->setCellValue('D' . $row, $s['capital_disponible']);
            $sheet2->setCellValue('E' . $row, $s['capital_comprometido']);
            $sheet2->setCellValue('F' . $row, $s['ganancias_periodo']);
            $row++;
        }
        $sheet2->getStyle('C2:F' . ($row-1))->getNumberFormat()->setFormatCode('#,##0.00 "Bs"');
        foreach (range('A', 'F') as $col) { $sheet2->getColumnDimension($col)->setAutoSize(true); }

        $sheet3 = $spreadsheet->createSheet();
        $sheet3->setTitle('Ganancias por Socio');
        $header3 = ['Socio', '% Rent.', 'Inv. Periodo', 'Rent. Socio', 'Comisión Dueño', 'Interés Total'];
        $sheet3->fromArray($header3, NULL, 'A1');
        $sheet3->getStyle('A1:F1')->getFont()->setBold(true);
        
        $row = 2;
        foreach ($data['partnersProfit'] as $p) {
            $sheet3->setCellValue('A' . $row, $p['nombre']);
            $sheet3->setCellValue('B' . $row, $p['porcentaje_socio'] . '%');
            $sheet3->setCellValue('C' . $row, $p['capital_prestado']);
            $sheet3->setCellValue('D' . $row, $p['ganancia_socio']);
            $sheet3->setCellValue('E' . $row, $p['mi_ganancia']);
            $sheet3->setCellValue('F' . $row, $p['total_generado']);
            $row++;
        }
        $sheet3->setCellValue('A' . ($row+1), 'TOTALES');
        $sheet3->setCellValue('C' . ($row+1), $data['totalsProfit']['capital_prestado']);
        $sheet3->setCellValue('D' . ($row+1), $data['totalsProfit']['ganancia_socio']);
        $sheet3->setCellValue('E' . ($row+1), $data['totalsProfit']['mi_ganancia']);
        $sheet3->setCellValue('F' . ($row+1), $data['totalsProfit']['total_generado']);
        $sheet3->getStyle('A'.($row+1).':F'.($row+1))->getFont()->setBold(true);
        $sheet3->getStyle('C2:F' . ($row+1))->getNumberFormat()->setFormatCode('#,##0.00 "Bs"');
        foreach (range('A', 'F') as $col) { $sheet3->getColumnDimension($col)->setAutoSize(true); }

        $fileName = 'Reporte_Financiero_' . date('Y-m-d_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    private function getReportData(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        $socioSearch = $request->input('socio_search');
        $balanceSearchName = $request->input('balance_search_name');
        $balanceSearchDoc = $request->input('balance_search_doc');

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();
        
        $totalLent = Prestamo::whereBetween('fecha_inicio', [$start, $end])->sum('monto');
        $loansCount = Prestamo::whereBetween('fecha_inicio', [$start, $end])->count();
        $totalCollected = Pago::whereBetween('fecha_pago', [$start, $end])->sum('monto_pagado');
        $totalExpenses = Gasto::where('estado', 'registrado')->whereBetween('fecha', [$start, $end])->sum('monto');
        $netFlow = $totalCollected - $totalExpenses;

        $sociosQuery = Socio::query();
        if ($balanceSearchName) $sociosQuery->where('nombre', 'like', "%{$balanceSearchName}%");
        if ($balanceSearchDoc) $sociosQuery->where('documento', 'like', "%{$balanceSearchDoc}%");

        $sociosBalance = $sociosQuery->get()->map(function($socio) use ($start, $end) {
            $portfolio = $socio->prestamos()
                ->with('cliente', 'moneda')
                ->latest()
                ->get()
                ->map(function($p) {
                    return [
                        'id' => $p->id,
                        'cliente' => $p->cliente->nombre,
                        'documento' => $p->cliente->documento,
                        'monto_total' => (float) $p->monto,
                        'monto_aportado' => (float) $p->pivot->monto_aportado,
                        'estado' => $p->estado,
                        'fecha' => $p->fecha_inicio,
                    ];
                });

            $gananciaPropia = (float) $socio->ganancias()
                ->whereBetween('created_at', [$start, $end])
                ->sum('monto_ganancia_socio');

            $gananciaCalculada = $gananciaPropia;
            if ($socio->id == 1) {
                $comisionesTerceros = (float) Ganancia::whereBetween('created_at', [$start, $end])
                    ->sum('monto_ganancia_dueno');
                $gananciaCalculada = $gananciaPropia + $comisionesTerceros;
            }

            return [
                'id' => $socio->id,
                'nombre' => $socio->nombre,
                'documento' => $socio->documento,
                'capital_inicial' => (float) $socio->capital_inicial,
                'capital_disponible' => (float) ($socio->capital_inicial - $socio->capital_comprometido),
                'capital_comprometido' => (float) $socio->capital_comprometido,
                'ganancias_periodo' => $gananciaCalculada,
                'portfolio' => $portfolio,
            ];
        });

        $queryProfit = Socio::query();
        if ($socioSearch) $queryProfit->where('nombre', 'like', "%{$socioSearch}%");

        $partnersProfit = $queryProfit->get()->map(function($socio) use ($start, $end) {
            $gains = $socio->ganancias()
                ->whereBetween('created_at', [$start, $end])
                ->selectRaw('SUM(monto_ganancia_socio) as ganancia_socio, SUM(monto_ganancia_dueno) as mi_ganancia')
                ->first();

            $gananciaSocio = (float) ($gains->ganancia_socio ?? 0);
            $miGanancia = (float) ($gains->mi_ganancia ?? 0);

            if ($socio->id == 1) {
                $miGanancia = $gananciaSocio + $miGanancia;
                $gananciaSocio = 0;
            }

            return [
                'id' => $socio->id,
                'nombre' => $socio->nombre,
                'porcentaje_socio' => $socio->porcentaje_ganancia_socio,
                'capital_prestado' => (float) $socio->prestamos()->whereBetween('prestamo_socio.created_at', [$start, $end])->sum('monto_aportado'),
                'ganancia_socio' => $gananciaSocio,
                'mi_ganancia' => $miGanancia,
                'total_generado' => $gananciaSocio + $miGanancia,
            ];
        });

        $totalGananciaSocio = (float) $partnersProfit->sum('ganancia_socio');
        $totalMiGanancia = (float) $partnersProfit->sum('mi_ganancia');

        return [
            'filters' => [
                'start_date' => $startDate, 'end_date' => $endDate, 'socio_search' => $socioSearch,
                'balance_search_name' => $balanceSearchName, 'balance_search_doc' => $balanceSearchDoc,
            ],
            'stats' => [
                'total_lent' => (float) $totalLent, 'loans_count' => $loansCount, 'total_collected' => (float) $totalCollected,
                'total_expenses' => (float) $totalExpenses, 'net_flow' => (float) $netFlow,
            ],
            'sociosBalance' => $sociosBalance,
            'partnersProfit' => $partnersProfit,
            'totalsProfit' => [
                'capital_prestado' => (float) $partnersProfit->sum('capital_prestado'),
                'ganancia_socio' => $totalGananciaSocio,
                'mi_ganancia' => $totalMiGanancia,
                'total_generado' => (float) ($totalGananciaSocio + $totalMiGanancia),
            ],
        ];
    }
}
