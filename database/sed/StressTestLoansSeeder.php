<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Socio;
use App\Models\Cliente;
use App\Models\Prestamo;
use App\Models\Cuota;
use App\Models\Pago;
use App\Models\User;
use App\Models\Moneda;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StressTestLoansSeeder extends Seeder
{
    public function run()
    {
        // 1. Limpieza de datos antiguos de prueba para ver todo claro
        echo "Limpiando datos previos de prueba...\n";
        DB::table('ganancias')->truncate();
        DB::table('pagos')->delete();
        DB::table('cuotas')->delete();
        DB::table('prestamo_socio')->truncate();
        DB::table('prestamos')->delete();

        $userId = 1;
        $cajaId = 1;

        // 2. Moneda por defecto
        $moneda = Moneda::first() ?? Moneda::create(['nombre' => 'Bolivianos', 'simbolo' => 'Bs']);

        // 3. Configurar Socios con 10,000 de Capital Inicial
        $escenarios = [
            ['id' => 10, 'nombre' => 'Socio Reparto 50-50', 'ps' => 50, 'pd' => 50],
            ['id' => 11, 'nombre' => 'Socio Reparto 60-40', 'ps' => 60, 'pd' => 40],
            ['id' => 12, 'nombre' => 'Socio Reparto 70-30', 'ps' => 70, 'pd' => 30],
            ['id' => 13, 'nombre' => 'Socio Reparto 80-20', 'ps' => 80, 'pd' => 20],
        ];

        $cliente = Cliente::first() ?? Cliente::create(['nombre' => 'Cliente de Prueba Gral', 'documento' => 'TEST-123']);

        foreach ($escenarios as $esc) {
            echo "Configurando {$esc['nombre']}...\n";
            $socio = Socio::updateOrCreate(['id' => $esc['id']], [
                'nombre' => $esc['nombre'],
                'documento' => 'DOC-' . $esc['id'],
                'capital_inicial' => 10000,
                'capital_disponible' => 10000,
                'capital_comprometido' => 0,
                'ganancias_acumuladas' => 0,
                'porcentaje_ganancia_socio' => $esc['ps'],
                'porcentaje_ganancia_dueno' => $esc['pd'],
                'estado' => 'activo'
            ]);

            // Crear Préstamo de 1000 al 20%
            // 1000 + 20% = 1200 total a pagar.
            $p = Prestamo::create([
                'cliente_id' => $cliente->id,
                'monto' => 1000,
                'interes' => 20,
                'moneda_id' => $moneda->id,
                'fecha_inicio' => Carbon::now()->subDays(5),
                'tipo_pago' => 'diario',
                'numero_cuotas' => 1,
                'valor_cuota' => 1200,
                'estado' => 'activo'
            ]);

            DB::table('prestamo_socio')->insert([
                'prestamo_id' => $p->id,
                'socio_id' => $socio->id,
                'monto_aportado' => 1000,
                'porcentaje_participacion' => 100,
                'porcentaje_ganancia_socio' => $esc['ps'],
                'porcentaje_ganancia_dueno' => $esc['pd'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $socio->decrement('capital_disponible', 1000);
            $socio->increment('capital_comprometido', 1000);

            // Crear Cuota y Pagarla
            $cuota = Cuota::create([
                'prestamo_id' => $p->id,
                'numero_cuota' => 1,
                'fecha_programada' => now(),
                'monto' => 1200,
                'estado' => 'pendiente'
            ]);

            Pago::create([
                'cuota_id' => $cuota->id,
                'monto_pagado' => 1200,
                'fecha_pago' => Carbon::now()->toDateString(),
                'mora' => 0,
                'usuario_id' => $userId,
                'caja_id' => $cajaId
            ]);

            // Distribuir Ganancia (Replicando lógica del controlador)
            $this->distributePayment($cuota);
            
            $p->update(['estado' => 'cancelado']);
        }

        echo "Stress Test Seeded with uniform 10,000 capital and 1,000 loans @ 20% interest.\n";
    }

    private function distributePayment($cuota)
    {
        $prestamo = $cuota->prestamo;
        $cuota->update(['estado' => 'pagado']);

        $interestTotal = ($prestamo->monto * $prestamo->interes) / 100; // 200
        $capitalTotal = $prestamo->monto; // 1000

        $psocios = DB::table('prestamo_socio')->where('prestamo_id', $prestamo->id)->get();

        foreach ($psocios as $ps) {
            $socio = Socio::find($ps->socio_id);
            
            // Ganancia total del préstamo asignada a este socio según su participación (100% en este caso)
            $shareInteres = ($interestTotal * $ps->porcentaje_participacion) / 100;
            $shareCapital = ($capitalTotal * $ps->porcentaje_participacion) / 100;

            // División entre Socio y Dueño
            $gainSocio = ($shareInteres * $ps->porcentaje_ganancia_socio) / 100;
            $gainOwner = ($shareInteres * $ps->porcentaje_ganancia_dueno) / 100;

            DB::table('ganancias')->insert([
                'prestamo_id' => $prestamo->id,
                'socio_id' => $socio->id,
                'monto_ganancia_socio' => $gainSocio,
                'monto_ganancia_dueno' => $gainOwner,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $socio->increment('ganancias_acumuladas', $gainSocio);
            $socio->decrement('capital_comprometido', $shareCapital);
            $socio->increment('capital_disponible', $shareCapital);

            // Consolidar en el Dueño (ID 1) si el socio actual no es el dueño
            if ($socio->id != 1 && $gainOwner > 0) {
                $owner = Socio::find(1);
                if ($owner) {
                    $owner->increment('ganancias_acumuladas', $gainOwner);
                }
            }
        }
    }
}
