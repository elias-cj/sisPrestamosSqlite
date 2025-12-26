<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ganancias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestamo_id')->constrained();
            $table->foreignId('socio_id')->constrained();
            $table->decimal('monto_ganancia_socio', 20, 2);
            $table->decimal('monto_ganancia_dueno', 20, 2);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ganancias');
    }
};
