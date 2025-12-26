<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Socio;

class SocioSeeder extends Seeder
{
    public function run(): void
    {
        Socio::create([
            'nombre' => 'Inversionista Principal',
            'documento' => '10000001',
            'telefono' => '900000001',
            'capital_inicial' => 100000.00,
            'capital_disponible' => 100000.00,
            'capital_comprometido' => 0.00,
            'ganancias_acumuladas' => 0.00,
            'perdidas_acumuladas' => 0.00,
            'porcentaje_ganancia_socio' => 70.00,
            'porcentaje_ganancia_dueno' => 30.00,
            'estado' => 'activo'
        ]);
        
        Socio::create([
            'nombre' => 'Socio Minoritario',
            'documento' => '10000002',
            'telefono' => '900000002',
            'capital_inicial' => 20000.00,
            'capital_disponible' => 20000.00,
            'capital_comprometido' => 0.00,
            'ganancias_acumuladas' => 0.00,
            'perdidas_acumuladas' => 0.00,
            'porcentaje_ganancia_socio' => 60.00,
            'porcentaje_ganancia_dueno' => 40.00,
            'estado' => 'activo'
        ]);
    }
}
