<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestamo_socio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestamo_id')->constrained()->onDelete('cascade');
            $table->foreignId('socio_id')->constrained();
            $table->decimal('monto_aportado', 20, 2);
            $table->decimal('porcentaje_participacion', 5, 2);
            $table->decimal('porcentaje_ganancia_socio', 5, 2);
            $table->decimal('porcentaje_ganancia_dueno', 5, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamo_socio');
    }
};
