<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

use App\Models\User;
use App\Models\Socio;
use App\Models\Cliente;
use App\Models\Moneda;
use App\Models\Caja;
use App\Models\Prestamo;
use App\Models\Cuota;
use App\Models\Pago;
use App\Models\Ganancia;
use Illuminate\Support\Facades\DB;

class FinancialCalculationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $owner;
    protected $socio;
    protected $cliente;
    protected $moneda;
    protected $caja;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        
        // El dueño del sistema suele ser el Socio ID 1
        $this->owner = Socio::create([
            'id' => 1,
            'nombre' => 'Dueño Sistema',
            'documento' => '1',
            'capital_inicial' => 10000,
            'capital_disponible' => 10000,
            'capital_comprometido' => 0,
            'porcentaje_ganancia_socio' => 100,
            'porcentaje_ganancia_dueno' => 0,
            'estado' => 'activo'
        ]);

        $this->socio = Socio::create([
            'nombre' => 'Socio Inversionista',
            'documento' => '12345',
            'capital_inicial' => 5000,
            'capital_disponible' => 5000,
            'capital_comprometido' => 0,
            'porcentaje_ganancia_socio' => 70, // 70% para él
            'porcentaje_ganancia_dueno' => 30, // 30% para el dueño
            'estado' => 'activo'
        ]);

        $this->cliente = Cliente::create([
            'nombre' => 'Cliente Prueba',
            'documento' => '999',
            'estado_crediticio' => 'normal'
        ]);

        $this->moneda = Moneda::create([
            'nombre' => 'Bolivianos',
            'simbolo' => 'Bs',
            'codigo' => 'Bs',
            'estado' => 'activo'
        ]);

        $this->caja = Caja::create([
            'usuario_id' => $this->user->id,
            'fecha' => now()->toDateString(),
            'monto_apertura' => 1000,
            'total_ingresos' => 0,
            'total_egresos' => 0,
            'estado' => 'abierta',
        ]);
    }

    public function test_loan_creation_and_quota_calculation()
    {
        $loanData = [
            'cliente_id' => $this->cliente->id,
            'moneda_id' => $this->moneda->id,
            'monto' => 1000,
            'interes' => 10,
            'tipo_pago' => 'mensual',
            'numero_cuotas' => 10,
            'fecha_inicio' => now()->toDateString(),
        ];

        $investors = [
            ['socio_id' => $this->socio->id, 'monto' => 1000]
        ];

        $service = app(\App\Services\LoanService::class);
        $loan = $service->createLoan($loanData, $investors);

        // Verificaciones
        $this->assertEquals(1100, $loan->monto + ($loan->monto * 0.1));
        $this->assertEquals(110, $loan->valor_cuota);
        $this->assertCount(10, $loan->cuotas);
        
        // Verificar balance del socio
        $this->socio->refresh();
        $this->assertEquals(4000, $this->socio->capital_disponible);
        $this->assertEquals(1000, $this->socio->capital_comprometido);
    }

    public function test_payment_and_profit_distribution()
    {
        // 1. Crear Préstamo
        $loanData = [
            'cliente_id' => $this->cliente->id,
            'moneda_id' => $this->moneda->id,
            'monto' => 1000,
            'interes' => 10, // 100 Bs interés total
            'tipo_pago' => 'mensual',
            'numero_cuotas' => 10, // 10 Bs interés por cuota
            'fecha_inicio' => now()->toDateString(),
        ];

        $investors = [
            ['socio_id' => $this->socio->id, 'monto' => 1000]
        ];

        $service = app(\App\Services\LoanService::class);
        $loan = $service->createLoan($loanData, $investors);
        $cuota = $loan->cuotas->first();

        // 2. Realizar Pago
        $this->actingAs($this->user);
        
        $response = $this->post(route('payments.store'), [
            'cuota_id' => $cuota->id,
            'monto_pagado' => 110, // Cuota completa
            'mora' => 0
        ]);

        $response->assertStatus(302);

        // 3. Verificar Distribución de Ganancias
        // Interés cuota = 10 Bs.
        // Socio (70%): 7 Bs.
        // Dueño (30%): 3 Bs.
        
        $gananciaSocio = Ganancia::where('socio_id', $this->socio->id)->first();
        $this->assertEquals(7, $gananciaSocio->monto_ganancia_socio);
        $this->assertEquals(3, $gananciaSocio->monto_ganancia_dueno);

        // Verificar balances finales
        $this->socio->refresh();
        $this->assertEquals(7, $this->socio->ganancias_acumuladas);
        $this->assertEquals(4000 + (1000/10), $this->socio->capital_disponible); // Capital retornado: 100
        $this->assertEquals(900, $this->socio->capital_comprometido);

        $this->owner->refresh();
        $this->assertEquals(3, $this->owner->ganancias_acumuladas);
    }
}
