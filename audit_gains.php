<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Socio;
use App\Models\Prestamo;
use App\Models\Cuota;
use App\Models\Pago;
use App\Models\Cliente;
use App\Models\Moneda;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

// Mock login as Admin (ID 1)
$admin = App\Models\User::find(1);
Auth::login($admin);

// 1. Setup Socio A (70/30)
$socioA = Socio::updateOrCreate(['id' => 15], [
    'nombre' => 'Socio Audit 70-30',
    'documento' => 'AUDIT-7030',
    'capital_inicial' => 1000,
    'capital_disponible' => 1000,
    'porcentaje_ganancia_socio' => 70,
    'porcentaje_ganancia_dueno' => 30,
    'estado' => 'activo'
]);

$owner = Socio::find(1);
$ownerInitialGain = (float) $owner->ganancias_acumuladas;

echo "Gains Iniciales Owner: {$ownerInitialGain}\n";

$cliente = Cliente::first() ?? Cliente::create(['nombre' => 'Audit Client', 'documento' => '99999']);
$moneda = Moneda::first() ?? Moneda::create(['nombre' => 'BOB', 'simbolo' => 'Bs']);

// 2. Clear previous audit loans
DB::table('prestamos')->where('cliente_id', $cliente->id)->delete();

// 3. Create Loan: 1000 at 20% (split 70/30)
// 1000 + 20% = 1200.
$prestamo = Prestamo::create([
    'cliente_id' => $cliente->id,
    'monto' => 1000,
    'interes' => 20,
    'moneda_id' => $moneda->id,
    'fecha_inicio' => Carbon::now(),
    'tipo_pago' => 'diario',
    'numero_cuotas' => 1,
    'valor_cuota' => 1200,
    'estado' => 'activo'
]);

DB::table('prestamo_socio')->insert([
    'prestamo_id' => $prestamo->id,
    'socio_id' => $socioA->id,
    'monto_aportado' => 1000,
    'porcentaje_participacion' => 100,
    'porcentaje_ganancia_socio' => 70,
    'porcentaje_ganancia_dueno' => 30,
    'created_at' => now(),
    'updated_at' => now(),
]);

$socioA->update(['capital_comprometido' => 1000, 'capital_disponible' => 0, 'ganancias_acumuladas' => 0]);

echo "Prestamo Creado (1000 al 20%, 1 cuota de 1200).\n";

// 4. Pay Cuota
$cuota = Cuota::create([
    'prestamo_id' => $prestamo->id,
    'numero_cuota' => 1,
    'fecha_programada' => now(),
    'monto' => 1200,
    'estado' => 'pendiente'
]);

// Prepare Caja
$caja = App\Models\Caja::updateOrCreate(['usuario_id' => 1, 'estado' => 'abierta'], ['valor_inicial' => 1000]);

// Use the ACTUAL PaymentController to see if my fix works
$controller = new App\Http\Controllers\PaymentController();
$request = new Illuminate\Http\Request([
    'cuota_id' => $cuota->id,
    'monto_pagado' => 1200,
]);

echo "Ejecutando Pago...\n";
$controller->store($request);

$socioA->refresh();
$owner->refresh();

echo "\n--- RESULTADOS AUDITORIA ---\n";
echo "Socio A Gains: {$socioA->ganancias_acumuladas} (Esperado 140)\n";
echo "Owner Gains: {$owner->ganancias_acumuladas} (Esperado " . ($ownerInitialGain + 60) . ")\n";
echo "Socio A Disponible: {$socioA->capital_disponible} (Esperado 1000)\n";
echo "Socio A Comprometido: {$socioA->capital_comprometido} (Esperado 0)\n";
echo "TOTAL OWNER RECOGNIZED: " . ($owner->ganancias_acumuladas - $ownerInitialGain) . " (Esperado 60)\n";
