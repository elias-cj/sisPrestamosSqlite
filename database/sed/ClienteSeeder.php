<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cliente;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        Cliente::create([
            'nombre' => 'Juan Pérez',
            'documento' => '12345678',
            'telefono' => '999888777',
            'direccion' => 'Av. Siempre Viva 123',
            'estado_crediticio' => 'normal'
        ]);
        
        Cliente::create([
            'nombre' => 'Maria Rodriguez',
            'documento' => '87654321',
            'telefono' => '999111222',
            'direccion' => 'Calle Falsa 123',
            'estado_crediticio' => 'normal'
        ]);
        
        Cliente::create([
            'nombre' => 'Carlos Moroso',
            'documento' => '11223344',
            'telefono' => '555666777',
            'direccion' => 'Callejon Sin Salida',
            'estado_crediticio' => 'moroso'
        ]);
    }
}
