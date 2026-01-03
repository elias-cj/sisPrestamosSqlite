<?php

namespace App\Services;

use App\Models\Pago;
use App\Models\Cuota;
use App\Models\Caja;
use App\Models\Ganancia;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function processPayment(array $data, Caja $caja)
    {
        return DB::transaction(function () use ($data, $caja) {
            $cuota = Cuota::with('prestamo.socios')->findOrFail($data['cuota_id']);
            
            $payment = Pago::create([
                'cuota_id' => $cuota->id,
                'monto_pagado' => $data['monto_pagado'],
                'metodo_pago' => $data['metodo_pago'] ?? 'efectivo',
                'referencia_pago' => $data['referencia_pago'] ?? null,
                'fecha_pago' => now(),
                'mora' => $data['mora'] ?? 0,
                'usuario_id' => auth()->id(),
                'caja_id' => $caja->id,
            ]);
            
            // Update Caja
            $caja->increment('total_ingresos', $payment->monto_pagado + $payment->mora);
            
            // Update Cuota Status
            $totalPagado = $cuota->pagos()->where('estado', '!=', 'anulado')->sum('monto_pagado');
            if ($totalPagado >= $cuota->monto) {
                $cuota->update(['estado' => 'pagado']);
                // Distribute Profits logic here (Simplified Trigger)
                $this->distributeProfits($cuota, $payment);
            } else {
                 $cuota->update(['estado' => 'parcial']);
            }
            
            return $payment;
        });
    }
    
    public function annulPayment(Pago $pago, string $motivo)
    {
        return DB::transaction(function () use ($pago, $motivo) {
            // 1. Marcar el pago como anulado
            $pago->update([
                'estado' => 'anulado',
                'motivo_anulacion' => $motivo
            ]);

            // 2. Revertir Caja
            $caja = $pago->caja;
            if ($caja && $caja->estado === 'abierta') {
                $caja->decrement('total_ingresos', $pago->monto_pagado + $pago->mora);
            }

            // 3. Revertir Estado de la Cuota
            $cuota = $pago->cuota;
            $totalPagadoRestante = $cuota->pagos()->where('estado', '!=', 'anulado')->sum('monto_pagado');
            
            if ($totalPagadoRestante <= 0) {
                $cuota->update(['estado' => 'pendiente']);
            } else if ($totalPagadoRestante < $cuota->monto) {
                $cuota->update(['estado' => 'parcial']);
            }

            // 4. Revertir Estado del Préstamo
            $prestamo = $cuota->prestamo;
            if ($prestamo->estado === 'cancelado') {
                $prestamo->update(['estado' => 'activo']);
                
                // Revertir capital de socios si fue devuelto
                $prestamoSocios = DB::table('prestamo_socio')->where('prestamo_id', $prestamo->id)->get();
                foreach ($prestamoSocios as $ps) {
                    $socio = \App\Models\Socio::find($ps->socio_id);
                    if ($socio) {
                        $socio->increment('capital_comprometido', $ps->monto_aportado);
                        $socio->decrement('capital_disponible', $ps->monto_aportado);
                    }
                }
            }

            // 5. Revertir Ganancias de Socios
            $ganancias = \App\Models\Ganancia::where('pago_id', $pago->id)->get();
            foreach ($ganancias as $ganancia) {
                $socio = $ganancia->socio;
                if ($socio) {
                    $socio->decrement('ganancias_acumuladas', $ganancia->monto_ganancia_socio);
                }
                $ganancia->delete();
            }

            return $pago;
        });
    }

    protected function distributeProfits(Cuota $cuota, Pago $payment)
    {
        // 1. Calcular la ganancia real de este pago (Interés)
        // Fórmula: Pago * (Interés Total / Total a Pagar del Préstamo)
        // Ejemplo: Préstamo 1000 + 200 Interés = 1200. Pago de 120.
        // Ratio = 200 / 1200 = 0.1666...
        // Ganancia = 120 * 0.1666 = 20.
        
        $totalPrestamo = $cuota->prestamo->monto + $cuota->prestamo->interes;
        
        // Evitar división por cero
        if ($totalPrestamo <= 0) return;
        
        $ratioInteres = $cuota->prestamo->interes / $totalPrestamo;
        
        // La ganancia base es la parte proporcional del interés + la mora completa
        $gananciaBase = ($payment->monto_pagado * $ratioInteres) + $payment->mora;
        
        foreach($cuota->prestamo->socios as $socio) {
            // pivot->porcentaje_ganancia_socio es ej: 50 (para 50%)
            $porcentajeSocio = $socio->pivot->porcentaje_ganancia_socio / 100;
            $porcentajeDueno = $socio->pivot->porcentaje_ganancia_dueno / 100;

            $gananciaSocio = $gananciaBase * $porcentajeSocio;
            $gananciaDueno = $gananciaBase * $porcentajeDueno;
            
            // Crear registro de ganancia
            Ganancia::create([
                'prestamo_id' => $cuota->prestamo_id,
                'socio_id' => $socio->id,
                'pago_id' => $payment->id,
                'monto_ganancia_socio' => $gananciaSocio,
                'monto_ganancia_dueno' => $gananciaDueno,
                'fecha' => now(),
            ]);
            
            // Actualizar acumulados del socio
            $socio->increment('ganancias_acumuladas', $gananciaSocio);
            // Opcional: Si el socio reinvierte o retira, eso es otra lógica. 
            // Por ahora solo acumulamos el histórico.
        }
    }
}
