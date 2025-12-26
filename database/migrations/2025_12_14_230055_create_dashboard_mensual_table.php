<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_mensual', function (Blueprint $table) {
            $table->id();
            $table->integer('mes');
            $table->integer('anio');
            $table->decimal('total_prestado', 20, 2)->default(0);
            $table->decimal('total_cobrado', 20, 2)->default(0);
            $table->decimal('ganancias', 20, 2)->default(0);
            $table->decimal('gastos', 20, 2)->default(0);
            $table->decimal('perdidas', 20, 2)->default(0);
            $table->decimal('utilidad_neta', 20, 2)->default(0);
            $table->integer('prestamos_activos')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_mensual');
    }
};
