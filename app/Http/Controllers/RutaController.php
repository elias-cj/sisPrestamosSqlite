<?php

namespace App\Http\Controllers;

use App\Models\RutaDiaria;
use App\Models\Cliente;
use App\Models\Cuota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RutaController extends Controller
{
    public function index()
    {
        $hoy = now()->format('Y-m-d');
        $userId = auth()->id();

        // Obtener ruta del día (Manejar concurrencia y formato SQLite)
        $ruta = RutaDiaria::whereDate('fecha', $hoy)
            ->where('user_id', $userId)
            ->first();

        if (!$ruta) {
            try {
                $ruta = RutaDiaria::create([
                    'fecha' => $hoy,
                    'user_id' => $userId,
                    'orden' => [],
                    'bloqueada' => false
                ]);
            } catch (\Exception $e) {
                // En caso de concurrencia (prefetch), reintentar obtención
                $ruta = RutaDiaria::whereDate('fecha', $hoy)
                    ->where('user_id', $userId)
                    ->first();
            }
        }

        if (!$ruta) {
            return Inertia::render('Error', ['message' => 'No se pudo inicializar la ruta del día. Pruebe refrescando la página.']);
        }

        // Obtener el orden guardado para saber qué clientes incluir aunque ya hayan pagado
        $ordenGuardado = $ruta->orden ?? [];
        $idsEnRuta = collect($ordenGuardado)->pluck('cliente_id')->unique()->toArray();

        // Obtener clientes con cuotas pendientes hoy O que ya estén en la ruta
        $clientesConCuotas = DB::table('clientes')
            ->join('prestamos', 'clientes.id', '=', 'prestamos.cliente_id')
            ->leftJoin('cuotas', function($join) use ($hoy) {
                $join->on('prestamos.id', '=', 'cuotas.prestamo_id')
                     ->whereDate('cuotas.fecha_programada', '<=', $hoy)
                     ->where('cuotas.estado', '!=', 'pagado');
            })
            ->leftJoin('pagos', function($join) use ($hoy) {
                $join->on('cuotas.id', '=', 'pagos.cuota_id')
                     ->whereDate('pagos.fecha_pago', $hoy);
            })
            ->where(function($query) use ($idsEnRuta) {
                $query->where('prestamos.estado', 'activo')
                      ->orWhereIn('clientes.id', $idsEnRuta);
            })
            ->select(
                'clientes.id as cliente_id',
                'clientes.nombre',
                'clientes.documento',
                'prestamos.id as prestamo_id',
                'cuotas.id as cuota_id',
                'cuotas.numero_cuota',
                'cuotas.monto',
                'cuotas.fecha_programada',
                DB::raw('(SELECT SUM(monto_pagado) FROM pagos WHERE pagos.cuota_id IN (SELECT id FROM cuotas WHERE cuotas.prestamo_id = prestamos.id) AND DATE(pagos.fecha_pago) = "'.$hoy.'") as pagado_hoy')
            )
            ->get()
            ->groupBy('cliente_id')
            ->map(function ($cuotas) {
                $primera = $cuotas->first();
                // Filtrar las cuotas que realmente son pendientes para el cálculo de montos
                $cuotasPendientes = $cuotas->whereNotNull('cuota_id');
                
                // Si no hay cuotas pendientes pero el cliente está en ruta, obtener el monto de la cuota del préstamo
                $montoCobrar = 0;
                if ($cuotasPendientes->count() > 0) {
                    // Usar el monto de la primera cuota pendiente
                    $montoCobrar = (float) $cuotasPendientes->first()->monto;
                } else if ($primera->prestamo_id) {
                    // Si ya pagó hoy pero sigue en ruta, obtener el valor de cuota del préstamo
                    $prestamo = \App\Models\Prestamo::find($primera->prestamo_id);
                    if ($prestamo) {
                        $montoCobrar = (float) $prestamo->valor_cuota;
                    }
                }
                
                return [
                    'cliente_id' => $primera->cliente_id,
                    'nombre' => $primera->nombre,
                    'documento' => $primera->documento,
                    'prestamo_id' => $primera->prestamo_id,
                    'cuota_id' => $primera->cuota_id,
                    'monto_cobrar' => $montoCobrar,
                    'monto_pagado' => (float) ($primera->pagado_hoy ?? 0),
                    'cuotas_pendientes' => $cuotasPendientes->count(),
                    'dias_mora' => $primera->fecha_programada 
                        ? max(0, Carbon::parse($primera->fecha_programada)->diffInDays(now(), false))
                        : 0,
                ];
            })
            ->values();

        // Mezclar con orden guardado
        $ordenGuardado = $ruta->orden ?? [];
        $ordenMap = collect($ordenGuardado)->keyBy('cliente_id');

        $clientesFinales = $clientesConCuotas->map(function ($cliente) use ($ordenMap) {
            $ordenInfo = $ordenMap->get($cliente['cliente_id']);
            return array_merge($cliente, [
                'posicion' => $ordenInfo['posicion'] ?? 999,
                'estado' => $ordenInfo['estado'] ?? 'pendiente',
                'nota' => $ordenInfo['nota'] ?? null,
                'hora_estimada' => $ordenInfo['hora_estimada'] ?? null,
            ]);
        })->sortBy('posicion')->values();

        // Cargar Ubicaciones de los clientes en ruta
        $idsClientes = $clientesFinales->pluck('cliente_id')->unique();
        $ubicaciones = \App\Models\ClienteUbicacion::whereIn('cliente_id', $idsClientes)->get()->groupBy('cliente_id');

        $clientesOrdenados = $clientesFinales->map(function($c) use ($ubicaciones) {
            $c['ubicaciones'] = $ubicaciones->get($c['cliente_id']) ?? [];
            return $c;
        });

        // Calcular estadísticas
        $stats = [
            'total_pendiente' => $clientesOrdenados->where('estado', 'pendiente')->sum('monto_cobrar'),
            'total_cobrado' => $clientesOrdenados->sum('monto_pagado'),
            'count_pendientes' => $clientesOrdenados->where('estado', 'pendiente')->count(),
            'count_pagados' => $clientesOrdenados->where('estado', 'pagado')->count(),
            'count_mas_tarde' => $clientesOrdenados->where('estado', 'mas_tarde')->count(),
            'count_saltados' => $clientesOrdenados->where('estado', 'saltado')->count(),
        ];

        return Inertia::render('Rutas/Index', [
            'clientes' => $clientesOrdenados,
            'ruta' => [
                'id' => $ruta->id,
                'fecha' => $ruta->fecha->format('Y-m-d'),
                'bloqueada' => $ruta->bloqueada,
            ],
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasPermission('ruta.administrar')) {
            return back()->with('error', 'No tienes permiso para ordenar la ruta.');
        }

        $validated = $request->validate([
            'orden' => 'required|array',
            'orden.*.cliente_id' => 'required|integer',
            'orden.*.posicion' => 'required|integer',
            'orden.*.estado' => 'required|string|in:pendiente,pagado,mas_tarde,saltado',
        ]);

        $hoy = now()->toDateString();
        $userId = auth()->id();

        $ruta = RutaDiaria::whereDate('fecha', $hoy)
            ->where('user_id', $userId)
            ->firstOrFail();

        $ruta->orden = $validated['orden'];
        $ruta->save();

        return back()->with('success', 'Ruta actualizada correctamente');
    }

    public function updateEstado(Request $request, $clienteId)
    {
        $validated = $request->validate([
            'estado' => 'required|string|in:pendiente,pagado,mas_tarde,saltado',
            'nota' => 'nullable|string|max:255',
            'hora_estimada' => 'nullable|string',
        ]);

        $hoy = now()->toDateString();
        $userId = auth()->id();

        $ruta = RutaDiaria::whereDate('fecha', $hoy)
            ->where('user_id', $userId)
            ->firstOrFail();

        $ruta->actualizarEstadoCliente(
            $clienteId,
            $validated['estado'],
            $validated['nota'] ?? null,
            $validated['hora_estimada'] ?? null
        );

        return back()->with('success', 'Estado actualizado');
    }

    public function toggleBloqueo(Request $request)
    {
        if (!$request->user()->hasPermission('ruta.administrar')) {
            return back()->with('error', 'No tienes permiso para bloquear la ruta.');
        }

        $hoy = now()->format('Y-m-d');
        $userId = auth()->id();

        $ruta = RutaDiaria::whereDate('fecha', $hoy)
            ->where('user_id', $userId)
            ->firstOrFail();

        $ruta->bloqueada = !$ruta->bloqueada;
        $ruta->save();

        return back()->with('success', $ruta->bloqueada ? 'Ruta bloqueada' : 'Ruta desbloqueada');
    }

    public function storeUbicacion(Request $request, $clienteId)
    {
        if (!$request->user()->hasPermission('ruta.gps.capturar')) {
            return back()->with('error', 'No tienes permiso para capturar ubicaciones.');
        }

        $validated = $request->validate([
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
            'tipo' => 'required|string|in:hogar,trabajo,negocio,otro',
            'es_principal' => 'boolean'
        ]);

        // Limpiar ubicaciones anteriores para mantener "solo una ruta"
        \App\Models\ClienteUbicacion::where('cliente_id', $clienteId)->delete();

        \App\Models\ClienteUbicacion::create([
            'cliente_id' => $clienteId,
            'latitud' => $validated['latitud'],
            'longitud' => $validated['longitud'],
            'tipo' => $validated['tipo'],
            'es_principal' => $validated['es_principal'] ?? true,
        ]);

        return back()->with('success', 'Ubicación guardada correctamente');
    }

    public function destroyUbicacion(Request $request, $ubicacionId)
    {
        if (!$request->user()->hasPermission('ruta.gps.eliminar')) {
            return back()->with('error', 'No tienes permiso para eliminar ubicaciones GPS.');
        }

        $ubicacion = \App\Models\ClienteUbicacion::findOrFail($ubicacionId);
        $ubicacion->delete();

        return back()->with('success', 'Ubicación eliminada');
    }
}
