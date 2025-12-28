<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('permissions')->insert([
            ['nombre' => 'ruta.gps.ver', 'modulo' => 'rutas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'ruta.gps.capturar', 'modulo' => 'rutas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'ruta.gps.eliminar', 'modulo' => 'rutas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'ruta.administrar', 'modulo' => 'rutas', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('permissions')->whereIn('nombre', [
            'ruta.gps.ver',
            'ruta.gps.capturar',
            'ruta.gps.eliminar',
            'ruta.administrar'
        ])->delete();
    }
};
