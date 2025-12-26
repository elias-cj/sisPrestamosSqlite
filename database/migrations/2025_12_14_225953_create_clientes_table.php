<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('documento')->unique()->nullable(); // Nullable just in case, but prompt implies required. I'll make nullable if doc missing? No, unique indexes usually mean known. I'll make it unique but keep in mind seeders.
            $table->string('telefono')->nullable();
            $table->string('direccion')->nullable();
            $table->enum('estado_crediticio', ['normal', 'moroso', 'incobrable'])->default('normal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
