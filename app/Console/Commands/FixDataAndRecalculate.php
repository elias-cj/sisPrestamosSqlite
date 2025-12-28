<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Prestamo;
use App\Models\Socio;
use App\Models\Ganancia;
use App\Models\Pago;
use Illuminate\Support\Facades\DB;

class FixDataAndRecalculate extends Command
{
    protected $signature = 'data:fix-and-recalc';
    protected $description = 'Fixes corrupted interest data and recalculates all profits';

    public function handle()
    {
        $this->info("STARTING MASTER FIX...");

        DB::transaction(function () {
            // STEP 1: FIX PRESTAMO INTEREST (Percentage stored as amount)
            $loans = Prestamo::all();
            foreach ($loans as $loan) {
                // Heuristic: If Interest is small (e.g. <= 100) but Monto is large (>= 500)
                // And it looks like a percentage (e.g. 20 for 20%)
                // We calculate what the interest SHOUL D be.
                if ($loan->interes <= 100 && $loan->monto >= 500) {
                    $assumedRate = $loan->interes; // Treat the stored amount as the rate
                    $correctInterest = $loan->monto * ($assumedRate / 100);
                    
                    $this->info("Fixing Loan ID {$loan->id}: Interest {$loan->interes} -> {$correctInterest}");
                    
                    $loan->interes = $correctInterest;
                    $loan->save();
                }
            }

            // STEP 2: RESET ACCUMULATORS AND TRUNCATE GANANCIAS
            $this->info("Resetting Socio accumulators and clearing Ganancias table...");
            Socio::query()->update(['ganancias_acumuladas' => 0]);
            Ganancia::truncate();

            // STEP 3: RECALCULATE FROM PAYMENTS
            $this->info("Recalculating profits from payments...");
            $pagos = Pago::with(['cuota.prestamo.socios'])->get();
            
            foreach ($pagos as $pago) {
                if (!$pago->cuota || !$pago->cuota->prestamo) continue;

                $prestamo = $pago->cuota->prestamo;
                $totalPrestamo = $prestamo->monto + $prestamo->interes; // Uses FIXED interest now

                if ($totalPrestamo <= 0) continue;

                $ratioInteres = $prestamo->interes / $totalPrestamo;
                // Profit = (Payment * Ratio) + Mora
                $gananciaBase = ($pago->monto_pagado * $ratioInteres) + $pago->mora;

                foreach ($prestamo->socios as $socio) {
                    $porcentajeSocio = $socio->pivot->porcentaje_ganancia_socio / 100;
                    $porcentajeDueno = $socio->pivot->porcentaje_ganancia_dueno / 100;

                    $gananciaSocio = $gananciaBase * $porcentajeSocio;
                    $gananciaDueno = $gananciaBase * $porcentajeDueno;

                    Ganancia::create([
                        'prestamo_id' => $prestamo->id,
                        'socio_id' => $socio->id,
                        'monto_ganancia_socio' => $gananciaSocio,
                        'monto_ganancia_dueno' => $gananciaDueno,
                        'created_at' => $pago->fecha_pago ?? $pago->created_at,
                        'updated_at' => $pago->updated_at,
                    ]);

                    $socio->increment('ganancias_acumuladas', $gananciaSocio);
                }
            }
        });

        $this->info("MASTER FIX COMPLETED.");
    }
}
