<?php

namespace App\Services;

use App\Models\Prestamo;
use App\Models\Cuota;
use App\Models\Socio;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LoanService
{
    public function createLoan(array $data, array $investors)
    {
        return DB::transaction(function () use ($data, $investors) {
            // 1. Calculate Installment Value if not provided?
            // Usually data comes with amounts. Let's ensure consistency.
            // Requirement Step 6 says "monto", "interes", "numero_cuotas".
            // Standard Simple Interest: Total = Monto * (1 + Interes/100). Cuota = Total / Cuotas.
            // Or Interest is per period? Usually "20%" means 20% total or monthly. 
            // Let's assume global interest for the loan duration for simplicity unless specified.
            // "Interes" field usually implies percentage.
            
            $monto = $data['monto'];
            $interesPorcentaje = $data['interes'];
            $cuotas = $data['numero_cuotas'];
            
            // Interest Calculation (Simple Global)
            $totalInteres = $monto * ($interesPorcentaje / 100);
            $totalPagar = $monto + $totalInteres;
            $valorCuota = $totalPagar / $cuotas;
            
            $data['valor_cuota'] = $valorCuota;
            $data['estado'] = 'activo';

            $loan = Prestamo::create($data);
            
            $this->generateSchedule($loan);
            $this->assignInvestors($loan, $investors);
            
            return $loan;
        });
    }
    
    public function generateSchedule(Prestamo $loan)
    {
        $cuotas = [];
        $fecha = Carbon::parse($loan->fecha_inicio);
        
        // Handle Sunday skipping? (Optional business rule, good for production)
        
        for ($i = 1; $i <= $loan->numero_cuotas; $i++) {
            switch ($loan->tipo_pago) {
                case 'diario': 
                    $fecha->addDay();
                    // Optional: Skip Sundays
                    // if ($fecha->isSunday()) $fecha->addDay();
                    break;
                case 'semanal': $fecha->addWeek(); break;
                case 'mensual': $fecha->addMonth(); break;
                case 'trimestral': $fecha->addMonths(3); break;
                case 'semestral': $fecha->addMonths(6); break;
                case 'anual': $fecha->addYear(); break;
            }
            
            $cuotas[] = [
                'prestamo_id' => $loan->id,
                'numero_cuota' => $i,
                'fecha_programada' => $fecha->copy()->format('Y-m-d'),
                'monto' => $loan->valor_cuota,
                'estado' => 'pendiente',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        Cuota::insert($cuotas);
    }
    
    public function assignInvestors(Prestamo $loan, ?array $investors)
    {
        if (is_null($investors)) return;

        $totalAportado = 0;

        foreach ($investors as $investorData) {
            $socio = Socio::lockForUpdate()->findOrFail($investorData['socio_id']);
            $montoAportado = $investorData['monto'];
            
            if ($socio->capital_disponible < $montoAportado) {
                throw new \Exception("El socio {$socio->nombre} no tiene suficiente capital disponible.");
            }
            
            $porcentajeParticipacion = ($montoAportado / $loan->monto) * 100;

            $loan->socios()->attach($socio->id, [
                'monto_aportado' => $montoAportado,
                'porcentaje_participacion' => $porcentajeParticipacion,
                'porcentaje_ganancia_socio' => $socio->porcentaje_ganancia_socio,
                'porcentaje_ganancia_dueno' => $socio->porcentaje_ganancia_dueno,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $socio->decrement('capital_disponible', $montoAportado);
            $socio->increment('capital_comprometido', $montoAportado);

            $totalAportado += $montoAportado;
        }

        // We only validate that investors don't exceed the loan amount
        if ($totalAportado > $loan->monto + 0.01) {
             throw new \Exception("El monto aportado por los socios ({$totalAportado}) excede el monto del préstamo ({$loan->monto}).");
        }
    }
}
