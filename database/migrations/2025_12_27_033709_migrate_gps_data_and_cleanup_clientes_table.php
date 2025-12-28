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
        // 1. Obtener datos actuales
        $clientes = DB::table('clientes')
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->get();

        // 2. Insertar en la nueva tabla
        foreach ($clientes as $cliente) {
            DB::table('cliente_ubicaciones')->insert([
                'cliente_id' => $cliente->id,
                'tipo' => 'hogar',
                'latitud' => $cliente->latitud,
                'longitud' => $cliente->longitud,
                'es_principal' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Eliminar columnas obsoletas
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['latitud', 'longitud']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
        });
        
        // El rollback de los datos insertados en cliente_ubicaciones 
        // ocurre automáticamente al borrar la tabla en su propia migración
    }
};
