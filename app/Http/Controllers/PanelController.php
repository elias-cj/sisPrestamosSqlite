<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Prestamo;
use App\Models\Pago;
use App\Models\Gasto;
use App\Models\Socio;
use App\Models\Caja;
use App\Models\Cuota;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PanelController extends Controller
{
    public function index(Request $request) {
        $period = $request->input('period', 'monthly'); 
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $now = Carbon::now();
        $fechaInicio = $now->copy()->startOfMonth();
        $fechaFin = $now->copy()->endOfMonth();

        switch ($period) {
            case 'daily':
                $fechaInicio = $now->copy()->startOfDay();
                $fechaFin = $now->copy()->endOfDay();
                break;
            case 'weekly':
                $fechaInicio = $now->copy()->startOfWeek();
                $fechaFin = $now->copy()->endOfWeek();
                break;
            case 'monthly':
                $fechaInicio = $now->copy()->startOfMonth();
                $fechaFin = $now->copy()->endOfMonth();
                break;
            case 'quarterly':
                $fechaInicio = $now->copy()->startOfQuarter();
                $fechaFin = $now->copy()->endOfQuarter();
                break;
            case 'annual':
                $fechaInicio = $now->copy()->startOfYear();
                $fechaFin = $now->copy()->endOfYear();
                break;
            case 'custom':
                if ($startDate && $endDate) {
                    $fechaInicio = Carbon::parse($startDate)->startOfDay();
                    $fechaFin = Carbon::parse($endDate)->endOfDay();
                }
                break;
        }

        $capitalPrestado = Prestamo::whereBetween('created_at', [$fechaInicio, $fechaFin])
                            ->whereIn('estado', ['activo', 'vencido', 'pagado', 'cancelado'])
                            ->sum('monto');

        $inicioMesPasado = $fechaInicio->copy()->subMonth();
        $finMesPasado = $fechaFin->copy()->subMonth();
        $capitalMesPasado = Prestamo::whereBetween('created_at', [$inicioMesPasado, $finMesPasado])->sum('monto');
        $procentajeCrecimiento = $capitalMesPasado > 0 ? (($capitalPrestado - $capitalMesPasado) / $capitalMesPasado) * 100 : 0;

        $totalPagos = Pago::whereBetween('created_at', [$fechaInicio, $fechaFin])
            ->with('cuota.prestamo')
            ->get();

        $interesRecuperado = $totalPagos->sum(function($pago) {
            $prestamo = $pago->cuota->prestamo;
            $totalPrestamo = $prestamo->monto + $prestamo->interes;
            $ratioInteres = $totalPrestamo > 0 ? ($prestamo->interes / $totalPrestamo) : 0;
            return ($pago->monto_pagado * $ratioInteres) + $pago->mora;
        });

        $totalGastos = Gasto::whereBetween('fecha', [$fechaInicio, $fechaFin])->sum('monto');
        $gananciasNetas = $interesRecuperado - $totalGastos; 

        $nuevosPrestamos = Prestamo::whereBetween('created_at', [$fechaInicio, $fechaFin])->count();
        $sociosActivos = Socio::where('estado', 'activo')->count();
        $capitalEnCalle = Socio::where('estado', 'activo')->sum('capital_comprometido');

        $iter = $fechaInicio->copy();
        $evolucionData = [];
        $esPeriodoLargo = $fechaInicio->diffInDays($fechaFin) > 60;
        $formatoDisplay = $esPeriodoLargo ? 'M Y' : 'd/m';

        while($iter <= $fechaFin) {
            $s = $esPeriodoLargo ? $iter->copy()->startOfMonth() : $iter->copy()->startOfDay();
            $e = $esPeriodoLargo ? $iter->copy()->endOfMonth() : $iter->copy()->endOfDay();
            
            $montoPrestado = Prestamo::whereBetween('created_at', [$s, $e])->sum('monto');
            $montoCobrado = Pago::whereBetween('created_at', [$s, $e])->sum('monto_pagado');
            
            $evolucionData[] = [
                'name' => $iter->format($formatoDisplay),
                'monto_prestado' => (float)$montoPrestado,
                'monto_cobrado' => (float)$montoCobrado
            ];
            
            if ($esPeriodoLargo) $iter->addMonth(); else $iter->addDay();
        }

        $rankingMora = DB::table('cuotas')
            ->join('prestamos', 'cuotas.prestamo_id', '=', 'prestamos.id')
            ->join('clientes', 'prestamos.cliente_id', '=', 'clientes.id')
            ->where('cuotas.estado', '!=', 'pagado')
            ->where('cuotas.fecha_programada', '<', now()->toDateString())
            ->select('clientes.nombre', DB::raw('SUM(cuotas.monto) as deuda'), DB::raw('MIN(cuotas.fecha_programada) as fecha_viejisima'))
            ->groupBy('clientes.id', 'clientes.nombre')
            ->orderBy('fecha_viejisima')
            ->take(5)
            ->get()
            ->map(function($m) {
                $dias = Carbon::parse($m->fecha_viejisima)->diffInDays(now());
                $color = $dias > 60 ? 'red' : ($dias > 30 ? 'orange' : 'yellow');
                return [
                    'cliente' => $m->nombre,
                    'monto' => $m->deuda,
                    'dias' => $dias,
                    'riesgo' => $color
                ];
            });

        $estadoPrestamos = [
            ['name' => 'Al Día', 'value' => Prestamo::where('estado', 'activo')->count()],
            ['name' => 'En Mora', 'value' => Prestamo::where('estado', 'vencido')->count()],
            ['name' => 'Cancelados', 'value' => Prestamo::where('estado', 'cancelado')->count()],
        ];

        $actividadReciente = Pago::with(['cuota.prestamo.cliente'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'cliente' => $p->cuota->prestamo->cliente->nombre ?? 'N/A',
                    'monto' => $p->monto_pagado,
                    'fecha' => Carbon::parse($p->created_at)->diffForHumans(),
                ];
            });

        $caja = Caja::where('usuario_id', auth()->id())
            ->where('estado', 'abierta')
            ->first();

        return Inertia::render('Dashboard', [
            'stats' => [
                'capital_prestado' => (float)$capitalPrestado,
                'ganancias_netas' => (float)$gananciasNetas,
                'nuevos_prestamos' => $nuevosPrestamos, 
                'socios_activos' => $sociosActivos,
                'crecimiento' => round($procentajeCrecimiento, 1),
                'capital_en_calle' => (float)$capitalEnCalle,
            ],
            'evolutionData' => $evolucionData,
            'rankingMora' => $rankingMora,
            'loansStatus' => $estadoPrestamos,
            'actividadReciente' => $actividadReciente,
            'alerts' => Cuota::with('prestamo.cliente')->whereDate('fecha_programada', now()->toDateString())->where('estado', '!=', 'pagado')->take(5)->get()->map(fn($c) => ['cliente' => $c->prestamo->cliente->nombre, 'monto' => $c->monto]),
            'filters' => [
                'period' => $period,
                'start_date' => $fechaInicio->format('Y-m-d'),
                'end_date' => $fechaFin->format('Y-m-d'),
            ],
            'caja' => $caja ? [
                'id' => $caja->id,
                'monto_apertura' => (float)$caja->monto_apertura,
                'saldo_actual' => (float)($caja->monto_apertura + $caja->total_ingresos - $caja->total_egresos), 
                'ingresos_hoy' => (float)$caja->total_ingresos,
            ] : null,
        ]);
    }
}
