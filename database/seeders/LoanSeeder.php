<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prestamo;
use App\Models\Cliente;
use App\Models\Socio;
use App\Models\Moneda;
use App\Models\Cuota;
use App\Models\Pago;
use App\Models\User;
use App\Models\Caja;
use App\Services\LoanService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        $loanService = app(LoanService::class);
        $clientes = Cliente::all();
        $socios = Socio::all();
        $moneda = Moneda::first();
        $user = User::first();

        if ($clientes->isEmpty() || $socios->isEmpty() || !$moneda || !$user) {
            return;
        }

        // Crear una caja abierta para que los pagos funcionen
        $caja = Caja::firstOrCreate(
            ['usuario_id' => $user->id, 'estado' => 'abierta'],
            [
                'fecha' => now(),
                'monto_apertura' => 10000,
                'total_ingresos' => 0,
                'total_egresos' => 0
            ]
        );

        // Generar préstamos en los últimos 6 meses
        for ($i = 0; $i < 20; $i++) {
            $fechaInicio = Carbon::now()->subMonths(rand(0, 5))->subDays(rand(0, 28));
            $monto = rand(500, 5000);
            $interes = rand(10, 25);
            $cuotasCount = rand(4, 12);
            $cliente = $clientes->random();
            
            // Distribuir inversión entre socios
            $investors = [];
            $socio = $socios->random();
            $investors[] = [
                'socio_id' => $socio->id,
                'monto' => $monto
            ];

            // Reset socio capital to ensure seeder doesn't fail due to insufficient funds
            $socio->update(['capital_disponible' => 1000000]);

            DB::transaction(function () use ($loanService, $cliente, $moneda, $monto, $interes, $cuotasCount, $fechaInicio, $investors, $user, $caja) {
                $loanData = [
                    'cliente_id' => $cliente->id,
                    'moneda_id' => $moneda->id,
                    'monto' => $monto,
                    'interes' => $interes,
                    'tipo_pago' => 'mensual',
                    'numero_cuotas' => $cuotasCount,
                    'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                ];

                $loan = $loanService->createLoan($loanData, $investors);
                
                // Actualizar fechas de creación para simular historial
                $loan->update(['created_at' => $fechaInicio, 'updated_at' => $fechaInicio]);
                $loan->cuotas()->update(['created_at' => $fechaInicio, 'updated_at' => $fechaInicio]);

                // Simular algunos pagos para préstamos que no son del mes actual
                if ($fechaInicio->isBefore(Carbon::now()->startOfMonth())) {
                    $cuotasAPagar = rand(1, floor($cuotasCount / 2));
                    $cuotas = $loan->cuotas()->orderBy('numero_cuota')->take($cuotasAPagar)->get();

                    foreach ($cuotas as $cuota) {
                        $fechaPago = Carbon::parse($cuota->fecha_programada)->addDays(rand(-2, 5));
                        if ($fechaPago->isAfter(now())) continue;

                        $pago = Pago::create([
                            'cuota_id' => $cuota->id,
                            'monto_pagado' => $cuota->monto,
                            'fecha_pago' => $fechaPago,
                            'mora' => rand(0, 5) > 4 ? rand(10, 50) : 0,
                            'usuario_id' => $user->id,
                            'caja_id' => $caja->id,
                            'created_at' => $fechaPago
                        ]);

                        $cuota->update(['estado' => 'pagado', 'updated_at' => $fechaPago]);
                        
                        $totalIngreso = $pago->monto_pagado + $pago->mora;
                        $caja->increment('total_ingresos', $totalIngreso);
                    }
                }
            });
        }
    }
}
