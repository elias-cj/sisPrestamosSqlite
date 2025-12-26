<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained()->onDelete('cascade');
            $table->decimal('monto', 20, 2);
            $table->decimal('interes', 5, 2);
            $table->foreignId('moneda_id')->constrained();
            $table->date('fecha_inicio');
            $table->enum('tipo_pago', ['diario', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual']);
            $table->integer('numero_cuotas');
            $table->decimal('valor_cuota', 20, 2);
            $table->string('estado')->default('activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};
