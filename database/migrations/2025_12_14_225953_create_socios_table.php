<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('socios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('documento')->unique();
            $table->string('telefono')->nullable();
            $table->decimal('capital_inicial', 20, 2)->default(0);
            $table->decimal('capital_disponible', 20, 2)->default(0);
            $table->decimal('capital_comprometido', 20, 2)->default(0);
            $table->decimal('ganancias_acumuladas', 20, 2)->default(0);
            $table->decimal('perdidas_acumuladas', 20, 2)->default(0);
            $table->decimal('porcentaje_ganancia_socio', 5, 2);
            $table->decimal('porcentaje_ganancia_dueno', 5, 2);
            $table->string('estado')->default('activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('socios');
    }
};
