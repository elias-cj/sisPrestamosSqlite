<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cuota_id')->constrained();
            $table->decimal('monto_pagado', 20, 2);
            $table->date('fecha_pago');
            $table->decimal('mora', 20, 2)->default(0);
            $table->foreignId('usuario_id')->constrained('users');
            $table->unsignedBigInteger('caja_id'); // FK added later
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
