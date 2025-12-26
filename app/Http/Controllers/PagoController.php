<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Cuota;
use App\Models\Caja;
use App\Models\Prestamo;
use App\Models\Cliente;
use App\Models\Socio;
use App\Models\Ganancia;
use App\Models\RutaDiaria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PagoController extends Controller
{
    public function index()
    {
        return Inertia::render('Payments/Index', [
            'recentPayments' => Pago::with(['cuota.prestamo.cliente', 'usuario'])->latest()->paginate(20)->withQueryString()
        ]);
    }

    public function create()
    {
        $clients = Cliente::whereHas('prestamos')
            ->with(['prestamos' => function ($query) {
                $query->with('cuotas.pagos');
            }])
            ->get();

        return Inertia::render('Payments/Create', [
            'clients' => $clients
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'monto_pagado' => 'required|numeric|min:0.01',
            'mora' => 'nullable|numeric|min:0',
        ]);

        $caja = Caja::where('usuario_id', Auth::id())->where('estado', 'abierta')->first();
        if (!$caja) {
            return back()->withErrors(['error' => 'Debe abrir una caja antes de registrar cobros.']);
        }

        try {
            $pagoData = null;
            
            DB::transaction(function () use ($validated, $caja, &$pagoData) {
                $cuota = Cuota::lockForUpdate()->find($validated['cuota_id']);
                
                $pago = Pago::create([
                    'cuota_id' => $cuota->id,
                    'monto_pagado' => $validated['monto_pagado'],
                    'fecha_pago' => now(),
                    'mora' => $validated['mora'] ?? 0,
                    'usuario_id' => Auth::id(),
                    'caja_id' => $caja->id,
                ]);

                $totalIngreso = $pago->monto_pagado + $pago->mora;
                $caja->increment('total_ingresos', $totalIngreso);
                
                $totalPagadoCuota = $cuota->pagos()->sum('monto_pagado');
                
                if ($totalPagadoCuota >= $cuota->monto) {
                    $cuota->update(['estado' => 'pagado']);
                    
                    $prestamo = $cuota->prestamo;

                    $interestAmountTotal = ($prestamo->monto * $prestamo->interes) / 100;
                    $interestPerCuota = $interestAmountTotal / $prestamo->numero_cuotas;
                    $capitalPerCuota = $prestamo->monto / $prestamo->numero_cuotas;

                    $prestamoSocios = DB::table('prestamo_socio')->where('prestamo_id', $prestamo->id)->get();

                    if ($prestamoSocios->count() > 0) {
                        foreach ($prestamoSocios as $ps) {
                            $socio = Socio::find($ps->socio_id);
                            if (!$socio) continue;

                            $shareInteres = ($interestPerCuota * $ps->porcentaje_participacion) / 100;
                            $shareCapital = ($capitalPerCuota * $ps->porcentaje_participacion) / 100;

                            $gainSocio = ($shareInteres * $ps->porcentaje_ganancia_socio) / 100;
                            $gainOwner = ($shareInteres * $ps->porcentaje_ganancia_dueno) / 100;

                            Ganancia::create([
                                'prestamo_id' => $prestamo->id,
                                'socio_id' => $socio->id,
                                'monto_ganancia_socio' => $gainSocio,
                                'monto_ganancia_dueno' => $gainOwner,
                            ]);

                            $socio->increment('ganancias_acumuladas', $gainSocio);
                            $socio->decrement('capital_comprometido', $shareCapital);
                            $socio->increment('capital_disponible', $shareCapital);

                            if ($gainOwner > 0 && $socio->id != 1) {
                                $owner = Socio::find(1);
                                if ($owner) {
                                    $owner->increment('ganancias_acumuladas', $gainOwner);
                                }
                            }
                        }
                    } else {
                        Ganancia::create([
                            'prestamo_id' => $prestamo->id,
                            'socio_id' => null,
                            'monto_ganancia_socio' => 0,
                            'monto_ganancia_dueno' => $interestPerCuota,
                        ]);
                    }

                    if ($prestamo->cuotas()->where('estado', '!=', 'pagado')->count() === 0) {
                        $prestamo->update(['estado' => 'cancelado']);
                    }
                } else {
                     $cuota->update(['estado' => 'parcial']);
                }
                
                $pago->load(['cuota.prestamo.cliente', 'usuario']);
                $pagoData = $pago;

                // Actualizar automáticamente el estado en la Ruta de Cobro si existe
                $hoy = now()->format('Y-m-d');
                $ruta = RutaDiaria::whereDate('fecha', $hoy)
                    ->where('user_id', Auth::id())
                    ->first();
                
                if ($ruta) {
                    $ruta->marcarComoPagado($cuota->prestamo->cliente_id);
                }
            });

            return back()->with('paymentReceipt', [
                'id' => $pagoData->id,
                'monto_pagado' => $pagoData->monto_pagado,
                'mora' => $pagoData->mora,
                'fecha_pago' => $pagoData->fecha_pago->format('d/m/Y H:i'),
                'cuota_numero' => $pagoData->cuota->numero_cuota,
                'prestamo_id' => $pagoData->cuota->prestamo->id,
                'cliente_nombre' => $pagoData->cuota->prestamo->cliente->nombre,
                'cliente_documento' => $pagoData->cuota->prestamo->cliente->documento,
                'monto_prestamo' => $pagoData->cuota->prestamo->monto,
                'interes' => $pagoData->cuota->prestamo->interes,
                'usuario_nombre' => $pagoData->usuario->name,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al procesar el pago: ' . $e->getMessage()]);
        }
    }
}
