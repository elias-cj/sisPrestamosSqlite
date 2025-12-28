<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pago;
use App\Models\Ganancia;
use Illuminate\Support\Facades\DB;

class RecalculateProfits extends Command
{
    protected $signature = 'profits:recalculate';
    protected $description = 'Recalculate partner profits from historical payments';

    public function handle()
    {
        $this->info('Starting profit recalculation...');
        
        // Limpiar tabla de ganancias para evitar duplicados en reprocesamiento
        Ganancia::truncate();
        $this->info('Ganancias table truncated.');

        $pagos = Pago::with(['cuota.prestamo.socios'])->get();
        $count = 0;

        foreach ($pagos as $pago) {
            if (!$pago->cuota || !$pago->cuota->prestamo) continue;

            $prestamo = $pago->cuota->prestamo;
            $totalPrestamo = $prestamo->monto + $prestamo->interes;
            
            if ($totalPrestamo <= 0) continue;

            $ratioInteres = $prestamo->interes / $totalPrestamo;
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
                    'created_at' => $pago->fecha_pago ?? $pago->created_at, // Usar fecha original del pago
                    'updated_at' => $pago->updated_at,
                ]);

                $socio->increment('ganancias_acumuladas', $gananciaSocio);
            }
            $count++;
        }

        $this->info("Processed $count payments successfully.");
    }
}
