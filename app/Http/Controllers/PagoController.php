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

        $company = \App\Models\Empresa::first();
        if ($company && $company->qr_pago) {
            $company->qr_pago_url = \Illuminate\Support\Facades\Storage::url($company->qr_pago);
        }

        return Inertia::render('Payments/Create', [
            'clients' => $clients,
            'company' => $company
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'monto_pagado' => 'required|numeric|min:0.01',
            'mora' => 'nullable|numeric|min:0',
            'metodo_pago' => 'required|string|in:efectivo,qr,transferencia,tarjeta',
        ]);

        $caja = Caja::where('usuario_id', Auth::id())->where('estado', 'abierta')->first();
        if (!$caja) {
            return back()->withErrors(['error' => 'Debe abrir una caja antes de registrar cobros.']);
        }

        try {
            // Use PaymentService which has correct profit calculation logic
            $paymentService = app(\App\Services\PaymentService::class);
            $pago = $paymentService->processPayment($validated, $caja);
            
            // Actualizar automáticamente el estado en la Ruta de Cobro si existe
            $hoy = now()->format('Y-m-d');
            $ruta = RutaDiaria::whereDate('fecha', $hoy)
                ->where('user_id', Auth::id())
                ->first();
            
            if ($ruta) {
                $ruta->marcarComoPagado($pago->cuota->prestamo->cliente_id);
            }
            
            // Return capital to partners when loan is fully paid
            $cuota = $pago->cuota;
            $prestamo = $cuota->prestamo;
            if ($prestamo->cuotas()->where('estado', '!=', 'pagado')->count() === 0) {
                $prestamo->update(['estado' => 'cancelado']);
                
                $prestamoSocios = DB::table('prestamo_socio')->where('prestamo_id', $prestamo->id)->get();
                foreach ($prestamoSocios as $ps) {
                    $socio = Socio::find($ps->socio_id);
                    if ($socio) {
                        $socio->decrement('capital_comprometido', $ps->monto_aportado);
                        $socio->increment('capital_disponible', $ps->monto_aportado);
                    }
                }
            }
            
            $pago->load(['cuota.prestamo.cliente', 'usuario']);

            return back()->with('paymentReceipt', [
                'id' => $pago->id,
                'monto_pagado' => $pago->monto_pagado,
                'mora' => $pago->mora,
                'fecha_pago' => $pago->fecha_pago->format('d/m/Y H:i'),
                'cuota_numero' => $pago->cuota->numero_cuota,
                'prestamo_id' => $pago->cuota->prestamo->id,
                'cliente_nombre' => $pago->cuota->prestamo->cliente->nombre,
                'cliente_documento' => $pago->cuota->prestamo->cliente->documento,
                'monto_prestamo' => $pago->cuota->prestamo->monto,
                'interes' => $pago->cuota->prestamo->interes,
                'usuario_nombre' => $pago->usuario->name,
                'metodo_pago' => $pago->metodo_pago,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al procesar el pago: ' . $e->getMessage()]);
        }
    }

    public function destroy(Request $request, Pago $payment)
    {
        // Solo administrador puede anular
        if (!Auth::user()->roles()->where('nombre', 'Administrador')->exists()) {
            return back()->withErrors(['error' => 'Solo un administrador puede anular pagos.']);
        }

        $request->validate([
            'motivo_anulacion' => 'required|string|min:20',
        ]);

        try {
            $paymentService = app(\App\Services\PaymentService::class);
            $paymentService->annulPayment($payment, $request->motivo_anulacion);

            return back()->with('success', 'El pago ha sido anulado correctamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al anular el pago: ' . $e->getMessage()]);
        }
    }
}
