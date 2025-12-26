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
                'fecha_pago' => now(),
                'mora' => $data['mora'] ?? 0,
                'usuario_id' => auth()->id(),
                'caja_id' => $caja->id,
            ]);
            
            // Update Caja
            $caja->increment('total_ingresos', $payment->monto_pagado + $payment->mora);
            
            // Update Cuota Status
            $totalPagado = $cuota->pagos()->sum('monto_pagado');
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
    
    protected function distributeProfits(Cuota $cuota, Pago $payment)
    {
        // Simplification: We assume the payment *contains* profit. 
        // Real logic: Interest portion of the quota is profit. Principal is return of capital.
        // We need to know how much of this quota is Interest.
        // For now, let's assume specific logic or Flat Interest where (Monto - PrincipalPart) = Interest.
        
        foreach($cuota->prestamo->socios as $socio) {
            // Calculate investor share
            // $share = ...
            // Ganancia::create([...]);
        }
    }
}
