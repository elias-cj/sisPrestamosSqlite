<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaGastoSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Servicios Básicos', 'descripcion' => 'Agua, Luz, Internet'],
            ['nombre' => 'Alquiler', 'descripcion' => 'Pago de oficina'],
            ['nombre' => 'Sueldos', 'descripcion' => 'Personal administrativo'],
            ['nombre' => 'Transporte', 'descripcion' => 'Movilidad y viáticos'],
            ['nombre' => 'Suministros', 'descripcion' => 'Papelería y oficina'],
            ['nombre' => 'Otros', 'descripcion' => 'Gastos varios'],
        ];

        foreach ($categorias as $cat) {
            DB::table('categorias_gastos')->insert(array_merge($cat, [
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
