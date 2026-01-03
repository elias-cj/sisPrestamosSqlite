<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoriaGasto;

class CategoriaGastoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['nombre' => 'Alquiler', 'descripcion' => 'Pago de local u oficina', 'estado' => 'activo'],
            ['nombre' => 'Transporte', 'descripcion' => 'Gastos de gasolina, pasajes o mantenimiento de vehículos', 'estado' => 'activo'],
            ['nombre' => 'Papelería', 'descripcion' => 'Hojas, lapiceros y materiales de oficina', 'estado' => 'activo'],
            ['nombre' => 'Sueldos', 'descripcion' => 'Pago de personal', 'estado' => 'activo'],
            ['nombre' => 'Servicios Básicos', 'descripcion' => 'Agua, luz, internet, teléfono', 'estado' => 'activo'],
            ['nombre' => 'Mantenimiento', 'descripcion' => 'Reparaciones generales', 'estado' => 'activo'],
            ['nombre' => 'Marketing', 'descripcion' => 'Publicidad y promociones', 'estado' => 'activo'],
            ['nombre' => 'Diversos', 'descripcion' => 'Gastos no clasificados', 'estado' => 'activo'],
        ];

        foreach ($categories as $category) {
            CategoriaGasto::firstOrCreate(
                ['nombre' => $category['nombre']],
                $category
            );
        }
    }
}
