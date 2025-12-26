<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_gasto_id')->constrained('categorias_gastos');
            $table->string('descripcion');
            $table->decimal('monto', 20, 2);
            $table->foreignId('moneda_id')->constrained();
            $table->date('fecha');
            $table->foreignId('usuario_id')->constrained('users');
            $table->foreignId('caja_id')->constrained();
            $table->string('estado')->default('registrado');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos');
    }
};
